import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-[#171A17]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 pointer-events-none text-[#687068]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full h-9 rounded-[8px] bg-white border text-sm text-[#171A17] placeholder:text-[#8D968D] transition-colors focus:outline-none focus:border-[#1F5C48] focus:ring-2 focus:ring-[#1F5C48]/10 disabled:bg-[#FAF9F6] disabled:text-[#8D968D] ${
              leftIcon ? 'pl-9' : 'pl-3'
            } ${rightIcon ? 'pr-9' : 'pr-3'} ${
              error ? 'border-[#B94A48] focus:border-[#B94A48] focus:ring-[#B94A48]/10' : 'border-[#E4E2DC]'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 pointer-events-none text-[#687068]">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-[#B94A48]">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#687068]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
