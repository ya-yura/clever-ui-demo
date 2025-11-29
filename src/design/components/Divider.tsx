import React from 'react';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';

interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  label?: string;
}

/**
 * Divider Component
 * 
 * Visual separator between content sections.
 * Can be horizontal or vertical, with optional label.
 */
export const Divider: React.FC<DividerProps> = ({
  className = '',
  orientation = 'horizontal',
  variant = 'solid',
  spacing = 'md',
  label,
  ...props
}) => {
  const variants = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  };

  const spacingStyles = {
    none: '',
    sm: orientation === 'horizontal' ? 'my-2' : 'mx-2',
    md: orientation === 'horizontal' ? 'my-4' : 'mx-4',
    lg: orientation === 'horizontal' ? 'my-6' : 'mx-6',
  };

  if (orientation === 'vertical') {
    return (
      <div
        className={`inline-block h-auto border-l border-border-default ${variants[variant]} ${spacingStyles[spacing]} ${className}`}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (label) {
    return (
      <div 
        className={`flex items-center ${spacingStyles[spacing]} ${className}`}
        role="separator"
        aria-label={label}
      >
        <div className={`flex-1 border-t border-border-default ${variants[variant]}`} />
        <span className="px-3 text-sm text-content-tertiary">{label}</span>
        <div className={`flex-1 border-t border-border-default ${variants[variant]}`} />
      </div>
    );
  }

  return (
    <hr
      className={`border-t border-border-default ${variants[variant]} ${spacingStyles[spacing]} ${className}`}
      role="separator"
      {...props}
    />
  );
};

