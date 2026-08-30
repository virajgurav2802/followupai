import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  Flame,
  Plus,
  ArrowRight,
  Sparkles,
  Clock,
  Database,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  ShieldCheck,
  Target,
  Layers,
  RotateCw,
} from 'lucide-react';
import { KpiCard } from '../components/ui/KpiCard';
import { Button } from '../components/ui/Button';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';
import { leadService } from '../services/leadService';
import { followUpService } from '../services/followUpService';
import { aiActionService } from '../services/aiActionService';
import { demoSeedService } from '../services/demoSeedService';
import type { Lead, AIActionLog, FollowUp } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [actions, setActions] = useState<AIActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const [userLeads, userFollowUps, userActions] = await Promise.all([
        leadService.getLeads(user.uid),
        followUpService.getFollowUps(user.uid),
        aiActionService.getAIActions(user.uid),
      ]);
      setLeads(userLeads);
      setFollowUps(userFollowUps);
      setActions(userActions);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSeedDemoData = async () => {
    if (!user) return;
    try {
      setIsSeeding(true);
      await demoSeedService.seedDemoDataForUser(user.uid);
      await loadData();
    } catch (err: any) {
      console.error('Error seeding demo data:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Section 4: Real Firestore-derived Sales Health Summary Metrics
  const totalLeads = leads.length;
  const highPriorityLeads = leads.filter((l) => l.priority === 'HIGH').length;
  const followUpsDueToday = followUps.filter(
    (f) => f.status === 'Due Today' || f.status === 'Overdue'
  ).length;
  const messagesNeedingReview = leads.filter(
    (l) => l.followUpStatus !== 'Completed' && l.approvalStatus !== 'approved'
  ).length;
  const approvedFollowUps = leads.filter(
    (l) => l.followUpStatus !== 'Completed' && l.approvalStatus === 'approved'
  ).length;
  const completedFollowUps = followUps.filter((f) => f.status === 'Completed').length;

  // Section 5: Priority Pipeline (Top active high-value leads requiring execution)
  const priorityPipeline = useMemo(() => {
    return leads
      .filter((l) => l.followUpStatus !== 'Completed')
      .sort((a, b) => {
        const priorityRank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        const diff = (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
        if (diff !== 0) return diff;
        // Within same priority, due today or overdue first
        const urgentA = a.followUpStatus === 'Due Today' || a.followUpStatus === 'Overdue' ? 1 : 0;
        const urgentB = b.followUpStatus === 'Due Today' || b.followUpStatus === 'Overdue' ? 1 : 0;
        if (urgentA !== urgentB) return urgentB - urgentA;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      })
      .slice(0, 4);
  }, [leads]);

  // Section 6: Improved Attention Queue (5-Tier Ranking, Completed follow-ups MUST NOT appear)
  // 1. HIGH priority + Due Today + Needs Review
  // 2. HIGH priority + Due Today + Approved
  // 3. HIGH priority + Upcoming
  // 4. MEDIUM priority + Due Today
  // 5. Other active follow-ups
  const attentionQueue = useMemo(() => {
    return leads
      .filter((l) => l.followUpStatus !== 'Completed')
      .sort((a, b) => {
        const getTier = (lead: Lead) => {
          const isHigh = lead.priority === 'HIGH';
          const isMedium = lead.priority === 'MEDIUM';
          const isDueToday = lead.followUpStatus === 'Due Today' || lead.followUpStatus === 'Overdue';
          const isUpcoming = lead.followUpStatus === 'Upcoming' || lead.followUpStatus === 'Pending';
          const isApproved = lead.approvalStatus === 'approved' && (lead.isApproved || lead.draftMessage?.isApproved);

          if (isHigh && isDueToday && !isApproved) return 1; // Tier 1
          if (isHigh && isDueToday && isApproved) return 2;  // Tier 2
          if (isHigh && isUpcoming) return 3;               // Tier 3
          if (isMedium && isDueToday) return 4;             // Tier 4
          return 5;                                         // Tier 5
        };

        const tierA = getTier(a);
        const tierB = getTier(b);
        if (tierA !== tierB) return tierA - tierB;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [leads]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  };

  const displayName = userProfile?.displayName || user?.displayName || 'Sales Representative';

  // Section 11: Skeleton Loading States for Dashboard
  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-[#EBE9E2] rounded animate-pulse" />
            <div className="h-4 w-72 bg-[#EBE9E2] rounded animate-pulse" />
          </div>
        </div>

        {/* 6-KPI Skeleton Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 rounded-[12px] bg-white border border-[#E4E2DC] shadow-subtle animate-pulse space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-3 w-16 bg-[#EBE9E2] rounded" />
                <div className="h-6 w-6 bg-[#EBE9E2] rounded-full" />
              </div>
              <div className="h-7 w-12 bg-[#EBE9E2] rounded" />
              <div className="h-3 w-20 bg-[#EBE9E2] rounded" />
            </div>
          ))}
        </div>

        {/* Priority Pipeline & Queue Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="h-6 w-40 bg-[#EBE9E2] rounded animate-pulse" />
            <div className="p-6 rounded-[12px] bg-white border border-[#E4E2DC] shadow-subtle animate-pulse space-y-4">
              <div className="h-16 bg-[#FAF9F6] rounded border border-[#E4E2DC]" />
              <div className="h-16 bg-[#FAF9F6] rounded border border-[#E4E2DC]" />
            </div>
          </div>
          <div className="lg:col-span-6 space-y-4">
            <div className="h-6 w-40 bg-[#EBE9E2] rounded animate-pulse" />
            <div className="p-6 rounded-[12px] bg-white border border-[#E4E2DC] shadow-subtle animate-pulse space-y-4">
              <div className="h-16 bg-[#FAF9F6] rounded border border-[#E4E2DC]" />
              <div className="h-16 bg-[#FAF9F6] rounded border border-[#E4E2DC]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Section 12: Error State
  if (error) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-[#FDF2F2] border border-[#F5C2C2] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 text-[#B94A48]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#171A17]">{error}</h2>
          <p className="text-sm text-[#687068] mt-1">Please check your network connection and reload.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadData} leftIcon={<RotateCw className="w-3.5 h-3.5" />}>
          Retry Dashboard
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Top Welcome Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#171A17] tracking-tight">
            Sales Command Center
          </h1>
          <p className="text-sm text-[#687068] mt-1">
            Good morning, {displayName.split(' ')[0]}. Here is your prioritized pipeline for today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {leads.length === 0 && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Database className="w-3.5 h-3.5 text-[#1F5C48]" />}
              onClick={handleSeedDemoData}
              isLoading={isSeeding}
            >
              Load Demo Data
            </Button>
          )}

          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/leads/new')}
          >
            Add Lead
          </Button>
        </div>
      </motion.div>

      {/* Section 4: Sales Health Summary (6 Real Firestore-Derived KPI Cards) */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
      >
        <KpiCard
          label="Total Leads"
          value={totalLeads}
          sublabel="In active pipeline"
          icon={<Users className="w-4 h-4" />}
        />
        <KpiCard
          label="High Priority"
          value={highPriorityLeads}
          sublabel="Urgent buyer interest"
          icon={<Flame className="w-4 h-4 text-[#B58A52]" />}
          isUrgent={highPriorityLeads > 0}
        />
        <KpiCard
          label="Due Today"
          value={followUpsDueToday}
          sublabel="Action required"
          icon={<CalendarCheck className="w-4 h-4" />}
          isUrgent={followUpsDueToday > 0}
        />
        <KpiCard
          label="Needs Review"
          value={messagesNeedingReview}
          sublabel="Awaiting rep approval"
          icon={<AlertCircle className="w-4 h-4 text-[#B7791F]" />}
          isUrgent={messagesNeedingReview > 0}
        />
        <KpiCard
          label="Approved"
          value={approvedFollowUps}
          sublabel="Ready to execute"
          icon={<ShieldCheck className="w-4 h-4 text-[#2F7D5B]" />}
        />
        <KpiCard
          label="Completed"
          value={completedFollowUps}
          sublabel="Touchpoints logged"
          icon={<CheckCheck className="w-4 h-4 text-[#2F7D5B]" />}
        />
      </motion.div>

      {/* Two-Column Intelligence Command Layout: Priority Pipeline (Left) & Attention Queue (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 5: Priority Pipeline (6 Cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#171A17] tracking-tight flex items-center gap-2">
                <Target className="w-4 h-4 text-[#1F5C48]" />
                Priority Pipeline
              </h2>
              <p className="text-xs text-[#687068] mt-0.5">
                Highest-value opportunities ranked by deal importance and timing.
              </p>
            </div>
            {leads.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/leads')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View all
              </Button>
            )}
          </div>

          {priorityPipeline.length === 0 ? (
            <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-subtle p-8">
              <EmptyState
                icon={<Flame className="w-5 h-5 text-[#B58A52]" />}
                title={leads.length === 0 ? 'Your pipeline is empty.' : 'No high-priority leads currently require attention.'}
                description={
                  leads.length === 0
                    ? 'Add your first lead to start generating sales intelligence.'
                    : 'Your high-value opportunities are currently under control.'
                }
                actionLabel={leads.length === 0 ? 'Add Lead' : undefined}
                onAction={() => navigate('/leads/new')}
              />
            </div>
          ) : (
            <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-subtle divide-y divide-[#E4E2DC] overflow-hidden">
              {priorityPipeline.map((lead) => {
                const dealStage = lead.dealStage || lead.stage || lead.aiAnalysis?.dealStage || 'Discovery';
                const isApproved = lead.approvalStatus === 'approved' && (lead.isApproved || lead.draftMessage?.isApproved);

                return (
                  <div
                    key={lead.id}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="p-4 sm:p-5 hover:bg-[#FAF9F6] transition-colors cursor-pointer space-y-3 group"
                  >
                    {/* Header Row: Prospect, Company, Priority & Stage */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-[#171A17] group-hover:text-[#1F5C48] transition-colors">
                            {lead.name}
                          </h3>
                          <span className="text-xs text-[#687068]">·</span>
                          <span className="text-xs font-medium text-[#687068]">{lead.company}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <PriorityBadge priority={lead.priority} size="sm" />
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#687068] font-medium">
                            <Layers className="w-3 h-3 text-[#1F5C48]" />
                            {dealStage}
                          </span>
                        </div>
                      </div>

                      {/* Follow-up Date Tag */}
                      <span className="text-xs font-medium text-[#171A17] flex items-center gap-1 bg-[#FAF9F6] px-2.5 py-1 rounded-[6px] border border-[#E4E2DC] shrink-0">
                        <Clock className="w-3.5 h-3.5 text-[#1F5C48]" />
                        {lead.followUpDueDate}
                      </span>
                    </div>

                    {/* AI Recommended Action snippet */}
                    <div className="text-xs bg-[#FAF9F6] p-3 rounded-[8px] border border-[#E4E2DC] space-y-1">
                      <span className="text-[10px] font-semibold text-[#687068] uppercase tracking-wider block">
                        Recommended Next Step
                      </span>
                      <p className="text-[#171A17] font-medium line-clamp-2 leading-relaxed">
                        {lead.recommendedAction?.action || 'Review conversation context'}
                      </p>
                    </div>

                    {/* Footer Row: Message State & Action */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#F2F1ED] text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-[#687068] uppercase tracking-wider">
                          Message:
                        </span>
                        {isApproved ? (
                          <Badge variant="success" size="sm" className="gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#2F7D5B]" />
                            ✓ Approved
                          </Badge>
                        ) : (
                          <Badge variant="warning" size="sm" className="gap-1">
                            <AlertCircle className="w-3 h-3 text-[#B7791F]" />
                            Needs Review
                          </Badge>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/leads/${lead.id}`);
                        }}
                      >
                        View Lead
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Section 6: Improved Attention Queue (6 Cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#171A17] tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1F5C48]" />
                Attention Queue
              </h2>
              <p className="text-xs text-[#687068] mt-0.5">
                Urgent touchpoints ranked by immediacy, priority, and review state.
              </p>
            </div>
            {followUps.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/follow-ups')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Follow-ups
              </Button>
            )}
          </div>

          {attentionQueue.length === 0 ? (
            <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-subtle p-8">
              <EmptyState
                icon={<CalendarCheck className="w-5 h-5 text-[#2F7D5B]" />}
                title={leads.length === 0 ? 'No leads in pipeline yet' : "You're all caught up."}
                description={
                  leads.length === 0
                    ? 'Add your first prospect or load demo data to begin tracking sales follow-ups.'
                    : 'No follow-ups currently require your attention.'
                }
                actionLabel={leads.length === 0 ? 'Add Lead' : undefined}
                onAction={() => navigate('/leads/new')}
              />
            </div>
          ) : (
            <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-subtle divide-y divide-[#E4E2DC] overflow-hidden">
              {attentionQueue.slice(0, 5).map((lead) => {
                const isApproved = lead.approvalStatus === 'approved' && (lead.isApproved || lead.draftMessage?.isApproved);

                return (
                  <div
                    key={lead.id}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="p-4 sm:p-5 hover:bg-[#FAF9F6] transition-colors cursor-pointer space-y-3 group"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-[#171A17] group-hover:text-[#1F5C48] transition-colors">
                            {lead.name}
                          </h3>
                          <span className="text-xs text-[#687068]">·</span>
                          <span className="text-xs font-medium text-[#687068]">{lead.company}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <PriorityBadge priority={lead.priority} size="sm" />
                          {lead.followUpStatus === 'Due Today' && (
                            <Badge variant="warning" size="sm">Due Today</Badge>
                          )}
                          {lead.followUpStatus === 'Overdue' && (
                            <Badge variant="error" size="sm">Overdue</Badge>
                          )}
                        </div>
                      </div>

                      <span className="text-xs font-medium text-[#171A17] flex items-center gap-1 bg-[#FAF9F6] px-2.5 py-1 rounded-[6px] border border-[#E4E2DC] shrink-0">
                        <Clock className="w-3.5 h-3.5 text-[#1F5C48]" />
                        {lead.followUpDueDate}
                      </span>
                    </div>

                    {/* Recommended Action */}
                    <p className="text-xs text-[#454D45] leading-relaxed line-clamp-2">
                      <strong className="text-[#171A17] font-medium">Next Action: </strong>
                      {lead.recommendedAction?.action || 'Review conversation notes'}
                    </p>

                    {/* Footer Row: Message State & Review Action */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#F2F1ED] text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-[#687068] uppercase tracking-wider">
                          Message:
                        </span>
                        {isApproved ? (
                          <Badge variant="success" size="sm" className="gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#2F7D5B]" />
                            ✓ Approved
                          </Badge>
                        ) : (
                          <Badge variant="warning" size="sm" className="gap-1">
                            <AlertCircle className="w-3 h-3 text-[#B7791F]" />
                            Needs Review
                          </Badge>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/leads/${lead.id}`);
                        }}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activity Timeline Section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#171A17] tracking-tight">
              Recent Intelligence Activity
            </h2>
            <p className="text-xs text-[#687068] mt-0.5">
              Live audit stream of autonomous evaluations, priority tagging, and approval milestones.
            </p>
          </div>
          {actions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/ai-actions')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Audit feed
            </Button>
          )}
        </div>

        <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-subtle p-5">
          {actions.length === 0 ? (
            <p className="text-xs text-[#687068] text-center py-6">
              No recent AI actions recorded. Actions will appear as you analyze leads.
            </p>
          ) : (
            <div className="divide-y divide-[#E4E2DC]">
              {actions.slice(0, 5).map((action) => (
                <div key={action.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-[6px] bg-[#FAF9F6] border border-[#E4E2DC] flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#946E3D]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-[#171A17]">{action.title}</p>
                        <span className="text-xs text-[#687068]">·</span>
                        <span className="text-xs font-medium text-[#1F5C48]">
                          {action.leadName} ({action.company})
                        </span>
                      </div>
                      <p className="text-xs text-[#687068] mt-0.5 leading-relaxed">{action.details}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#8D968D] shrink-0">{action.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
