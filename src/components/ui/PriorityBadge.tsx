import React from 'react';
import type { Priority } from '../../types';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider font-semibold',
    md: 'text-[11px] px-2.5 py-0.5 tracking-wider font-semibold',
  };

  const priorityStyles: Record<Priority, { label: string; style: string; dot: string }> = {
    HIGH: {
      label: 'HIGH PRIORITY',
      style: 'bg-[#FDF2F2] text-[#B94A48] border border-[#F2C5C5]',
      dot: 'bg-[#B94A48]',
    },
    MEDIUM: {
      label: 'MEDIUM',
      style: 'bg-[#FEF7EC] text-[#B7791F] border border-[#F5DCB4]',
      dot: 'bg-[#B7791F]',
    },
    LOW: {
      label: 'LOW',
      style: 'bg-[#F2F5F3] text-[#2F6B56] border border-[#D2E2DB]',
      dot: 'bg-[#2F6B56]',
    },
  };

  const current = priorityStyles[priority] || priorityStyles.MEDIUM;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full uppercase select-none ${sizeStyles[size]} ${current.style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};
