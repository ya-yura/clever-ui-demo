/**
 * 🎯 ACTION SCREEN
 * Реализация паттерна Signal → Action → Feedback (Джеки Рид)
 * 
 * Каждый экран должен иметь:
 * 1. Сигнал - что нужно сделать сейчас
 * 2. Действие - явная зона взаимодействия
 * 3. Обратная связь - мгновенная реакция системы
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusType, statusColors } from '../styles/statusColors';
import { StatusIcon } from './StatusIcon';

interface ActionScreenProps {
  // SIGNAL
  signalText: string;
  signalSubtext?: string;
  signalStatus?: StatusType;
  
  // ACTION
  actionLabel: string;
  actionIcon?: React.ReactNode;
  onAction: () => Promise<void> | void;
  disabled?: boolean;
  
  // FEEDBACK
  feedbackMode?: 'vibration' | 'animation' | 'sound' | 'all';
  successMessage?: string;
  
  // CONTENT
  children?: React.ReactNode;
}

export const ActionScreen: React.FC<ActionScreenProps> = ({
  signalText,
  signalSubtext,
  signalStatus = 'pending',
  actionLabel,
  actionIcon,
  onAction,
  disabled = false,
  feedbackMode = 'all',
  successMessage = 'Готово!',
  children,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAction = async () => {
    if (disabled || isProcessing) return;

    setIsProcessing(true);

    try {
      // Выполнить действие
      await onAction();

      // FEEDBACK - мгновенная обратная связь
      provideFeedback(feedbackMode);
      
      // Показать успешное сообщение
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* SIGNAL - Что нужно сделать */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 text-center"
      >
        <div className="flex justify-center mb-3">
          <StatusIcon 
            status={isProcessing ? 'inProgress' : signalStatus} 
            size="lg"
            showPulse={isProcessing}
          />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {signalText}
        </h2>
        
        {signalSubtext && (
          <p className="text-gray-600">
            {signalSubtext}
          </p>
        )}
      </motion.div>

      {/* CONTENT - Дополнительная информация */}
      <div className="flex-1 overflow-auto px-4">
        {children}
      </div>

      {/* ACTION - Крупная зона действия */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`
                w-full py-6 rounded-2xl
                ${statusColors.success.vibrant}
                text-white font-bold text-xl
                flex items-center justify-center gap-3
              `}
            >
              <StatusIcon status="success" size="lg" />
              {successMessage}
            </motion.div>
          ) : (
            <motion.button
              key="action"
              onClick={handleAction}
              disabled={disabled || isProcessing}
              whileTap={{ scale: 0.95 }}
              className={`
                w-full py-6 rounded-2xl
                font-bold text-xl
                flex items-center justify-center gap-3
                transition-all duration-200
                ${disabled || isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white shadow-lg hover:shadow-xl active:shadow-md'
                }
              `}
            >
              {isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    ⟳
                  </motion.div>
                  Обработка...
                </>
              ) : (
                <>
                  {actionIcon}
                  {actionLabel}
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * Предоставить обратную связь пользователю
 */
function provideFeedback(mode: 'vibration' | 'animation' | 'sound' | 'all') {
  if (mode === 'vibration' || mode === 'all') {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }
  
  if (mode === 'sound' || mode === 'all') {
    // Воспроизвести звук успеха, если доступно
    const audio = new Audio('/sounds/success.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Игнорировать ошибки воспроизведения
    });
  }
}

