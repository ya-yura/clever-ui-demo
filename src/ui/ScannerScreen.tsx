/**
 * 📱 SCANNER SCREEN
 * Универсальный экран сканирования с максимальной обратной связью
 * 
 * Реализует принципы:
 * - Signal → Action → Feedback
 * - Single Path Flow
 * - Immediate Contextual Guidance
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusType, statusColors } from '../styles/statusColors';
import { MicroHint } from './MicroHint';
import { ErrorHint } from './ErrorHint';
import { StatusIcon } from './StatusIcon';
import { QrCodeIcon } from '@heroicons/react/24/solid';

interface ScannerScreenProps {
  // Сигнал
  signalText: string;
  signalSubtext?: string;
  expectedType?: string;
  
  // Обработка сканирования
  onScan: (value: string) => Promise<ScanResult>;
  
  // Контекст
  currentProgress?: {
    current: number;
    total: number;
  };
  
  // Автоматическая навигация
  autoNavigateOnComplete?: boolean;
  onComplete?: () => void;
  
  // Дополнительные действия
  actions?: React.ReactNode;
}

export interface ScanResult {
  success: boolean;
  message?: string;
  error?: string;
  guidance?: string;
  autoAdvance?: boolean;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({
  signalText,
  signalSubtext,
  expectedType,
  onScan,
  currentProgress,
  autoNavigateOnComplete = false,
  onComplete,
  actions,
}) => {
  const [scanValue, setScanValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Автофокус на поле ввода
  useEffect(() => {
    inputRef.current?.focus();
  }, [lastResult]);

  // Обработка сканирования
  const handleScan = async (value: string) => {
    if (!value.trim() || isProcessing) return;

    setIsProcessing(true);
    setLastResult(null);

    try {
      const result = await onScan(value);
      setLastResult(result);

      if (result.success) {
        // FEEDBACK: Успех
        provideFeedback('success');
        setShowSuccess(true);

        // Показать успех на 1 секунду
        setTimeout(() => {
          setShowSuccess(false);
          setScanValue('');

          // Автоматический переход при необходимости
          if (result.autoAdvance && autoNavigateOnComplete) {
            onComplete?.();
          }
        }, 1000);
      } else {
        // FEEDBACK: Ошибка
        provideFeedback('error');
        setTimeout(() => {
          setScanValue('');
        }, 3000);
      }
    } catch (error) {
      console.error('Scan error:', error);
      setLastResult({
        success: false,
        error: 'Ошибка обработки',
        guidance: 'Попробуйте отсканировать снова',
      });
      provideFeedback('error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Обработка ввода
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleScan(scanValue);
    }
  };

  // Статус сканера
  const scannerStatus: StatusType = isProcessing
    ? 'inProgress'
    : showSuccess
    ? 'success'
    : lastResult?.success === false
    ? 'error'
    : 'pending';

  const colors = statusColors[scannerStatus];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Прогресс */}
      {currentProgress && (
        <div className="bg-white border-b px-4 py-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Прогресс</span>
            <span className="font-bold text-gray-900">
              {currentProgress.current} / {currentProgress.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(currentProgress.current / currentProgress.total) * 100}%`,
              }}
              className={`h-2 rounded-full transition-all ${
                currentProgress.current === currentProgress.total
                  ? statusColors.success.vibrant
                  : statusColors.inProgress.vibrant
              }`}
            />
          </div>
        </div>
      )}

      {/* SIGNAL - Что нужно сделать */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <SuccessAnimation key="success" />
          ) : (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center w-full max-w-md"
            >
              {/* Иконка сканера */}
              <motion.div
                animate={
                  isProcessing
                    ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
                    : {}
                }
                transition={{ duration: 0.5, repeat: isProcessing ? Infinity : 0 }}
                className={`
                  w-32 h-32 mx-auto mb-6 rounded-full
                  flex items-center justify-center
                  ${colors.bg} ${colors.border} border-4
                `}
              >
                <StatusIcon
                  status={scannerStatus}
                  size="lg"
                  showPulse={isProcessing}
                />
              </motion.div>

              {/* Текст подсказки */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {signalText}
              </h2>

              {signalSubtext && (
                <p className="text-gray-600 mb-6">{signalSubtext}</p>
              )}

              {expectedType && (
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Ожидается: {expectedType}
                  </span>
                </div>
              )}

              {/* ACTION - Зона сканирования */}
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={scanValue}
                  onChange={(e) => setScanValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isProcessing}
                  placeholder="Отсканируйте штрихкод..."
                  className={`
                    w-full px-4 py-4 rounded-xl border-2 text-center text-lg
                    focus:outline-none focus:ring-4 transition-all
                    ${colors.border} ${colors.ring}
                    ${isProcessing ? 'bg-gray-100 cursor-wait' : 'bg-white'}
                  `}
                />
                
                <motion.div
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <QrCodeIcon className="w-6 h-6 text-gray-400" />
                </motion.div>
              </div>

              {/* Кнопка ручного ввода */}
              <button
                onClick={() => handleScan(scanValue)}
                disabled={!scanValue.trim() || isProcessing}
                className={`
                  mt-4 w-full py-3 rounded-xl font-medium
                  transition-all
                  ${
                    !scanValue.trim() || isProcessing
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                  }
                `}
              >
                {isProcessing ? 'Обработка...' : 'Подтвердить'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FEEDBACK - Результаты сканирования */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {lastResult && !lastResult.success && lastResult.error && (
            <ErrorHint
              key="error"
              error={lastResult.error}
              guidance={lastResult.guidance || 'Попробуйте еще раз'}
              vibrate={true}
            />
          )}

          {lastResult && lastResult.success && lastResult.message && (
            <MicroHint
              key="success"
              message={lastResult.message}
              status="success"
              showIcon={true}
              persistent={false}
              duration={3000}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Дополнительные действия */}
      {actions && <div className="p-4 pt-0">{actions}</div>}
    </div>
  );
};

/**
 * ✨ SUCCESS ANIMATION
 * Анимация успешного сканирования
 */
const SuccessAnimation: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.2, 1] }}
      exit={{ scale: 0 }}
      className="text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
        className="w-32 h-32 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center"
      >
        <StatusIcon status="success" size="lg" />
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-green-600"
      >
        Отлично!
      </motion.h2>
    </motion.div>
  );
};

/**
 * Предоставить тактильную и визуальную обратную связь
 */
function provideFeedback(type: 'success' | 'error') {
  // Вибрация
  if ('vibrate' in navigator) {
    if (type === 'success') {
      navigator.vibrate(50);
    } else {
      navigator.vibrate([50, 30, 50]);
    }
  }

  // Звук (если доступен)
  try {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Игнорировать ошибки
    });
  } catch {
    // Игнорировать ошибки
  }
}

