import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  Mail,
  Calendar,
  Clock,
  MessageSquareText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RotateCw,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { Badge } from '../components/ui/Badge';
import { AIAnalysisPanel } from '../components/ai/AIAnalysisPanel';
import { AIRecommendationPanel } from '../components/ai/AIRecommendationPanel';
import { MessageComposer } from '../components/ai/MessageComposer';
import { ActivityTimeline } from '../components/leads/ActivityTimeline';
import { useAuth } from '../context/AuthContext';
import { leadService } from '../services/leadService';
import { followUpService } from '../services/followUpService';
import { agentService } from '../services/agentService';
import { aiService } from '../services/aiService';
import type { Lead } from '../types';

export const LeadDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeSuccess, setCompleteSuccess] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const loadLead = useCallback(async () => {
    if (!id || !user) return;
    try {
      setLoading(true);
      const data = await leadService.getLead(id, user.uid);
      if (!data) {
        setErrorMessage('Lead not found or you do not have permission to access it.');
        setLead(null);
      } else {
        setLead(data);
      }
    } catch (err: any) {
      console.error('Error fetching lead details:', err);
      setErrorMessage('Unable to load lead details from Firestore.');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  const isApproved =
    Boolean(lead) &&
    lead?.approvalStatus === 'approved' &&
    (lead?.isApproved === true || lead?.draftMessage?.isApproved === true);

  const canComplete =
    isApproved === true &&
    lead?.followUpStatus !== 'Completed';

  const handleSaveEdited = async (updatedMessage: string) => {
    if (!lead || !user) return;
    try {
      const updated = await leadService.saveEditedMessage(lead.id, user.uid, updatedMessage);
      setLead(updated);
    } catch (error: any) {
      console.error('Error saving edited message:', error);
      throw new Error('Unable to save your message. Your existing message has been preserved.');
    }
  };

  const handleApprove = async (updatedMessage: string) => {
    if (!lead || !user) return;
    try {
      const updated = await leadService.approveFollowUp(lead.id, user.uid, updatedMessage);
      setLead(updated);
    } catch (error: any) {
      console.error('Error approving lead follow-up:', error);
      throw new Error('Unable to approve the follow-up. Your current message has not been lost.');
    }
  };

  const handleRegenerateMessage = async (): Promise<string | void> => {
    if (!lead || !user) return;
    const res = await aiService.regenerateMessage({
      prospectName: lead.name,
      company: lead.company,
      email: lead.email,
      conversation: lead.originalConversation,
      intent: lead.intent,
      recommendedAction: lead.recommendedAction?.action,
      existingMessage: lead.draftMessage?.message,
    });

    if (res?.draftMessage) {
      try {
        const updated = await leadService.saveRegeneratedMessage(lead.id, user.uid, res.draftMessage);
        setLead(updated);
      } catch (err) {
        console.warn('Failed to persist regenerated message to Firestore:', err);
      }
      return res.draftMessage.message;
    }
  };

  const handleMarkComplete = async () => {
    if (!lead || !user || isCompleting) return;
    if (!canComplete) {
      setCompleteError('Review & Approve the message before marking the follow-up complete.');
      return;
    }
    setIsCompleting(true);
    setCompleteError(null);
    try {
      const followUpId = `followup-${lead.id}`;
      await followUpService.completeFollowUp(followUpId, lead.id, user.uid);
      setLead((prev) => {
        if (!prev) return prev;
        const updatedTimeline = [
          ...(prev.timeline || []),
          {
            id: `t-${Date.now()}-complete`,
            date: 'Today',
            title: 'Follow-up completed',
            description: 'Salesperson marked follow-up touchpoint as completed.',
            type: 'completed' as const,
          },
        ];
        return {
          ...prev,
          followUpStatus: 'Completed',
          timeline: updatedTimeline,
        };
      });
      setCompleteSuccess(true);
    } catch (err: any) {
      console.error('Error marking follow-up complete:', err);
      setCompleteError(err.message || 'Unable to update follow-up. Your existing data has not been removed.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleRetryAnalysis = async () => {
    if (!lead || isRetrying) return;
    setIsRetrying(true);
    setRetryError(null);
    try {
      const updatedLead = await agentService.retryLeadAnalysis(lead);
      setLead(updatedLead);
    } catch (err: any) {
      console.error('Retry analysis error:', err);
      setRetryError(err.message || 'Retry analysis failed. Please check server connection.');
    } finally {
      setIsRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#1F5C48]" />
        <p className="text-sm font-medium text-[#171A17]">Loading lead intelligence from Firestore...</p>
      </div>
    );
  }

  if (errorMessage || !lead) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-[#171A17]">Access Restricted or Not Found</h2>
        <p className="text-sm text-[#687068] leading-relaxed">
          {errorMessage || 'The requested lead does not exist or belongs to another user account.'}
        </p>
        <Button variant="secondary" onClick={() => navigate('/leads')}>
          Back to Leads
        </Button>
      </div>
    );
  }

  const isAnalysisDeferred = lead.analysisStatus === 'pending' || lead.analysisStatus === 'failed';

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/leads')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#687068] hover:text-[#171A17] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leads
        </button>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="sm">
            Added {new Date(lead.createdAt).toLocaleDateString() !== 'Invalid Date' ? new Date(lead.createdAt).toLocaleDateString() : lead.createdAt}
          </Badge>
        </div>
      </div>

      {/* Human Approval Success Banner */}
      {isApproved && lead.followUpStatus !== 'Completed' && (
        <div className="p-4 rounded-[12px] bg-[#EEF7F2] border border-[#C2E3D3] flex items-center gap-2.5 text-xs text-[#2F7D5B]">
          <CheckCircle2 className="w-4 h-4 text-[#2F7D5B] shrink-0" />
          <span className="font-medium">
            This message has been reviewed and approved by you. Ready for follow-up.
          </span>
        </div>
      )}

      {/* Follow-up Completion Success Banner */}
      {completeSuccess && (
        <div className="p-4 rounded-[12px] bg-[#EEF7F2] border border-[#C2E3D3] flex items-center gap-2.5 text-xs text-[#2F7D5B]">
          <CheckCircle2 className="w-4 h-4 text-[#2F7D5B] shrink-0" />
          <span className="font-medium">
            Follow-up marked as completed. Lead timeline and audit records have been updated.
          </span>
        </div>
      )}

      {/* Follow-up Completion Error Banner */}
      {completeError && (
        <div className="p-4 rounded-[12px] bg-[#FDF2F2] border border-[#F5C2C2] flex items-center gap-2.5 text-xs text-[#B94A48]">
          <AlertCircle className="w-4 h-4 text-[#B94A48] shrink-0" />
          <span className="font-medium">
            {completeError}
          </span>
        </div>
      )}

      {/* Deferred / Pending Analysis Banner */}
      {isAnalysisDeferred && (
        <div className="p-4 rounded-[12px] bg-[#FAF9F6] border border-[#D5D2C8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-[#B58A52] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#171A17] block">AI analysis is pending.</span>
              <span className="text-[#687068] block">
                The lead context has been saved safely. You can run AI sales analysis whenever you are ready.
              </span>
              {retryError && <span className="text-[#B94A48] mt-1 block font-medium">{retryError}</span>}
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRetryAnalysis}
            isLoading={isRetrying}
            leftIcon={<RotateCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />}
          >
            {isRetrying ? 'Analyzing...' : 'Retry Analysis'}
          </Button>
        </div>
      )}

      {/* LEAD OVERVIEW Header Card */}
      <div className="bg-white rounded-[16px] border border-[#E4E2DC] shadow-subtle p-6">
        <div className="text-[11px] font-semibold text-[#1F5C48] uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span>Lead Overview</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#171A17] tracking-tight">
                {lead.name}
              </h1>
              <PriorityBadge priority={lead.priority} />
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2 text-xs text-[#687068]">
              <div className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#1F5C48]" />
                <span className="font-medium text-[#171A17]">{lead.company}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#1F5C48]" />
                <span>{lead.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#1F5C48]" />
                <span>Stage: <strong className="text-[#171A17] font-medium">{lead.dealStage || lead.stage}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#1F5C48]" />
                <span>Due: <strong className="text-[#171A17] font-medium">{lead.followUpDueDate}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {lead.followUpStatus === 'Completed' ? (
              <Badge variant="success" size="md" className="gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2F7D5B]" />
                Follow-up Completed
              </Badge>
            ) : lead.followUpStatus === 'Overdue' ? (
              <Badge variant="error" size="md">Overdue Follow-up</Badge>
            ) : lead.followUpStatus === 'Due Today' ? (
              <Badge variant="warning" size="md">Due Today</Badge>
            ) : (
              <Badge variant="neutral" size="md">Upcoming</Badge>
            )}

            {/* Stage 5 Critical Approval Gating:
                Mark Follow-Up Complete is available ONLY when explicitly approved.
                It remains hidden/unavailable for Draft and Edited states. */}
            {canComplete && (
              <Button
                variant="primary"
                size="sm"
                className="bg-[#12231D] hover:bg-[#1F5C48]"
                isLoading={isCompleting}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-[#2F7D5B]" />}
                onClick={handleMarkComplete}
              >
                Mark Follow-Up Complete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Two-Column Desktop Intelligence Layout maintaining Stage 4 hierarchy:
          WHY (Reason) -> WHAT (Recommended Action) -> WHEN (Due Date) -> MESSAGE (Personalized Follow-up) -> DECISION (Human Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Context, Analysis, and Recommended Action (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* WHAT: Recommended Next Action & WHEN: Suggested Date */}
          <AIRecommendationPanel
            recommendation={lead.recommendedAction}
          />

          {/* WHY: AI Analysis Panel with Intent, Reason, Objections, Urgency */}
          <AIAnalysisPanel
            analysis={lead.aiAnalysis}
          />

          {/* Original Conversation Section */}
          <div className="rounded-[12px] bg-white border border-[#E4E2DC] shadow-subtle p-6">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E4E2DC]">
              <div className="flex items-center gap-2">
                <MessageSquareText className="w-4 h-4 text-[#1F5C48]" />
                <h3 className="text-sm font-semibold text-[#171A17]">
                  Original Conversation & Context
                </h3>
              </div>
              <span className="text-[11px] text-[#687068]">Recorded Input</span>
            </div>
            <div className="p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E4E2DC] text-xs sm:text-sm text-[#171A17] whitespace-pre-line leading-relaxed font-sans font-normal">
              {lead.originalConversation}
            </div>
          </div>
        </div>

        {/* Right Column: Personalized Follow-up Composer (MESSAGE & DECISION) & Activity Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* MESSAGE & DECISION: Personalized Follow-up Composer with Human Approval workflow */}
          <MessageComposer
            draftMessage={lead.draftMessage}
            approvalStatus={lead.approvalStatus}
            followUpStatus={lead.followUpStatus}
            onSaveEdited={handleSaveEdited}
            onApprove={handleApprove}
            onRegenerate={handleRegenerateMessage}
            onMarkComplete={handleMarkComplete}
            isCompleting={isCompleting}
          />

          {/* Activity Timeline recording all lead, analysis, edit, approval, and completion events */}
          <ActivityTimeline
            events={lead.timeline || []}
          />
        </div>
      </div>
    </div>
  );
};
