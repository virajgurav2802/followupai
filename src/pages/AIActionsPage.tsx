import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Filter,
  Flame,
  CalendarCheck,
  MessageSquare,
  Edit3,
  RotateCcw,
  PlusCircle,
  AlertCircle,
  RotateCw,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';
import { aiActionService } from '../services/aiActionService';
import type { AIActionLog } from '../types';

export const AIActionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [actions, setActions] = useState<AIActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  const loadActions = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await aiActionService.getAIActions(user.uid);
      setActions(data);
    } catch (err) {
      console.error('Error loading AI actions:', err);
      setError('Unable to load AI action logs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  const filteredActions = actions.filter((act) => {
    if (filter === 'ALL') return true;
    if (filter === 'Completed') return act.status === 'Completed';
    if (filter === 'Awaiting Approval') return act.status === 'Awaiting Approval';
    if (filter === 'Recommended') return act.status === 'Recommended';
    if (filter === 'Executed') return act.status === 'Executed';
    return act.actionType === filter;
  });

  const getStatusBadge = (status: AIActionLog['status']) => {
    switch (status) {
      case 'Completed':
        return (
          <Badge variant="success" size="sm" className="gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#2F7D5B]" />
            Completed
          </Badge>
        );
      case 'Awaiting Approval':
        return (
          <Badge variant="warning" size="sm" className="gap-1">
            <Clock className="w-3 h-3 text-[#B7791F]" />
            Awaiting Approval
          </Badge>
        );
      case 'Recommended':
        return (
          <Badge variant="brass" size="sm" className="gap-1">
            <Sparkles className="w-3 h-3 text-[#946E3D]" />
            Recommended
          </Badge>
        );
      case 'Executed':
        return (
          <Badge variant="forest" size="sm" className="gap-1">
            <ShieldCheck className="w-3 h-3 text-[#1F5C48]" />
            Executed
          </Badge>
        );
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const getActionIcon = (actionType?: string) => {
    switch (actionType) {
      case 'lead_created':
        return <PlusCircle className="w-4 h-4 text-[#1F5C48]" />;
      case 'lead_analyzed':
        return <Sparkles className="w-4 h-4 text-[#946E3D]" />;
      case 'priority_detected':
        return <Flame className="w-4 h-4 text-[#B58A52]" />;
      case 'followup_recommended':
        return <CalendarCheck className="w-4 h-4 text-[#1F5C48]" />;
      case 'message_generated':
        return <MessageSquare className="w-4 h-4 text-[#B7791F]" />;
      case 'message_edited':
        return <Edit3 className="w-4 h-4 text-[#B7791F]" />;
      case 'message_regenerated':
        return <RotateCcw className="w-4 h-4 text-[#946E3D]" />;
      case 'follow_up_approved':
        return <CheckCircle2 className="w-4 h-4 text-[#2F7D5B]" />;
      case 'follow_up_completed':
        return <ShieldCheck className="w-4 h-4 text-[#2F7D5B]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#946E3D]" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-[#EBE9E2] rounded animate-pulse" />
          <div className="h-4 w-72 bg-[#EBE9E2] rounded animate-pulse" />
        </div>
        <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-subtle p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-[#F2F1ED] last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#EBE9E2] rounded-[8px] animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-[#EBE9E2] rounded animate-pulse" />
                  <div className="h-3 w-64 bg-[#EBE9E2] rounded animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-24 bg-[#EBE9E2] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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
        <Button variant="secondary" size="sm" onClick={loadActions} leftIcon={<RotateCw className="w-3.5 h-3.5" />}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171A17] tracking-tight">
            AI Actions Audit Trail
          </h1>
          <p className="text-sm text-[#687068] mt-1">
            Complete audit stream of autonomous intelligence evaluations, priority tagging, and human approval milestones.
          </p>
        </div>

        {/* Filter controls */}
        {actions.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#687068]" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-[#E4E2DC] rounded-[8px] text-[#171A17] font-medium focus:outline-none focus:border-[#1F5C48]"
            >
              <option value="ALL">All Actions</option>
              <option value="Completed">Completed</option>
              <option value="Awaiting Approval">Awaiting Approval</option>
              <option value="Recommended">Recommended</option>
              <option value="Executed">Executed</option>
            </select>
          </div>
        )}
      </div>

      {/* Activity Feed Container */}
      {filteredActions.length === 0 ? (
        <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-subtle p-8">
          <EmptyState
            icon={<Sparkles className="w-5 h-5 text-[#946E3D]" />}
            title="No AI action records yet"
            description="Intelligence actions such as lead analysis, priority detection, and human approvals will be automatically recorded here."
            actionLabel={actions.length === 0 ? 'Add Lead' : undefined}
            onAction={() => navigate('/leads/new')}
          />
        </div>
      ) : (
        <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-subtle divide-y divide-[#E4E2DC] overflow-hidden">
          {filteredActions.map((action) => (
            <div
              key={action.id}
              onClick={() => action.leadId && navigate(`/leads/${action.leadId}`)}
              className="p-5 hover:bg-[#FAF9F6] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-[8px] bg-[#FAF9F6] border border-[#E4E2DC] flex items-center justify-center shrink-0 mt-0.5 group-hover:border-[#1F5C48]/30 transition-colors">
                  {getActionIcon(action.actionType)}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#171A17] group-hover:text-[#1F5C48] transition-colors">
                      {action.title}
                    </h3>
                    {action.leadName && (
                      <>
                        <span className="text-xs text-[#687068]">·</span>
                        <span className="text-xs font-medium text-[#1F5C48]">
                          {action.leadName} ({action.company})
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-[#687068] leading-relaxed max-w-2xl">
                    {action.details}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                {getStatusBadge(action.status)}
                <span className="text-[11px] text-[#8D968D]">
                  {action.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
