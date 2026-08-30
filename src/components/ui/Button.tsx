import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'brass' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-[8px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F5C48] focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-9',
    lg: 'text-base px-5 py-2.5 gap-2.5 h-11',
  };

  const variantStyles = {
    primary: 'bg-[#1F5C48] text-white hover:bg-[#174635] shadow-subtle active:bg-[#12382A]',
    secondary: 'bg-white text-[#171A17] border border-[#E4E2DC] hover:bg-[#FAF9F6] shadow-subtle active:bg-[#F2EFE8]',
    outline: 'border border-[#1F5C48] text-[#1F5C48] hover:bg-[#1F5C48]/5 active:bg-[#1F5C48]/10',
    ghost: 'text-[#687068] hover:text-[#171A17] hover:bg-[#12231D]/5 active:bg-[#12231D]/10',
    brass: 'bg-[#B58A52] text-white hover:bg-[#946E3D] shadow-subtle',
    danger: 'bg-white text-[#B94A48] border border-[#E4C8C8] hover:bg-[#FDF2F2]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
