import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'bottom' | 'right' | 'left';
  className?: string;
}

/**
 * Drawer Component
 * 
 * Navigation drawer or bottom sheet for mobile.
 */
export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'bottom',
  className = '',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const positions = {
    bottom: 'inset-x-0 bottom-0 rounded-t-2xl border-t max-h-[90vh]',
    right: 'inset-y-0 right-0 w-full max-w-sm border-l h-full',
    left: 'inset-y-0 left-0 w-full max-w-sm border-r h-full',
  };

  const animations = {
    bottom: 'slide-in-from-bottom',
    right: 'slide-in-from-right',
    left: 'slide-in-from-left',
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-modal flex justify-end" 
      role="dialog" 
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-surface-overlay backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className={`
        relative bg-surface-secondary border-border-default shadow-2xl
        flex flex-col
        animate-in ${animations[position]} duration-300 ease-out
        ${positions[position]}
        ${className}
      `}>
        {/* Handle for bottom sheet */}
        {position === 'bottom' && (
          <div className="flex justify-center pt-3 pb-1" onClick={onClose}>
            <div className="w-12 h-1.5 bg-surface-tertiary rounded-full" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light shrink-0">
          {title && <h2 className="text-lg font-bold text-content-primary">{title}</h2>}
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-content-tertiary hover:text-content-primary rounded-full hover:bg-surface-tertiary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

