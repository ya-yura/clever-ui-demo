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
    primary: 'bg-surface-primary text-brand-primary border-brand-primary/30 hover:border-brand-primary active:bg-brand-primary/10',
    info: 'bg-surface-primary text-info border-info/30 hover:border-info active:bg-info/10',
    success: 'bg-surface-primary text-success border-success/30 hover:border-success active:bg-success/10',
    warning: 'bg-surface-primary text-warning border-warning/30 hover:border-warning active:bg-warning/10',
    error: 'bg-surface-primary text-error border-error/30 hover:border-error active:bg-error/10',
  };

  // Active state styles
  const activeVariants = {
    neutral: 'bg-content-tertiary/20 text-content-primary border-content-tertiary',
    primary: 'bg-brand-primary/20 text-brand-primary border-brand-primary',
    info: 'bg-info/20 text-info border-info',
    success: 'bg-success/20 text-success border-success',
    warning: 'bg-warning/20 text-warning border-warning',
    error: 'bg-error/20 text-error border-error',
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

