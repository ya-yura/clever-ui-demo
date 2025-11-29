import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Badge Component
 * 
 * Small status indicator or label.
 */
export const Badge: React.FC<BadgeProps> = ({ 
  label, 
  variant = 'neutral', 
  size = 'md', 
  icon,
  className = ''
}) => {
  
  // Using borders and text colors instead of background opacity for better compatibility
  const variants: Record<BadgeVariant, string> = {
    success: 'bg-surface-secondary border-status-success text-status-success',
    warning: 'bg-surface-secondary border-status-warning text-status-warning',
    error: 'bg-surface-secondary border-status-error text-status-error',
    info: 'bg-surface-secondary border-status-info text-status-info',
    neutral: 'bg-surface-tertiary border-transparent text-content-secondary',
    primary: 'bg-surface-secondary border-brand-primary text-brand-primary',
  };

  const sizes: Record<BadgeSize, string> = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-2',
  };

  return (
    <span 
      className={`
        inline-flex items-center justify-center 
        rounded-full font-bold border 
        whitespace-nowrap
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
      `}
    >
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      {label}
    </span>
  );
};
