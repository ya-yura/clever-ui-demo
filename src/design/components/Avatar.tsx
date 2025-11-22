import React from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'busy';

interface AvatarProps {
  src?: string;
  name?: string;
  initials?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
  alt?: string;
}

/**
 * Avatar Component
 * 
 * User profile image or initials.
 */
export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  initials, 
  size = 'md', 
  status, 
  className = '',
  alt
}) => {
  
  // Generate initials from name if not provided explicitly
  const getInitials = (): string => {
    if (initials) return initials.slice(0, 2).toUpperCase();
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length === 0) return '';
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return '??';
  };

  const sizes: Record<AvatarSize, string> = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const statusColors: Record<AvatarStatus, string> = {
    online: 'bg-status-success border-surface-secondary',
    offline: 'bg-content-tertiary border-surface-secondary',
    busy: 'bg-status-error border-surface-secondary',
  };

  const statusSizes: Record<AvatarSize, string> = {
    xs: 'w-1.5 h-1.5 border',
    sm: 'w-2 h-2 border',
    md: 'w-2.5 h-2.5 border-2',
    lg: 'w-3 h-3 border-2',
    xl: 'w-4 h-4 border-2',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div 
        className={`
          ${sizes[size]} 
          rounded-full 
          bg-surface-tertiary 
          flex items-center justify-center 
          overflow-hidden 
          border border-border-default 
          text-content-secondary 
          font-bold 
          select-none
        `}
      >
        {src ? (
          <img src={src} alt={alt || name || "Avatar"} className="w-full h-full object-cover" />
        ) : (
          <span>{getInitials()}</span>
        )}
      </div>
      
      {status && (
        <div 
          className={`
            absolute bottom-0 right-0 
            rounded-full 
            ${statusColors[status]}
            ${statusSizes[size]}
          `} 
        />
      )}
    </div>
  );
};
