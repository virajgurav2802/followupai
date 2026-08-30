import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CalendarCheck,
  Calendar,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Flame,
  CheckCheck,
  Layers,
  Sparkles,
  RotateCw,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';
import { followUpService } from '../services/followUpService';
import type { FollowUp, Priority } from '../types';

export type FollowUpFilter = 'ALL' | 'DUE_TODAY' | 'UPCOMING' | 'HIGH_PRIORITY' | 'COMPLETED';
export type FollowUpSort = 'PRIORITY' | 'DUE_DATE' | 'RECENTLY_CREATED';

export const FollowUpsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<FollowUpFilter>('ALL');
  const [activeSort, setActiveSort] = useState<FollowUpSort>('PRIORITY');

  const loadFollowUps = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await followUpService.getFollowUps(user.uid);
      setFollowUps(data);
    } catch (err: any) {
      console.error('Error fetching follow-ups:', err);
      setError('Unable to load follow-ups. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFollowUps();
  }, [loadFollowUps]);

  const handleMarkComplete = async (item: FollowUp, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || completingId) return;

    setCompletingId(item.id);
    setActionError(null);

    try {
      await followUpService.completeFollowUp(item.id, item.leadId, user.uid);
      setFollowUps((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, status: 'Completed', updatedAt: new Date().toISOString() } : f
        )
      );
    } catch (err: any) {
      console.error('Error completing follow-up:', err);
      setActionError('Unable to update follow-up. Your existing data has not been removed.');
    } finally {
      setCompletingId(null);
    }
  };

  // Counts for filters
  const counts = useMemo(() => {
    const dueToday = followUps.filter((f) => f.status === 'Due Today').length;
    const upcoming = followUps.filter((f) => f.status === 'Upcoming' || f.status === 'Pending').length;
    const highPriority = followUps.filter((f) => f.priority === 'HIGH').length;
    const completed = followUps.filter((f) => f.status === 'Completed').length;
    return {
      all: followUps.length,
      dueToday,
      upcoming,
      highPriority,
      completed,
    };
  }, [followUps]);

  // Filtering & Sorting
  const displayedFollowUps = useMemo(() => {
    // 1. Filter
    const filtered = followUps.filter((item) => {
      switch (activeFilter) {
        case 'DUE_TODAY':
          return item.status === 'Due Today';
        case 'UPCOMING':
          return item.status === 'Upcoming' || item.status === 'Pending';
        case 'HIGH_PRIORITY':
          return item.priority === 'HIGH';
        case 'COMPLETED':
          return item.status === 'Completed';
        case 'ALL':
        default:
          return true;
      }
    });

    // 2. Sort
    return [...filtered].sort((a, b) => {
      if (activeSort === 'PRIORITY') {
        // Priority rank: HIGH (3), MEDIUM (2), LOW (1)
        const priorityRank: Record<Priority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        const rankDiff = (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
        if (rankDiff !== 0) return rankDiff;

        // Then non-completed before completed
        if (a.status === 'Completed' && b.status !== 'Completed') return 1;
        if (a.status !== 'Completed' && b.status === 'Completed') return -1;

        // Then Due Today before others
        if (a.status === 'Due Today' && b.status !== 'Due Today') return -1;
        if (a.status !== 'Due Today' && b.status === 'Due Today') return 1;

        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }

      if (activeSort === 'DUE_DATE') {
        // Due Today first, then compare dueDate strings or createdAt
        if (a.status === 'Due Today' && b.status !== 'Due Today') return -1;
        if (a.status !== 'Due Today' && b.status === 'Due Today') return 1;
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      }

      if (activeSort === 'RECENTLY_CREATED') {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      }

      return 0;
    });
  }, [followUps, activeFilter, activeSort]);

  // Loading skeleton matching Forest Executive design
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-[#EBE9E2] rounded animate-pulse" />
            <div className="h-4 w-72 bg-[#EBE9E2] rounded animate-pulse" />
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-[#E4E2DC] pb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-24 bg-[#EBE9E2] rounded-[8px] animate-pulse" />
          ))}
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-[12px] bg-white border border-[#E4E2DC] shadow-subtle animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-40 bg-[#EBE9E2] rounded" />
                <div className="h-5 w-20 bg-[#EBE9E2] rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-16 bg-[#FAF9F6] rounded border border-[#E4E2DC]" />
                <div className="h-16 bg-[#FAF9F6] rounded border border-[#E4E2DC]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state per Section 20
  if (error) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-[#FDF2F2] border border-[#F5C2C2] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 text-[#B94A48]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#171A17]">Unable to load follow-ups.</h2>
          <p className="text-sm text-[#687068] mt-1">Please try again.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadFollowUps} leftIcon={<RotateCw className="w-3.5 h-3.5" />}>
          Retry Connection
        </Button>
      </div>
    );
  }

  const renderFollowUpCard = (item: FollowUp) => {
    const isCompleted = item.status === 'Completed';
    const isHighPriority = item.priority === 'HIGH';
    const isCurrentlyCompleting = completingId === item.id;
    const isApproved = item.isApproved === true && item.messageApprovalStatus === 'approved';

    return (
      <div
        key={item.id}
        onClick={() => navigate(`/leads/${item.leadId}`)}
        className={`p-6 rounded-[12px] bg-white border transition-all cursor-pointer space-y-4 group ${
          isHighPriority
            ? 'border-[#CBB69D] shadow-sm hover:border-[#B58A52]'
            : 'border-[#E4E2DC] shadow-subtle hover:border-[#D5D2C8]'
        } ${isCompleted ? 'opacity-80 bg-[#FAFAFA]' : ''}`}
      >
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-base font-semibold text-[#171A17] group-hover:text-[#1F5C48] transition-colors">
                {item.prospectName}
              </h3>
              <span className="text-xs text-[#687068]">·</span>
              <span className="text-xs font-medium text-[#687068]">{item.company}</span>
              <PriorityBadge priority={item.priority} size="sm" />
            </div>

            {/* Deal Stage & Interest Level Attributes */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#687068] pt-0.5">
              {item.dealStage && (
                <span className="inline-flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#1F5C48]" />
                  Stage: <strong className="text-[#171A17] font-medium">{item.dealStage}</strong>
                </span>
              )}
              {item.interestLevel && (
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#B58A52]" />
                  Interest: <strong className="text-[#171A17] font-medium">{item.interestLevel}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Status Badge & Due Date */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Stage 5 Message State Indicator */}
            {isCompleted ? (
              <Badge variant="success" size="sm" className="gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2F7D5B]" />
                Completed
              </Badge>
            ) : isApproved ? (
              <Badge variant="success" size="sm" className="gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2F7D5B]" />
                Message: ✓ Approved
              </Badge>
            ) : (
              <Badge variant="warning" size="sm" className="gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-[#B7791F]" />
                Message: Needs Review
              </Badge>
            )}

            {item.status === 'Overdue' && (
              <Badge variant="error" size="sm">Overdue</Badge>
            )}
            {item.status === 'Due Today' && (
              <Badge variant="warning" size="sm">Due Today</Badge>
            )}
            {item.status === 'Upcoming' && (
              <Badge variant="neutral" size="sm">Upcoming</Badge>
            )}

            <span className="text-xs font-medium text-[#171A17] flex items-center gap-1 bg-[#FAF9F6] px-2.5 py-1 rounded-[6px] border border-[#E4E2DC]">
              <Clock className="w-3.5 h-3.5 text-[#1F5C48]" />
              {item.dueDate}
            </span>
          </div>
        </div>

        {/* Reason & Recommended Action Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[#FAF9F6] p-4 rounded-[8px] border border-[#E4E2DC]">
          <div className="space-y-1">
            <span className="font-semibold text-[#687068] uppercase tracking-wider block text-[10px]">
              Reason
            </span>
            <p className="text-[#171A17] leading-relaxed">
              {item.reason || 'Follow-up required to advance deal conversation.'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-[#687068] uppercase tracking-wider block text-[10px]">
              Recommended Action
            </span>
            <p className="text-[#171A17] font-medium leading-relaxed">
              {item.recommendedAction || 'Review conversation notes and reach out.'}
            </p>
          </div>
        </div>

        {/* Action Controls Footer adhering strictly to Stage 5 Section 13 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[#F2F1ED]">
          <div className="text-[11px] text-[#687068]">
            Target Window: <strong className="text-[#171A17] font-medium">{item.dueDate}</strong>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Draft / Edited: Show Review & Approve, NO active completion action */}
            {!isCompleted && !isApproved && (
              <Button
                size="sm"
                variant="primary"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/leads/${item.leadId}`);
                }}
              >
                Review & Approve
              </Button>
            )}

            {/* Approved: Show View Lead and Mark Follow-Up Complete */}
            {!isCompleted && isApproved && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/leads/${item.leadId}`);
                  }}
                >
                  View Lead
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-[#12231D] hover:bg-[#1F5C48]"
                  isLoading={isCurrentlyCompleting}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-[#2F7D5B]" />}
                  onClick={(e) => handleMarkComplete(item, e)}
                >
                  Mark Follow-Up Complete
                </Button>
              </>
            )}

            {/* Completed: Show View Lead, do not show completion button */}
            {isCompleted && (
              <Button
                size="sm"
                variant="secondary"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/leads/${item.leadId}`);
                }}
              >
                View Lead
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171A17] tracking-tight">
            Follow-Up Queue
          </h1>
          <p className="text-sm text-[#687068] mt-1">
            Intelligent pipeline touchpoints prioritized by buying intent and deal urgency.
          </p>
        </div>

        <Button onClick={() => navigate('/leads/new')}>
          + Add Lead
        </Button>
      </div>

      {/* Action Error Banner per Section 20 */}
      {actionError && (
        <div className="p-4 rounded-[12px] bg-[#FDF2F2] border border-[#F5C2C2] flex items-center justify-between gap-3 text-xs text-[#B94A48]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Sorting Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E2DC] pb-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-[#12231D] text-white'
                : 'text-[#687068] hover:text-[#171A17] hover:bg-[#FAF9F6]'
            }`}
          >
            All ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('DUE_TODAY')}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeFilter === 'DUE_TODAY'
                ? 'bg-[#1F5C48] text-white'
                : 'text-[#687068] hover:text-[#171A17] hover:bg-[#FAF9F6]'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            Due Today ({counts.dueToday})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('UPCOMING')}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeFilter === 'UPCOMING'
                ? 'bg-[#12231D] text-white'
                : 'text-[#687068] hover:text-[#171A17] hover:bg-[#FAF9F6]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Upcoming ({counts.upcoming})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('HIGH_PRIORITY')}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeFilter === 'HIGH_PRIORITY'
                ? 'bg-[#B58A52] text-white'
                : 'text-[#687068] hover:text-[#171A17] hover:bg-[#FAF9F6]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            High Priority ({counts.highPriority})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeFilter === 'COMPLETED'
                ? 'bg-[#2F7D5B] text-white'
                : 'text-[#687068] hover:text-[#171A17] hover:bg-[#FAF9F6]'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Completed ({counts.completed})
          </button>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 text-xs text-[#687068] shrink-0">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Sort by:</span>
          <select
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value as FollowUpSort)}
            className="bg-white border border-[#E4E2DC] rounded-[8px] px-2.5 py-1.5 text-xs text-[#171A17] font-medium focus:outline-none focus:border-[#1F5C48]"
          >
            <option value="PRIORITY">Priority (Most Important)</option>
            <option value="DUE_DATE">Due Date</option>
            <option value="RECENTLY_CREATED">Recently Created</option>
          </select>
        </div>
      </div>

      {/* Queue Listing */}
      <div className="space-y-4">
        {displayedFollowUps.length > 0 ? (
          displayedFollowUps.map(renderFollowUpCard)
        ) : (
          /* Exact Section 18 Empty States */
          <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-subtle p-8">
            {followUps.length === 0 ? (
              <EmptyState
                icon={<CalendarCheck className="w-5 h-5 text-[#2F7D5B]" />}
                title="You're all caught up."
                description="No follow-ups currently require your attention."
                actionLabel="Add Lead"
                onAction={() => navigate('/leads/new')}
              />
            ) : activeFilter === 'HIGH_PRIORITY' ? (
              <EmptyState
                icon={<Flame className="w-5 h-5 text-[#B58A52]" />}
                title="No high-priority leads currently require attention."
                description="Your pipeline is currently under control."
              />
            ) : activeFilter === 'COMPLETED' ? (
              <EmptyState
                icon={<CheckCheck className="w-5 h-5 text-[#2F7D5B]" />}
                title="No completed follow-ups yet."
                description="Follow-ups marked as complete will appear here for audit and historical review."
              />
            ) : (
              <EmptyState
                icon={<CalendarCheck className="w-5 h-5 text-[#2F7D5B]" />}
                title="You're all caught up."
                description="No follow-ups currently require your attention in this queue."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
