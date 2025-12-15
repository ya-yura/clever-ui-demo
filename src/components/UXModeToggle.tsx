// === 📁 src/components/UXModeToggle.tsx ===
// Toggle between Beginner and Professional UX modes

import React from 'react';
import { useUXMode } from '@/contexts/UXModeContext';
import { Sparkles, Zap, Info, CheckCircle } from 'lucide-react';

interface UXModeToggleProps {
  expanded?: boolean;
}

export const UXModeToggle: React.FC<UXModeToggleProps> = ({ expanded = false }) => {
  const { mode, setMode, toggleMode } = useUXMode();

  if (expanded) {
    return (
      <div className="bg-surface-secondary rounded-2xl p-6 border border-borders-default">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-brand-primary/20 rounded-lg">
            {mode === 'beginner' ? (
              <Sparkles size={24} className="text-brand-primary" />
            ) : (
              <Zap size={24} className="text-warning" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg">Режим интерфейса</h3>
            <p className="text-sm text-content-secondary">
              {mode === 'beginner' ? 'Новичок' : 'Профессионал'}
            </p>
          </div>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Beginner Mode */}
          <button
            onClick={() => setMode('beginner')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              mode === 'beginner'
                ? 'border-brand-primary bg-brand-primary/10 shadow-lg'
                : 'border-separator hover:border-brand-primary/30'
            }`}
          >
            <Sparkles
              size={32}
              className={mode === 'beginner' ? 'text-brand-primary' : 'text-content-tertiary'}
            />
            <div className="mt-3">
              <div className={`font-bold mb-1 ${mode === 'beginner' ? 'text-brand-primary' : ''}`}>
                Новичок
              </div>
              <p className="text-xs text-content-secondary">
                Подсказки, анимации, пошаговые инструкции
              </p>
            </div>
            {mode === 'beginner' && (
              <CheckCircle className="text-success mt-2" size={20} />
            )}
          </button>

          {/* Professional Mode */}
          <button
            onClick={() => setMode('professional')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              mode === 'professional'
                ? 'border-warning bg-warning/10 shadow-lg'
                : 'border-separator hover:border-warning/30'
            }`}
          >
            <Zap
              size={32}
              className={mode === 'professional' ? 'text-warning' : 'text-content-tertiary'}
            />
            <div className="mt-3">
              <div className={`font-bold mb-1 ${mode === 'professional' ? 'text-warning' : ''}`}>
                Профессионал
              </div>
              <p className="text-xs text-content-secondary">
                Компактный, быстрый, потоковое сканирование
              </p>
            </div>
            {mode === 'professional' && (
              <CheckCircle className="text-success mt-2" size={20} />
            )}
          </button>
        </div>

        {/* Features Info */}
        <div className="bg-surface-primary rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-brand-primary flex-shrink-0 mt-0.5" />
            <div className="text-xs text-content-secondary">
              {mode === 'beginner' ? (
                <ul className="space-y-1">
                  <li>• Подробные подсказки и объяснения</li>
                  <li>• Анимации и визуальные эффекты</li>
                  <li>• Пошаговые инструкции</li>
                  <li>• Подтверждения действий</li>
                </ul>
              ) : (
                <ul className="space-y-1">
                  <li>• Компактный интерфейс</li>
                  <li>• Потоковое сканирование по умолчанию</li>
                  <li>• Минимум подтверждений</li>
                  <li>• Быстрые клавиши и жесты</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact version
  return (
    <button
      onClick={toggleMode}
      className="flex items-center gap-3 px-4 py-3 bg-surface-secondary hover:bg-surface-tertiary rounded-xl transition-all border border-borders-default"
    >
      {mode === 'beginner' ? (
        <>
          <Sparkles size={20} className="text-brand-primary" />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium">Режим новичка</div>
            <div className="text-xs text-content-tertiary">Нажмите для переключения</div>
          </div>
          <div className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-1 rounded">
            Активен
          </div>
        </>
      ) : (
        <>
          <Zap size={20} className="text-warning" />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium">Режим профессионала</div>
            <div className="text-xs text-content-tertiary">Нажмите для переключения</div>
          </div>
          <div className="text-xs bg-warning/10 text-warning-dark px-2 py-1 rounded">
            Активен
          </div>
        </>
      )}
    </button>
  );
};

/**
 * Inline mode indicator badge
 */
export const UXModeBadge: React.FC = () => {
  const { mode } = useUXMode();

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
      mode === 'beginner'
        ? 'bg-brand-primary/10 text-brand-primary'
        : 'bg-warning/10 text-warning-dark'
    }`}>
      {mode === 'beginner' ? (
        <>
          <Sparkles size={12} />
          <span>Новичок</span>
        </>
      ) : (
        <>
          <Zap size={12} />
          <span>Профи</span>
        </>
      )}
    </div>
  );
};










