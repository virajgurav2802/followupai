import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { AIRecommendation } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface AIRecommendationPanelProps {
  recommendation?: AIRecommendation;
  onReview?: () => void;
  isLoading?: boolean;
}

export const AIRecommendationPanel: React.FC<AIRecommendationPanelProps> = ({
  recommendation,
  onReview,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="p-6 rounded-[12px] bg-white border border-[#E4E2DC] shadow-subtle animate-pulse space-y-3">
        <div className="h-4 w-40 bg-[#F2F1ED] rounded" />
        <div className="h-6 w-3/4 bg-[#F2F1ED] rounded" />
        <div className="h-12 bg-[#F2F1ED] rounded" />
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="p-6 rounded-[12px] bg-white border border-[#E4E2DC] text-center text-[#687068] text-sm">
        Next best action recommendation will appear here once analysis is complete.
      </div>
    );
  }

  return (
    <div className="rounded-[12px] bg-white border border-[#E4E2DC] shadow-subtle p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#171A17] uppercase tracking-wider">
          Recommended Next Action
        </span>
        <Badge variant="brass" size="sm" className="gap-1">
          <Sparkles className="w-3 h-3 text-[#946E3D]" />
          AI Suggested
        </Badge>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-[#171A17]">
            {recommendation.action}
          </h4>
        </div>

        <div className="p-3.5 rounded-[8px] bg-[#FAF9F6] border border-[#E4E2DC] space-y-1">
          <span className="text-[11px] font-semibold text-[#687068] uppercase tracking-wider block">
            Why
          </span>
          <p className="text-sm text-[#171A17] leading-relaxed">
            {recommendation.reason}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#E4E2DC]">
        <div className="flex items-center gap-1.5 text-xs text-[#687068]">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Suggested Date:</span>
          <strong className="text-[#171A17] font-medium text-xs">{recommendation.suggestedDate}</strong>
        </div>
        {onReview && (
          <Button
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={onReview}
          >
            Review Suggestion
          </Button>
        )}
      </div>
    </div>
  );
};
