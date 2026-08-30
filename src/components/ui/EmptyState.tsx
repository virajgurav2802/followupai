import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="py-12 px-6 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
      <div className="w-12 h-12 rounded-[10px] bg-[#F2F1ED] text-[#687068] flex items-center justify-center mb-3.5 border border-[#E4E2DC]">
        {icon}
      </div>
      <h4 className="text-base font-semibold text-[#171A17]">{title}</h4>
      <p className="mt-1 text-sm text-[#687068] leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
