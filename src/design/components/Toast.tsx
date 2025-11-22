import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
  position?: ToastPosition;
  showIcon?: boolean;
  closable?: boolean;
}

/**
 * Toast Component
 * 
 * Temporary notification message.
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'info',
  duration = 3000,
  onClose,
  position = 'top-right',
  showIcon = true,
  closable = true,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const variants = {
    success: {
      bg: 'bg-status-successDark',
      text: 'text-status-success',
      border: 'border-status-success',
      icon: CheckCircle,
    },
    error: {
      bg: 'bg-status-errorDark',
      text: 'text-status-error',
      border: 'border-status-error',
      icon: XCircle,
    },
    warning: {
      bg: 'bg-status-warningDark',
      text: 'text-status-warning',
      border: 'border-status-warning',
      icon: AlertCircle,
    },
    info: {
      bg: 'bg-status-infoDark',
      text: 'text-status-info',
      border: 'border-status-info',
      icon: Info,
    },
  };

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  const style = variants[variant];
  const Icon = style.icon;

  return (
    <div
      className={`
        fixed ${positions[position]}
        z-toast
        flex items-center gap-3
        px-4 py-3
        ${style.bg} ${style.text}
        border ${style.border}
        rounded-lg
        shadow-xl
        backdrop-blur-sm
        animate-in slide-in-from-top-2 fade-in
        duration-300
        max-w-md
      `}
      role="alert"
    >
      {showIcon && <Icon size={20} className="shrink-0" />}
      
      <p className="flex-1 text-sm font-medium">{message}</p>

      {closable && (
        <button
          onClick={onClose}
          className="shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
          aria-label="Закрыть"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

/**
 * Toast Container для управления множественными Toast
 */
export interface ToastMessage extends ToastProps {
  id: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </>
  );
};

