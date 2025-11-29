import React from 'react';

export type ChipVariant = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'error';

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: ChipVariant;
  active?: boolean;
  icon?: React.ReactNode;
}

/**
 * Chip Component (Interactive Badge/Pill)
 * 
 * Clickable pill-shaped filter/tag component.
 * Used for filters, tags, and selection controls.
 */
export const Chip: React.FC<ChipProps> = ({ 
  label, 
  variant = 'neutral', 
  active = false,
  icon,
  className = '',
  disabled,
  ...props 
}) => {
  // Base styles - always pill-shaped with border
  const baseStyles = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-primary disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant styles (inactive state)
  const inactiveVariants = {
    neutral: 'bg-surface-primary text-content-secondary border-surface-tertiary hover:border-content-tertiary active:bg-surface-tertiary',
    primary: 'bg-surface-primary text-brand-primary border-brand-primary/30 hover:border-brand-primary',
    info: 'bg-surface-primary text-status-info border-status-info/30 hover:border-status-info',
    success: 'bg-surface-primary text-status-success border-status-success/30 hover:border-status-success',
    warning: 'bg-surface-primary text-status-warning border-status-warning/30 hover:border-status-warning',
    error: 'bg-surface-primary text-status-error border-status-error/30 hover:border-status-error',
  };

  // Active state styles - using solid backgrounds or strong borders
  const activeVariants = {
    neutral: 'bg-surface-tertiary text-content-primary border-content-tertiary',
    primary: 'bg-brand-primary text-brand-primaryDark border-brand-primary',
    info: 'bg-status-info text-status-infoDark border-status-info',
    success: 'bg-status-success text-status-successDark border-status-success',
    warning: 'bg-status-warning text-status-warningDark border-status-warning',
    error: 'bg-status-error text-status-errorDark border-status-error',
  };

  const variantStyles = active ? activeVariants[variant] : inactiveVariants[variant];

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
      {label}
    </button>
  );
};
