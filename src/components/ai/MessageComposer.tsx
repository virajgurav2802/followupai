import React, { useState, useEffect } from 'react';
import type { PersonalizedMessage, FollowUpStatus } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Check,
  Edit3,
  RotateCw,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Copy,
  AlertTriangle,
  AlertCircle,
  X,
} from 'lucide-react';

export interface MessageComposerProps {
  draftMessage?: PersonalizedMessage;
  approvalStatus?: 'draft' | 'edited' | 'approved';
  followUpStatus?: FollowUpStatus;
  onSaveEdited?: (updatedMessage: string) => Promise<void>;
  onApprove?: (updatedMessage: string) => Promise<void>;
  onSaveApproved?: (updatedMessage: string) => Promise<void> | void;
  onRegenerate?: () => Promise<string | void>;
  onMarkComplete?: () => Promise<void>;
  isLoading?: boolean;
  isCompleting?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  draftMessage,
  approvalStatus = 'draft',
  followUpStatus = 'Pending',
  onSaveEdited,
  onApprove,
  onSaveApproved,
  onRegenerate,
  onMarkComplete,
  isLoading = false,
  isCompleting = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [messageBody, setMessageBody] = useState(draftMessage?.message || '');
  const [originalSavedBody, setOriginalSavedBody] = useState(draftMessage?.message || '');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Status banners & feedback
  const [regenError, setRegenError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Sync state when props update
  useEffect(() => {
    if (draftMessage) {
      setMessageBody(draftMessage.message);
      setOriginalSavedBody(draftMessage.message);
    }
  }, [draftMessage]);

  if (isLoading || isRegenerating) {
    return (
      <div className="rounded-[12px] bg-white border border-[#E4E2DC] p-8 text-center space-y-3">
        <RotateCw className="w-5 h-5 text-[#1F5C48] animate-spin mx-auto" />
        <p className="text-sm font-medium text-[#171A17]">Generating a new follow-up...</p>
        <p className="text-xs text-[#687068]">Synthesizing deal context, buyer objections, and tailored next steps.</p>
      </div>
    );
  }

  if (!draftMessage) {
    return (
      <div className="rounded-[12px] bg-white border border-[#E4E2DC] p-6 text-center text-sm text-[#687068]">
        No follow-up message has been drafted yet.
      </div>
    );
  }

  const isCompleted = followUpStatus === 'Completed';
  const effectiveApprovalStatus: 'draft' | 'edited' | 'approved' =
    draftMessage.status || approvalStatus || (draftMessage.isApproved ? 'approved' : 'draft');
  const isApproved = effectiveApprovalStatus === 'approved' && Boolean(draftMessage.isApproved);

  // Stage 5 Section 2: Critical Approval Gating
  const canComplete = isApproved === true && effectiveApprovalStatus === 'approved' && !isCompleted;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageBody);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleRegenerate = async () => {
    if (isRegenerating || isCompleted) return;
    setIsRegenerating(true);
    setRegenError(null);
    setFeedbackMessage(null);

    try {
      if (onRegenerate) {
        const newMsg = await onRegenerate();
        if (typeof newMsg === 'string' && newMsg.trim()) {
          setMessageBody(newMsg);
          setOriginalSavedBody(newMsg);
        }
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to regenerate follow-up:', err);
      // Stage 5 Section 9 & 17 requirement:
      setRegenError('Unable to generate a new message. Your existing draft has been preserved.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (isSaving || isCompleted) return;
    setIsSaving(true);
    setRegenError(null);
    try {
      if (onSaveEdited) {
        await onSaveEdited(messageBody);
      }
      setOriginalSavedBody(messageBody);
      setIsEditing(false);
      setFeedbackMessage('Message saved as draft.');
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error('Failed to save edited message:', err);
      setRegenError('Unable to save your message. Your existing message has been preserved.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    if (isApproving || isCompleted) return;
    setIsApproving(true);
    setRegenError(null);
    try {
      if (onApprove) {
        await onApprove(messageBody);
      } else if (onSaveApproved) {
        await onSaveApproved(messageBody);
      }
      setOriginalSavedBody(messageBody);
      setIsEditing(false);
      setFeedbackMessage('This message has been reviewed and approved by you. Ready for follow-up.');
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error('Failed to approve follow-up:', err);
      setRegenError('Unable to approve the follow-up. Your current message has not been lost.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleCancelEdit = () => {
    setMessageBody(originalSavedBody);
    setIsEditing(false);
  };

  // Status Badge Component matching Stage 5 specification
  const renderStatusBadge = () => {
    if (isCompleted) {
      return (
        <Badge variant="success" size="sm" className="gap-1">
          <CheckCircle2 className="w-3 h-3 text-[#2F7D5B]" />
          Completed
        </Badge>
      );
    }
    if (isApproved) {
      return (
        <Badge variant="success" size="sm" className="gap-1">
          <CheckCircle2 className="w-3 h-3 text-[#2F7D5B]" />
          Approved
        </Badge>
      );
    }
    if (effectiveApprovalStatus === 'edited') {
      return (
        <Badge variant="warning" size="sm" className="gap-1">
          <Edit3 className="w-3 h-3 text-[#B7791F]" />
          Edited
        </Badge>
      );
    }
    return (
      <Badge variant="neutral" size="sm" className="gap-1">
        <ShieldCheck className="w-3 h-3 text-[#687068]" />
        Draft
      </Badge>
    );
  };

  return (
    <div className="rounded-[12px] bg-white border border-[#E4E2DC] shadow-subtle overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E4E2DC] flex items-center justify-between bg-[#FAF9F6]">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#1F5C48]" />
          <h3 className="text-sm font-semibold text-[#171A17]">
            Personalized Follow-Up
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#687068]">Status:</span>
          {renderStatusBadge()}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Recipient & Subject Header per Section 8 */}
        <div className="space-y-2 text-xs border-b border-[#E4E2DC] pb-3">
          <div className="flex items-center">
            <span className="w-16 font-semibold text-[#687068] uppercase tracking-wider">To:</span>
            <span className="text-[#171A17] font-medium">{draftMessage.to}</span>
          </div>
          <div className="flex items-center">
            <span className="w-16 font-semibold text-[#687068] uppercase tracking-wider">Subject:</span>
            <span className="text-[#171A17] font-medium">{draftMessage.subject}</span>
          </div>
        </div>

        {/* Warning when editing an already approved message per Section 3 */}
        {isEditing && isApproved && (
          <div className="p-3 rounded-[8px] bg-[#FFF8E6] border border-[#F0D597] flex items-start gap-2.5 text-xs text-[#8A5800]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#B7791F]" />
            <div>
              <strong className="font-semibold block">Approval will be reset:</strong>
              Editing this approved message requires approval again before completion is permitted.
            </div>
          </div>
        )}

        {/* Error banner per Section 17 */}
        {regenError && (
          <div className="p-3 rounded-[8px] bg-[#FDF2F2] border border-[#F5C2C2] flex items-center justify-between gap-2.5 text-xs text-[#B94A48]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#B94A48]" />
              <span>{regenError}</span>
            </div>
            <button
              type="button"
              onClick={() => setRegenError(null)}
              className="text-[#B94A48] hover:text-[#171A17]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Feedback / Notification Banner */}
        {feedbackMessage && (
          <div className="p-3 rounded-[8px] bg-[#EEF7F2] border border-[#C2E3D3] flex items-center gap-2.5 text-xs text-[#2F7D5B]">
            <CheckCircle2 className="w-4 h-4 text-[#2F7D5B] shrink-0" />
            <span className="font-medium">{feedbackMessage}</span>
          </div>
        )}

        {/* Copy Success Banner */}
        {copySuccess && (
          <div className="p-3 rounded-[8px] bg-[#EEF7F2] border border-[#C2E3D3] flex items-center gap-2.5 text-xs text-[#2F7D5B]">
            <CheckCircle2 className="w-4 h-4 text-[#2F7D5B] shrink-0" />
            <span className="font-medium">Message copied to clipboard.</span>
          </div>
        )}

        {/* Message Container */}
        <div>
          {isEditing ? (
            <textarea
              rows={8}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="w-full p-3.5 text-sm font-normal text-[#171A17] bg-[#FAF9F6] border border-[#1F5C48] rounded-[8px] focus:outline-none leading-relaxed font-sans"
              placeholder="Edit draft message..."
            />
          ) : (
            <div className="p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E4E2DC] text-sm text-[#171A17] whitespace-pre-line leading-relaxed font-sans">
              {messageBody}
            </div>
          )}
        </div>

        {/* Human in the loop policy notice */}
        <div className="p-3 rounded-[8px] bg-[#FAF9F6] border border-[#E4E2DC] flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#1F5C48] shrink-0 mt-0.5" />
          <div className="text-xs text-[#687068] leading-relaxed">
            <strong className="text-[#171A17] font-medium">Human-in-the-Loop Workflow: </strong>
            Follow-up messages are recommended by AI, but require explicit salesperson review and approval. No message is ever dispatched automatically.
          </div>
        </div>

        {/* Critical Guidance Box when completion is gated per Section 2 */}
        {!isCompleted && !canComplete && !isEditing && (
          <div className="p-3 rounded-[8px] bg-[#FAF9F6] border border-[#D5D2C8] flex items-center gap-2.5 text-xs text-[#687068]">
            <AlertCircle className="w-4 h-4 text-[#B58A52] shrink-0" />
            <span>
              Review & Approve the message before marking the follow-up complete.
            </span>
          </div>
        )}

        {/* Actions Bar */}
        <div className="pt-3 border-t border-[#E4E2DC] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                  onClick={handleSaveEdit}
                  isLoading={isSaving}
                >
                  Save Changes
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  onClick={() => setIsEditing(true)}
                  disabled={isCompleted || isRegenerating}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />}
                  onClick={handleRegenerate}
                  disabled={isCompleted || isRegenerating}
                >
                  {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                  onClick={handleCopy}
                >
                  Copy Message
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted && !isEditing && (
              <>
                {!isApproved ? (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                    onClick={handleApprove}
                    isLoading={isApproving}
                    disabled={isRegenerating}
                  >
                    Approve Follow-Up
                  </Button>
                ) : (
                  <Badge variant="success" size="md" className="gap-1 px-3 py-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#2F7D5B]" />
                    ✓ Follow-up Approved
                  </Badge>
                )}

                {/* Mark Follow-Up Complete action ONLY when approved per Section 2 & 9 */}
                {canComplete && onMarkComplete && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-[#12231D] hover:bg-[#1F5C48]"
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-[#2F7D5B]" />}
                    onClick={onMarkComplete}
                    isLoading={isCompleting}
                  >
                    Mark Follow-Up Complete
                  </Button>
                )}
              </>
            )}

            {isCompleted && (
              <Badge variant="success" size="md" className="gap-1.5 px-3 py-1.5 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#2F7D5B]" />
                Completed
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
