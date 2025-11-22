import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

/**
 * TextArea Component
 * 
 * Multi-line text input field.
 */
export const TextArea: React.FC<TextAreaProps> = ({
  className = '',
  label,
  error,
  hint,
  fullWidth = false,
  disabled,
  ...props
}) => {
  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error 
    ? 'border-status-error focus:ring-status-error' 
    : 'border-border-default focus:ring-border-focus';
  const disabledClass = disabled 
    ? 'opacity-50 cursor-not-allowed bg-surface-disabled text-content-disabled' 
    : 'bg-surface-secondary text-content-primary';

  return (
    <div className={`${widthClass} ${className}`}>
      {label && (
        <label className="block mb-2 text-sm font-medium text-content-secondary">
          {label}
        </label>
      )}
      
      <textarea
        className={`
          min-h-[80px]
          px-4 py-3
          rounded-lg
          border
          text-base
          placeholder-content-tertiary
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${errorClass}
          ${disabledClass}
          ${widthClass}
        `}
        disabled={disabled}
        {...props}
      />

      {hint && !error && (
        <p className="mt-1.5 text-xs text-content-tertiary">{hint}</p>
      )}
      
      {error && (
        <p className="mt-1.5 text-xs text-status-error">{error}</p>
      )}
    </div>
  );
};

