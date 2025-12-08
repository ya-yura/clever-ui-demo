// === 📁 src/onboarding/OnboardingModal.tsx ===
// Onboarding modal component

import React, { useState } from 'react';
import { getOnboardingScreens, markOnboardingCompleted } from './selector';
import { Card, Button } from '@/design/components';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onComplete,
  onSkip,
}) => {
  const { screens } = getOnboardingScreens();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentScreen = screens[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === screens.length - 1;

  const handleNext = () => {
    if (isLast) {
      markOnboardingCompleted();
      onComplete();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirst) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    markOnboardingCompleted();
    onSkip?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 relative animate-scale-in">
        {/* Skip Button */}
        {onSkip && (
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 text-content-tertiary hover:text-content-primary transition-colors"
            title="Пропустить"
          >
            <X size={24} />
          </button>
        )}

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-6">
          {screens.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-brand-primary'
                  : index < currentIndex
                  ? 'bg-success'
                  : 'bg-surface-tertiary'
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        {currentScreen.icon && (
          <div className="text-center mb-4">
            <div className="text-6xl">{currentScreen.icon}</div>
          </div>
        )}

        {/* Title */}
        <h2 className="text-2xl font-bold text-content-primary text-center mb-4">
          {currentScreen.title}
        </h2>

        {/* Description */}
        <p className="text-content-secondary text-center mb-6">
          {currentScreen.description}
        </p>

        {/* Tips */}
        {currentScreen.tips && currentScreen.tips.length > 0 && (
          <div className="mb-6 space-y-3">
            {currentScreen.tips.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-surface-secondary rounded-lg"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-brand-primary/20 text-brand-primary rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  {index + 1}
                </div>
                <div className="flex-1 text-sm text-content-primary">
                  {tip}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={isFirst}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isFirst
                ? 'text-content-tertiary cursor-not-allowed'
                : 'text-brand-primary hover:bg-brand-primary/10'
            }`}
          >
            <ChevronLeft size={20} />
            Назад
          </button>

          <div className="text-sm text-content-tertiary">
            {currentIndex + 1} / {screens.length}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg font-semibold hover:shadow-md transition-all"
          >
            {isLast ? 'Начать работу' : 'Далее'}
            {!isLast && <ChevronRight size={20} />}
          </button>
        </div>

        {/* Skip link */}
        {!isLast && onSkip && (
          <div className="text-center mt-4">
            <button
              onClick={handleSkip}
              className="text-sm text-content-tertiary hover:text-content-primary underline"
            >
              Пропустить обучение
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};


