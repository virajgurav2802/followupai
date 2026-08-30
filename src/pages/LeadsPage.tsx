import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  ArrowRight,
  Clock,
  Filter,
  Database,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Layers,
  Zap,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';
import { leadService } from '../services/leadService';
import { demoSeedService } from '../services/demoSeedService';
import type { Lead, Priority } from '../types';

export const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dealStageFilter, setDealStageFilter] = useState<string>('ALL');
  const [signalFilter, setSignalFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'priority' | 'name' | 'company' | 'dueDate'>('priority');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const loadLeads = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userLeads = await leadService.getLeads(user.uid);
      setLeads(userLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleSeedDemoData = async () => {
    if (!user) return;
    try {
      setIsSeeding(true);
      await demoSeedService.seedDemoDataForUser(user.uid);
      await loadLeads();
    } catch (error) {
      console.error('Error seeding demo data:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  // Distinct dynamic deal stages derived from actual leads
  const availableDealStages = useMemo(() => {
    const stages = new Set<string>();
    leads.forEach((lead) => {
      const stage = lead.dealStage || lead.stage || lead.aiAnalysis?.dealStage;
      if (stage && stage !== 'Prospect' && stage !== 'AI Analyzed') {
        stages.add(stage);
      }
    });
    return Array.from(stages).sort();
  }, [leads]);

  // Section: Deduplicated dynamic Signals options (guarantees exactly one High, one Medium, one Low)
  const availableSignals = useMemo(() => {
    const validCanonical = ['High', 'Medium', 'Low'];
    const collected = new Set<string>();

    leads.forEach((lead) => {
      if (lead.interestLevel) collected.add(lead.interestLevel.trim());
      const urg = lead.urgency || lead.aiAnalysis?.urgency;
      if (urg) collected.add(urg.trim());
    });

    // Merge and strictly deduplicate case-insensitively while preserving standard title casing
    const uniqueNormalized = Array.from(
      new Set(
        [...validCanonical, ...Array.from(collected)]
          .filter((s) => ['high', 'medium', 'low'].includes(s.toLowerCase()))
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
      )
    );

    // Return strictly unique options in canonical order: High, Medium, Low
    return validCanonical.filter((c) => uniqueNormalized.includes(c));
  }, [leads]);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    priorityFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    dealStageFilter !== 'ALL' ||
    signalFilter !== 'ALL';

  const resetFilters = () => {
    setSearchTerm('');
    setPriorityFilter('ALL');
    setStatusFilter('ALL');
    setDealStageFilter('ALL');
    setSignalFilter('ALL');
  };

  // Multi-attribute search, filtering, and Stage 6 prioritization
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        // Section 2: Pipeline Search against Prospect name, Company, and Email
        const searchTarget = `${lead.name} ${lead.company} ${lead.email} ${lead.intent || ''}`.toLowerCase();
        const matchesSearch = !searchTerm.trim() || searchTarget.includes(searchTerm.toLowerCase().trim());

        // Section 3: Priority Filter
        const matchesPriority = priorityFilter === 'ALL' || lead.priority === priorityFilter;

        // Section 3: Follow-Up Filter
        let matchesStatus = true;
        if (statusFilter === 'Due Today') {
          matchesStatus = lead.followUpStatus === 'Due Today' || lead.followUpStatus === 'Overdue';
        } else if (statusFilter === 'Upcoming') {
          matchesStatus = lead.followUpStatus === 'Upcoming' || lead.followUpStatus === 'Pending';
        } else if (statusFilter === 'Completed') {
          matchesStatus = lead.followUpStatus === 'Completed';
        } else if (statusFilter === 'Needs Review') {
          matchesStatus = lead.followUpStatus !== 'Completed' && lead.approvalStatus !== 'approved';
        }

        // Section 3: Deal Stage Filter
        const currentDealStage = lead.dealStage || lead.stage || lead.aiAnalysis?.dealStage || '';
        const matchesDealStage = dealStageFilter === 'ALL' || currentDealStage === dealStageFilter;

        // Section: Signals Filter (matches against lead.interestLevel or urgency)
        let matchesSignal = true;
        if (signalFilter !== 'ALL') {
          const target = signalFilter.toLowerCase();
          const interest = lead.interestLevel?.toLowerCase();
          const urgency = (lead.urgency || lead.aiAnalysis?.urgency)?.toLowerCase();
          matchesSignal = interest === target || urgency === target;
        }

        return matchesSearch && matchesPriority && matchesStatus && matchesDealStage && matchesSignal;
      })
      .sort((a, b) => {
        // Section 1: Strict Priority Order (HIGH -> MEDIUM -> LOW, with urgent follow-ups first)
        if (sortField === 'priority') {
          const rank: Record<Priority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          const rankDiff = (rank[b.priority] || 0) - (rank[a.priority] || 0);
          if (rankDiff !== 0) return sortDirection === 'desc' ? rankDiff : -rankDiff;

          // Within equal priority, leads requiring immediate attention appear first
          const isUrgentA = a.followUpStatus === 'Due Today' || a.followUpStatus === 'Overdue' ? 1 : 0;
          const isUrgentB = b.followUpStatus === 'Due Today' || b.followUpStatus === 'Overdue' ? 1 : 0;
          if (isUrgentA !== isUrgentB) return isUrgentB - isUrgentA;

          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }

        if (sortField === 'dueDate') {
          const dueA = a.followUpDueDate || '';
          const dueB = b.followUpDueDate || '';
          return sortDirection === 'asc' ? dueA.localeCompare(dueB) : dueB.localeCompare(dueA);
        }

        let valA = (a[sortField] || '').toString().toLowerCase();
        let valB = (b[sortField] || '').toString().toLowerCase();
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [leads, searchTerm, priorityFilter, statusFilter, dealStageFilter, signalFilter, sortField, sortDirection]);

  const handleSort = (field: 'priority' | 'name' | 'company' | 'dueDate') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'priority' ? 'desc' : 'asc');
    }
  };

  // Stage 6 Loading Skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-[#EBE9E2] rounded animate-pulse" />
            <div className="h-4 w-72 bg-[#EBE9E2] rounded animate-pulse" />
          </div>
        </div>

        <div className="h-14 bg-white rounded-[12px] border border-[#E4E2DC] shadow-subtle p-3 animate-pulse flex items-center justify-between" />

        <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-subtle p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-[#F2F1ED] last:border-0">
              <div className="space-y-2">
                <div className="h-4 w-36 bg-[#EBE9E2] rounded animate-pulse" />
                <div className="h-3 w-24 bg-[#EBE9E2] rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-[#EBE9E2] rounded animate-pulse" />
              <div className="h-6 w-28 bg-[#EBE9E2] rounded animate-pulse" />
              <div className="h-8 w-20 bg-[#EBE9E2] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171A17] tracking-tight">Pipeline Intelligence</h1>
          <p className="text-sm text-[#687068] mt-1">
            Active sales opportunities ranked by buying intent, urgency, and follow-up readiness.
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
      </div>

      {/* Control Bar: Multi-Field Search & Section 3 Filters */}
      <div className="bg-white p-4 rounded-[12px] border border-[#E4E2DC] shadow-subtle space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Section 2: Pipeline Search against Name, Company, Email */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#687068]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by prospect name, company, or email..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#FAF9F6] border border-[#E4E2DC] rounded-[8px] placeholder:text-[#8D968D] text-[#171A17] focus:outline-none focus:bg-white focus:border-[#1F5C48]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#687068] hover:text-[#171A17]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Section 3: Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#687068] mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span className="font-semibold text-[10px] uppercase tracking-wider">Filters:</span>
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-[#FAF9F6] border border-[#E4E2DC] rounded-[8px] text-[#171A17] font-medium focus:outline-none focus:border-[#1F5C48]"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            {/* Follow-Up Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-[#FAF9F6] border border-[#E4E2DC] rounded-[8px] text-[#171A17] font-medium focus:outline-none focus:border-[#1F5C48]"
            >
              <option value="ALL">All Follow-ups</option>
              <option value="Due Today">Due Today</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Signals Filter */}
            <select
              id="signals-filter"
              name="signals"
              aria-label="Signals filter"
              value={signalFilter}
              onChange={(e) => setSignalFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-[#FAF9F6] border border-[#E4E2DC] rounded-[8px] text-[#171A17] font-medium focus:outline-none focus:border-[#1F5C48]"
            >
              <option value="ALL">All</option>
              {availableSignals.map((sig) => (
                <option key={sig} value={sig}>
                  {sig}
                </option>
              ))}
            </select>

            {/* Deal Stage Filter */}
            <select
              value={dealStageFilter}
              onChange={(e) => setDealStageFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-[#FAF9F6] border border-[#E4E2DC] rounded-[8px] text-[#171A17] font-medium focus:outline-none focus:border-[#1F5C48]"
            >
              <option value="ALL">All Stages</option>
              {availableDealStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>

            {/* Clear Filters Action */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs text-[#8C5D23] hover:text-[#171A17]"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-[#687068] pt-1 border-t border-[#F2F1ED]">
          <span>
            Showing <strong className="text-[#171A17]">{filteredLeads.length}</strong> of{' '}
            <strong className="text-[#171A17]">{leads.length}</strong> leads
          </span>
          <span className="text-[11px]">
            Sorted by:{' '}
            <strong className="text-[#171A17]">
              {sortField === 'priority'
                ? 'Priority (Highest First)'
                : sortField === 'dueDate'
                ? 'Due Date'
                : sortField === 'name'
                ? 'Prospect Name'
                : 'Company'}
            </strong>
          </span>
        </div>
      </div>

      {/* CRM Pipeline Intelligence Table */}
      <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-subtle overflow-hidden">
        {filteredLeads.length === 0 ? (
          <EmptyState
            icon={<Search className="w-5 h-5 text-[#687068]" />}
            title={leads.length === 0 ? 'Your pipeline is empty.' : 'No leads match your current filters.'}
            description={
              leads.length === 0
                ? 'Add your first lead to start generating sales intelligence.'
                : 'Try adjusting your search keywords or resetting filter criteria.'
            }
            actionLabel={leads.length === 0 ? 'Add Lead' : 'Reset Filters'}
            onAction={() => {
              if (leads.length === 0) {
                navigate('/leads/new');
              } else {
                resetFilters();
              }
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#E4E2DC] text-[11px] font-semibold text-[#687068] uppercase tracking-wider">
                  <th
                    className="py-3 px-5 cursor-pointer select-none hover:text-[#171A17]"
                    onClick={() => handleSort('name')}
                  >
                    Prospect {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th
                    className="py-3 px-5 cursor-pointer select-none hover:text-[#171A17]"
                    onClick={() => handleSort('company')}
                  >
                    Company {sortField === 'company' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th
                    className="py-3 px-5 cursor-pointer select-none hover:text-[#171A17]"
                    onClick={() => handleSort('priority')}
                  >
                    Priority {sortField === 'priority' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="py-3 px-5">Deal Stage</th>
                  <th className="py-3 px-5">Signals</th>
                  <th
                    className="py-3 px-5 cursor-pointer select-none hover:text-[#171A17]"
                    onClick={() => handleSort('dueDate')}
                  >
                    Follow-Up {sortField === 'dueDate' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="py-3 px-5">Message State</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E2DC] text-xs">
                {filteredLeads.map((lead) => {
                  const dealStage = lead.dealStage || lead.stage || lead.aiAnalysis?.dealStage || 'Discovery';
                  const urgency = lead.urgency || lead.aiAnalysis?.urgency;
                  const isApproved = lead.approvalStatus === 'approved' && (lead.isApproved || lead.draftMessage?.isApproved);
                  const isCompleted = lead.followUpStatus === 'Completed';

                  return (
                    <motion.tr
                      key={lead.id}
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      className="hover:bg-[#FAF9F6] cursor-pointer transition-colors duration-150 group"
                    >
                      {/* Prospect Name & Email */}
                      <td className="py-4 px-5">
                        <div className="font-semibold text-[#171A17] group-hover:text-[#1F5C48] transition-colors">
                          {lead.name}
                        </div>
                        <div className="text-[11px] text-[#687068] mt-0.5">{lead.email}</div>
                      </td>

                      {/* Company */}
                      <td className="py-4 px-5 font-medium text-[#171A17]">
                        {lead.company}
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-5">
                        <PriorityBadge priority={lead.priority} size="sm" />
                      </td>

                      {/* Deal Stage */}
                      <td className="py-4 px-5 text-[#454D45]">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#F2F1ED] text-[#171A17] font-medium text-[11px]">
                          <Layers className="w-3 h-3 text-[#1F5C48]" />
                          {dealStage}
                        </span>
                      </td>

                      {/* Lead Intelligence Signals (Interest & Urgency) */}
                      <td className="py-4 px-5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {lead.interestLevel && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-[4px] bg-[#FAF9F6] border border-[#E4E2DC] text-[10px] text-[#687068]">
                              <Sparkles className="w-2.5 h-2.5 text-[#B58A52]" />
                              {lead.interestLevel}
                            </span>
                          )}
                          {urgency && urgency.toLowerCase() !== lead.interestLevel?.toLowerCase() && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-[4px] bg-[#FAF9F6] border border-[#E4E2DC] text-[10px] text-[#687068]">
                              <Zap className="w-2.5 h-2.5 text-[#1F5C48]" />
                              {urgency}
                            </span>
                          )}
                          {lead.recommendedAction?.action && (
                            <span
                              className="w-2 h-2 rounded-full bg-[#1F5C48]"
                              title={`Recommendation: ${lead.recommendedAction.action}`}
                            />
                          )}
                        </div>
                      </td>

                      {/* Follow-up Window & Status */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 text-[#171A17] font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#1F5C48]" />
                          <span>{lead.followUpDueDate}</span>
                        </div>
                        <div className="mt-1">
                          {lead.followUpStatus === 'Completed' ? (
                            <Badge variant="success" size="sm">Completed</Badge>
                          ) : lead.followUpStatus === 'Overdue' ? (
                            <Badge variant="error" size="sm">Overdue</Badge>
                          ) : lead.followUpStatus === 'Due Today' ? (
                            <Badge variant="warning" size="sm">Due Today</Badge>
                          ) : (
                            <Badge variant="neutral" size="sm">Upcoming</Badge>
                          )}
                        </div>
                      </td>

                      {/* Message State */}
                      <td className="py-4 px-5">
                        {isCompleted ? (
                          <Badge variant="success" size="sm" className="gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#2F7D5B]" />
                            Completed
                          </Badge>
                        ) : isApproved ? (
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
                      </td>

                      {/* Review Action */}
                      <td className="py-4 px-5 text-right">
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
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
