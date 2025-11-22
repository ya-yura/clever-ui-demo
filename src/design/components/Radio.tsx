import React from 'react';

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

/**
 * Radio Component
 * 
 * Single selection control.
 */
export const Radio: React.FC<RadioProps> = ({
  label,
  description,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <label className={`flex items-start gap-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}>
      <div className="relative flex items-center mt-0.5">
        <input
          type="radio"
          className="peer sr-only"
          disabled={disabled}
          {...props}
        />
        <div className={`
          w-5 h-5 rounded-full border-2 transition-all duration-200
          peer-checked:border-brand-primary peer-checked:border-[6px]
          ${disabled 
            ? 'border-border-default bg-surface-disabled' 
            : 'border-border-strong bg-surface-secondary peer-hover:border-brand-primary/70'
          }
        `} />
      </div>
      
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <div className={`text-sm font-medium ${disabled ? 'text-content-disabled' : 'text-content-primary'}`}>
              {label}
            </div>
          )}
          {description && (
            <p className="text-xs text-content-tertiary mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
    </label>
  );
};

