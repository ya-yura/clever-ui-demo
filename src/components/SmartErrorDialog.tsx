// === 📁 src/components/SmartErrorDialog.tsx ===
// Dialog for displaying smart errors with actions

import React from 'react';
import { SmartError } from '@/utils/smartErrors';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { Button } from '@/design/components';

interface SmartErrorDialogProps {
  error: SmartError | null;
  onClose: () => void;
}

export const SmartErrorDialog: React.FC<SmartErrorDialogProps> = ({ error, onClose }) => {
  if (!error) return null;

  const getSeverityIcon = () => {
    switch (error.severity) {
      case 'error':
        return <AlertCircle size={32} className="text-error" />;
      case 'warning':
        return <AlertTriangle size={32} className="text-warning" />;
      case 'info':
        return <Info size={32} className="text-brand-primary" />;
    }
  };

  const getSeverityColor = () => {
    switch (error.severity) {
      case 'error':
        return 'border-error bg-error/5';
      case 'warning':
        return 'border-warning bg-warning/5';
      case 'info':
        return 'border-brand-primary bg-brand-primary/5';
    }
  };

  const handleAction = async (action: () => void | Promise<void>) => {
    try {
      await action();
      onClose();
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-primary rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
        {/* Header */}
        <div className={`p-6 border-b-2 ${getSeverityColor()}`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">{getSeverityIcon()}</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{error.title}</h2>
              <p className="text-base text-content-secondary">{error.message}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 hover:bg-surface-secondary rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Explanation */}
          <div className="bg-surface-secondary rounded-lg p-4">
            <div className="text-sm font-semibold text-content-secondary mb-2">
              Почему это произошло:
            </div>
            <p className="text-sm">{error.explanation}</p>
          </div>

          {/* Solution */}
          <div className="bg-success/10 border border-success/20 rounded-lg p-4">
            <div className="text-sm font-semibold text-success-dark mb-2">
              Что делать:
            </div>
            <p className="text-sm text-success-dark">{error.solution}</p>
          </div>

          {/* Error Code */}
          <div className="text-xs text-content-tertiary text-center">
            Код ошибки: <code className="bg-surface-tertiary px-2 py-0.5 rounded">{error.code}</code>
          </div>
        </div>

        {/* Actions */}
        {error.actions && error.actions.length > 0 && (
          <div className="p-6 border-t border-separator space-y-2">
            {error.actions.map((action, index) => (
              <Button
                key={index}
                onClick={() => handleAction(action.action)}
                variant={action.primary ? 'primary' : 'secondary'}
                className="w-full"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Default Close Button */}
        {(!error.actions || error.actions.length === 0) && (
          <div className="p-6 border-t border-separator">
            <Button onClick={onClose} variant="secondary" className="w-full">
              Закрыть
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Hook to manage smart errors
 */
export const useSmartError = () => {
  const [error, setError] = React.useState<SmartError | null>(null);

  const showError = (err: SmartError) => setError(err);
  const clearError = () => setError(null);

  return {
    error,
    showError,
    clearError,
    ErrorDialog: () => <SmartErrorDialog error={error} onClose={clearError} />,
  };
};











