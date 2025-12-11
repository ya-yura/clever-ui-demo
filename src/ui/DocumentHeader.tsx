/**
 * 📄 DOCUMENT HEADER
 * "Первый взгляд = понимание" (Джеки Рид)
 * 
 * На первом экране каждого документа пользователь должен сразу понять:
 * - Что это за документ
 * - Какой прогресс выполнения
 * - Какое следующее действие
 */

import React from 'react';
import { motion } from 'framer-motion';
import { StatusType, statusColors } from '../styles/statusColors';
import { StatusIcon } from './StatusIcon';
import { ProgressBar } from './ProgressBar';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

interface DocumentHeaderProps {
  // Идентификация
  documentType: string;
  documentNumber: string;
  
  // Прогресс
  completed: number;
  total: number;
  status?: StatusType;
  
  // Следующее действие
  nextAction?: string;
  
  // Метаданные
  date?: Date;
  partner?: string;
  warehouse?: string;
  
  // Навигация
  onBack?: () => void;
  
  // Дополнительные элементы
  actions?: React.ReactNode;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  documentType,
  documentNumber,
  completed,
  total,
  status,
  nextAction,
  date,
  partner,
  warehouse,
  onBack,
  actions,
}) => {
  const calculatedStatus = status || (completed === total ? 'success' : completed > 0 ? 'inProgress' : 'pending');
  const colors = statusColors[calculatedStatus];
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-b shadow-sm"
    >
      {/* Верхняя панель с навигацией */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Назад"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
          )}
          
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">
              {documentType}
            </p>
            <p className="text-xl font-bold text-gray-900">
              №{documentNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusIcon status={calculatedStatus} size="md" showPulse={calculatedStatus === 'inProgress'} />
          {actions}
        </div>
      </div>

      {/* Прогресс */}
      <div className="px-4 pb-3">
        <ProgressBar
          current={completed}
          total={total}
          showLabel={true}
          showPercentage={true}
        />
      </div>

      {/* Следующее действие */}
      {nextAction && completed < total && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`px-4 py-3 ${colors.bg} border-t ${colors.border}`}
        >
          <p className={`text-sm font-medium ${colors.text} flex items-center gap-2`}>
            <span className="text-lg">→</span>
            {nextAction}
          </p>
        </motion.div>
      )}

      {/* Метаданные */}
      {(date || partner || warehouse) && (
        <div className="px-4 py-2 bg-gray-50 border-t grid grid-cols-2 gap-2 text-xs">
          {date && (
            <div>
              <span className="text-gray-500">Дата:</span>{' '}
              <span className="font-medium text-gray-700">
                {formatDate(date)}
              </span>
            </div>
          )}
          
          {partner && (
            <div>
              <span className="text-gray-500">Напарник:</span>{' '}
              <span className="font-medium text-gray-700">{partner}</span>
            </div>
          )}
          
          {warehouse && (
            <div className="col-span-2">
              <span className="text-gray-500">Склад:</span>{' '}
              <span className="font-medium text-gray-700">{warehouse}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

/**
 * 🎯 COMPACT DOCUMENT HEADER
 * Компактная версия для вложенных экранов
 */
interface CompactDocumentHeaderProps {
  title: string;
  subtitle?: string;
  status?: StatusType;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export const CompactDocumentHeader: React.FC<CompactDocumentHeaderProps> = ({
  title,
  subtitle,
  status = 'neutral',
  onBack,
  actions,
}) => {
  return (
    <div className="bg-white border-b shadow-sm px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Назад"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-gray-900 truncate">
              {title}
            </p>
            {subtitle && (
              <p className="text-sm text-gray-500 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusIcon status={status} size="sm" />
          {actions}
        </div>
      </div>
    </div>
  );
};

function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Сегодня';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Вчера';
  } else {
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short' 
    });
  }
}

