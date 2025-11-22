import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

/**
 * Select Component
 * 
 * Dropdown selection input with label and validation.
 */
export const Select: React.FC<SelectProps> = ({
  className = '',
  label,
  error,
  hint,
  options,
  size = 'md',
  fullWidth = false,
  disabled,
  ...props
}) => {
  const sizes = {
    sm: 'h-9 text-sm px-3 py-1.5',
    md: 'h-11 text-base px-4 py-2',
    lg: 'h-13 text-lg px-5 py-3',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error ? 'border-error focus:ring-error' : 'border-border-default focus:ring-border-focus';

  return (
    <div className={`${widthClass} ${className}`}>
      {label && (
        <label className="block mb-2 text-sm font-medium text-content-secondary">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          className={`
            ${sizes[size]}
            ${widthClass}
            ${errorClass}
            appearance-none
            rounded-lg
            bg-surface-secondary
            text-content-primary
            border
            transition-all
            duration-200
            focus:outline-none
            focus:ring-2
            focus:ring-offset-0
            disabled:opacity-50
            disabled:cursor-not-allowed
            pr-10
          `}
          disabled={disabled}
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <ChevronDown 
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-content-tertiary"
          size={20}
        />
      </div>

      {hint && !error && (
        <p className="mt-1.5 text-xs text-content-tertiary">{hint}</p>
      )}
      
      {error && (
        <p className="mt-1.5 text-xs text-error">{error}</p>
      )}
    </div>
  );
};

