import React from 'react';
import type { ActivityEvent } from '../../types';
import { CheckCircle2, Clock, Sparkles, FileText, AlertTriangle, ShieldCheck, Edit3 } from 'lucide-react';

interface ActivityTimelineProps {
  events: ActivityEvent[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events }) => {
  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'lead_created':
        return <FileText className="w-3.5 h-3.5 text-[#687068]" />;
      case 'analyzed':
        return <Sparkles className="w-3.5 h-3.5 text-[#946E3D]" />;
      case 'priority_detected':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#B7791F]" />;
      case 'followup_recommended':
        return <Clock className="w-3.5 h-3.5 text-[#1F5C48]" />;
      case 'message_generated':
        return <Clock className="w-3.5 h-3.5 text-[#1F5C48]" />;
      case 'message_edited':
        return <Edit3 className="w-3.5 h-3.5 text-[#B7791F]" />;
      case 'approved':
      case 'saved':
        return <ShieldCheck className="w-3.5 h-3.5 text-[#2F7D5B]" />;
      case 'completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#2F7D5B]" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#687068]" />;
    }
  };

  return (
    <div className="rounded-[12px] bg-white border border-[#E4E2DC] shadow-subtle p-6">
      <h3 className="text-xs font-semibold text-[#171A17] uppercase tracking-wider mb-4">
        Activity Timeline
      </h3>

      <div className="relative pl-5 border-l border-[#E4E2DC] space-y-6">
        {events.map((event, index) => (
          <div key={event.id || index} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[27px] top-0.5 w-5 h-5 rounded-full bg-white border border-[#E4E2DC] flex items-center justify-center">
              {getEventIcon(event.type)}
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs font-semibold text-[#171A17]">{event.title}</p>
                <span className="text-[11px] text-[#687068] shrink-0">{event.date}</span>
              </div>
              {event.description && (
                <p className="text-xs text-[#687068] mt-0.5">{event.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
