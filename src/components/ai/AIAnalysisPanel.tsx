import React from 'react';
import { Sparkles, Calendar, CheckCircle2, XCircle, TrendingUp, AlertTriangle, Target, Layers } from 'lucide-react';
import type { AIAnalysis } from '../../types';
import { PriorityBadge } from '../ui/PriorityBadge';
import { Badge } from '../ui/Badge';

interface AIAnalysisPanelProps {
  analysis?: AIAnalysis;
  isLoading?: boolean;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  analysis,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="p-6 rounded-[12px] bg-white border border-[#E4E2DC] shadow-subtle animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-[#F2F1ED] rounded" />
          <div className="h-5 w-24 bg-[#F2F1ED] rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-16 bg-[#F2F1ED] rounded" />
              <div className="h-4 w-24 bg-[#F2F1ED] rounded" />
            </div>
          ))}
        </div>
        <div className="h-16 bg-[#F2F1ED] rounded-[8px]" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-6 rounded-[12px] bg-white border border-[#E4E2DC] text-center text-[#687068] text-sm">
        AI analysis will appear here after the conversation is analyzed.
      </div>
    );
  }

  const hasBuyingSignals = Array.isArray(analysis.buyingSignals) && analysis.buyingSignals.length > 0;
  const hasObjections = Array.isArray(analysis.objections) && analysis.objections.length > 0;
  const hasPainPoints = Array.isArray(analysis.painPoints) && analysis.painPoints.length > 0;
  const hasDecisionFactors = Array.isArray(analysis.decisionFactors) && analysis.decisionFactors.length > 0;

  return (
    <div className="rounded-[12px] bg-white border border-[#E4E2DC] shadow-subtle overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E4E2DC] flex items-center justify-between bg-[#FAF9F6]">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[#171A17] uppercase tracking-wider">
            Sales Signals & Intelligence
          </h3>
        </div>
        <Badge variant="brass" size="sm" className="gap-1">
          <Sparkles className="w-3 h-3 text-[#946E3D]" />
          Sales Signals
        </Badge>
      </div>

      <div className="p-6 space-y-5">
        {/* Core Attributes Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E4E2DC]">
          <div>
            <span className="text-[11px] font-semibold text-[#687068] uppercase tracking-wider block">
              Intent
            </span>
            <span className="text-sm font-medium text-[#171A17] mt-0.5 block truncate" title={analysis.intent}>
              {analysis.intent}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#687068] uppercase tracking-wider block">
              Interest Level
            </span>
            <span className="text-sm font-medium text-[#171A17] mt-0.5 block">
              {analysis.interestLevel}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#687068] uppercase tracking-wider block">
              Follow-up Needed
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-[#171A17] mt-0.5">
              {analysis.followUpRequired ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2F7D5B]" />
                  Yes
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-[#687068]" />
                  No
                </>
              )}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#687068] uppercase tracking-wider block mb-1">
              Priority
            </span>
            <PriorityBadge priority={analysis.priority} size="sm" />
          </div>
        </div>

        {/* Extended Deal Attributes (Deal Stage & Urgency) */}
        {(analysis.dealStage || analysis.urgency) && (
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {analysis.dealStage && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FAF9F6] border border-[#E4E2DC]">
                <Layers className="w-3.5 h-3.5 text-[#1F5C48]" />
                <span className="text-[#687068]">Stage:</span>
                <span className="font-medium text-[#171A17]">{analysis.dealStage}</span>
              </div>
            )}
            {analysis.urgency && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FAF9F6] border border-[#E4E2DC]">
                <Target className="w-3.5 h-3.5 text-[#B58A52]" />
                <span className="text-[#687068]">Urgency:</span>
                <span className="font-medium text-[#171A17]">{analysis.urgency}</span>
              </div>
            )}
          </div>
        )}

        {/* Reasoning Section */}
        <div>
          <h4 className="text-xs font-semibold text-[#171A17] uppercase tracking-wider mb-1.5">
            Analysis Reasoning
          </h4>
          <p className="text-sm text-[#454D45] leading-relaxed bg-white p-3.5 rounded-[8px] border border-[#E4E2DC]">
            {analysis.reason}
          </p>
        </div>

        {/* Buying Signals & Objections Grid */}
        {(hasBuyingSignals || hasObjections) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {hasBuyingSignals && (
              <div className="p-3.5 rounded-[8px] bg-[#FAF9F6] border border-[#E4E2DC] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F5C48] uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-[#1F5C48]" />
                  <span>Buying Signals</span>
                </div>
                <ul className="space-y-1 text-xs text-[#171A17]">
                  {analysis.buyingSignals!.map((sig, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#1F5C48] font-bold">·</span>
                      <span className="leading-snug">{sig}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasObjections && (
              <div className="p-3.5 rounded-[8px] bg-[#FAF9F6] border border-[#E4E2DC] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C5D23] uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#8C5D23]" />
                  <span>Objections & Constraints</span>
                </div>
                <ul className="space-y-1 text-xs text-[#171A17]">
                  {analysis.objections!.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#8C5D23] font-bold">·</span>
                      <span className="leading-snug">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Pain Points & Decision Factors */}
        {(hasPainPoints || hasDecisionFactors) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hasPainPoints && (
              <div className="text-xs space-y-1">
                <span className="font-semibold text-[#687068] uppercase tracking-wider block text-[10px]">
                  Pain Points
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.painPoints!.map((p, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-[6px] bg-[#F2F1ED] text-[#171A17] text-[11px]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hasDecisionFactors && (
              <div className="text-xs space-y-1">
                <span className="font-semibold text-[#687068] uppercase tracking-wider block text-[10px]">
                  Decision Factors
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.decisionFactors!.map((d, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-[6px] bg-[#F2F1ED] text-[#171A17] text-[11px]">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Suggested Follow-up Date */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E4E2DC] text-xs text-[#687068]">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#1F5C48]" />
            Suggested Follow-up Window:
          </span>
          <span className="font-medium text-[#171A17]">
            {analysis.suggestedFollowUpDate}
          </span>
        </div>
      </div>
    </div>
  );
};
