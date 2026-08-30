import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, className = '', id, rows = 4, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-[#171A17]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={`w-full rounded-[8px] p-3 bg-white border text-sm text-[#171A17] placeholder:text-[#8D968D] transition-colors focus:outline-none focus:border-[#1F5C48] focus:ring-2 focus:ring-[#1F5C48]/10 disabled:bg-[#FAF9F6] resize-y ${
            error ? 'border-[#B94A48] focus:border-[#B94A48] focus:ring-[#B94A48]/10' : 'border-[#E4E2DC]'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs text-[#B94A48]">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#687068]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
