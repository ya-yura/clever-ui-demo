import React from 'react';
import { Loader2 } from 'lucide-react';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  size?: SpinnerSize;
  variant?: 'primary' | 'secondary' | 'white';
  className?: string;
}

/**
 * Spinner Component
 * 
 * Loading indicator.
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className = '',
}) => {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  };

  const variants = {
    primary: 'text-brand-primary',
    secondary: 'text-content-tertiary',
    white: 'text-white',
  };

  return (
    <Loader2 
      className={`animate-spin ${variants[variant]} ${className}`}
      size={sizes[size]}
      role="status"
      aria-label="Загрузка"
    />
  );
};

