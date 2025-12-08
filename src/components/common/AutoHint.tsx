// === 📁 src/components/common/AutoHint.tsx ===
// Automatic contextual hints component

import React, { useEffect, useState } from 'react';
import { Card } from '@/design/components';
import { X, Lightbulb } from 'lucide-react';
import { HintConfig, shouldShowHint, markHintShown, dismissHint } from '@/behavior/contextualHelp';

interface AutoHintProps {
  hints: HintConfig[];
  className?: string;
}

export const AutoHint: React.FC<AutoHintProps> = ({ hints, className = '' }) => {
  const [currentHint, setCurrentHint] = useState<HintConfig | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Find highest priority hint that should be shown
    const hint = hints
      .filter(h => shouldShowHint(h.id))
      .sort((a, b) => b.priority - a.priority)[0];

    if (hint) {
      setCurrentHint(hint);
      setVisible(true);
      markHintShown(hint.id);
    }
  }, [hints]);

  const handleDismiss = () => {
    setVisible(false);
    if (currentHint) {
      dismissHint(currentHint.id);
    }
  };

  const handleAction = () => {
    setVisible(false);
    // Action callback could be passed as prop
  };

  if (!visible || !currentHint) {
    return null;
  }

  const getTriggerColor = () => {
    switch (currentHint.trigger) {
      case 'spark':
        return 'border-brand-primary bg-brand-primary/10';
      case 'facilitator':
        return 'border-brand-secondary bg-brand-secondary/10';
      case 'signal':
        return 'border-info bg-info/10';
      default:
        return 'border-surface-tertiary bg-surface-secondary';
    }
  };

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-40 animate-slide-up ${className}`}>
      <Card className={`border-2 ${getTriggerColor()} shadow-lg`}>
        <div className="flex items-start gap-3 p-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            {currentHint.icon ? (
              <div className="text-2xl">{currentHint.icon}</div>
            ) : (
              <Lightbulb className="text-brand-primary" size={24} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-content-primary mb-1">
              {currentHint.message}
            </div>

            {/* Action Button */}
            {currentHint.action && (
              <button
                onClick={handleAction}
                className="text-xs text-brand-primary hover:text-brand-secondary font-medium mt-2"
              >
                {currentHint.action} →
              </button>
            )}
          </div>

          {/* Dismiss Button */}
          {currentHint.dismissible !== false && (
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 text-content-tertiary hover:text-content-primary transition-colors"
              title="Закрыть"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};


