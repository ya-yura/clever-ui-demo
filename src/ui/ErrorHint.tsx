/**
 * ⚠️ ERROR HINT
 * Ошибки как направляющие подсказки, а не наказание
 * Принцип "Error-as-Guidance" (Джеки Рид)
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { statusColors } from '../styles/statusColors';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface ErrorHintProps {
  error: string;
  guidance: string;
  onDismiss?: () => void;
  autoDismiss?: number;
  vibrate?: boolean;
}

export const ErrorHint: React.FC<ErrorHintProps> = ({
  error,
  guidance,
  onDismiss,
  autoDismiss = 5000,
  vibrate = true,
}) => {
  useEffect(() => {
    // Легкая вибрация для тактильной обратной связи
    if (vibrate && 'vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]);
    }

    if (autoDismiss > 0) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss, vibrate]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className={`
        p-4 rounded-lg shadow-lg border-l-4
        ${statusColors.error.bg} 
        ${statusColors.error.border}
        max-w-md mx-auto
      `}
    >
      <div className="flex gap-3">
        <ExclamationTriangleIcon className={`w-6 h-6 ${statusColors.error.icon} flex-shrink-0`} />
        
        <div className="flex-1 space-y-2">
          <p className={`font-semibold ${statusColors.error.text}`}>
            {error}
          </p>
          
          <p className="text-sm text-gray-700 flex items-start gap-2">
            <span className="text-blue-500 font-medium">→</span>
            <span>{guidance}</span>
          </p>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  );
};

/**
 * 🎯 SCANNER ERROR HINT
 * Специализированная подсказка для ошибок сканирования
 */
interface ScannerErrorHintProps {
  scannedValue: string;
  expectedType: string;
  suggestion: string;
  onRetry?: () => void;
}

export const ScannerErrorHint: React.FC<ScannerErrorHintProps> = ({
  scannedValue,
  expectedType,
  suggestion,
  onRetry,
}) => {
  return (
    <ErrorHint
      error={`Отсканирован неверный код: ${scannedValue}`}
      guidance={`Ожидается ${expectedType}. ${suggestion}`}
      onDismiss={onRetry}
      vibrate={true}
    />
  );
};

