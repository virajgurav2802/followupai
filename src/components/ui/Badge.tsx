import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'forest' | 'brass' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 leading-tight',
    md: 'text-xs px-2.5 py-0.5 leading-normal',
  };

  const variantStyles = {
    default: 'bg-[#F2F1ED] text-[#171A17] border border-[#E4E2DC]',
    forest: 'bg-[#EAF3EF] text-[#1F5C48] border border-[#C6DDD5]',
    brass: 'bg-[#F8F4EE] text-[#946E3D] border border-[#DFCEB6]',
    success: 'bg-[#EEF7F2] text-[#2F7D5B] border border-[#C2E3D3]',
    warning: 'bg-[#FEF7EC] text-[#B7791F] border border-[#F5DCB4]',
    error: 'bg-[#FDF2F2] text-[#B94A48] border border-[#F2C5C5]',
    neutral: 'bg-[#FAF9F6] text-[#687068] border border-[#E4E2DC]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
