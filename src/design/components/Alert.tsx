import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export type AlertVariant = 'success' | 'warning' | 'error' | 'info';

interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: AlertVariant;
  onClose?: () => void;
  className?: string;
}

/**
 * Alert Component
 * 
 * Static inline notification/feedback.
 */
export const Alert: React.FC<AlertProps> = ({
  title,
  children,
  variant = 'info',
  onClose,
  className = '',
}) => {
  const variants = {
    success: {
      container: 'bg-status-successDark/10 border-status-success/20 text-status-success',
      icon: CheckCircle,
    },
    warning: {
      container: 'bg-status-warningDark/10 border-status-warning/20 text-status-warning',
      icon: AlertCircle,
    },
    error: {
      container: 'bg-status-errorDark/10 border-status-error/20 text-status-error',
      icon: XCircle,
    },
    info: {
      container: 'bg-status-infoDark/10 border-status-info/20 text-status-info',
      icon: Info,
    },
  };

  const style = variants[variant];
  const Icon = style.icon;

  return (
    <div className={`
      flex gap-3 p-4 rounded-lg border
      ${style.container}
      ${className}
    `} role="alert">
      <Icon className="shrink-0 mt-0.5" size={20} />
      
      <div className="flex-1">
        {title && (
          <h5 className="font-bold mb-1">{title}</h5>
        )}
        <div className="text-sm opacity-90">
          {children}
        </div>
      </div>

      {onClose && (
        <button 
          onClick={onClose}
          className="shrink-0 -mt-1 -mr-1 p-1.5 rounded-lg hover:bg-black/5 active:bg-black/10 transition-colors"
          aria-label="Закрыть"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

