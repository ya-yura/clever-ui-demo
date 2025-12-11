/**
 * 🃏 ITEM CARD
 * Карточка товара для списков позиций документа
 * С поддержкой прогресса, статусов и быстрых действий
 */

import React from 'react';
import { motion } from 'framer-motion';
import { StatusType, statusColors } from '../styles/statusColors';
import { StatusIcon } from './StatusIcon';

interface ItemCardProps {
  // Основная информация
  name: string;
  barcode: string;
  article?: string;
  
  // Количество
  expected: number;
  scanned: number;
  unit?: string;
  
  // Статус
  status?: StatusType;
  
  // Дополнительная информация
  cell?: string;
  batch?: string;
  
  // Действия
  onClick?: () => void;
  onScan?: () => void;
  
  // Визуальные опции
  showProgress?: boolean;
  highlight?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  name,
  barcode,
  article,
  expected,
  scanned,
  unit = 'шт',
  status,
  cell,
  batch,
  onClick,
  onScan,
  showProgress = true,
  highlight = false,
}) => {
  const calculatedStatus = status || getItemStatus(scanned, expected);
  const colors = statusColors[calculatedStatus];
  const progress = expected > 0 ? Math.round((scanned / expected) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative p-4 rounded-lg border-l-4 bg-white shadow-sm
        ${colors.border}
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
        ${highlight ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
        transition-all
      `}
    >
      {/* Заголовок с именем и статусом */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">
            {name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span>{barcode}</span>
            {article && (
              <>
                <span>•</span>
                <span>Арт: {article}</span>
              </>
            )}
          </div>
        </div>
        
        <StatusIcon status={calculatedStatus} size="sm" />
      </div>

      {/* Количество */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-2xl font-bold text-gray-900">
            {scanned}
          </span>
          <span className="text-gray-500 ml-1">/ {expected}</span>
          <span className="text-xs text-gray-500 ml-1">{unit}</span>
        </div>
        
        {scanned === expected && (
          <span className={`px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
            Готово
          </span>
        )}
      </div>

      {/* Прогресс-бар */}
      {showProgress && (
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={`h-2 rounded-full ${colors.vibrant}`}
            />
          </div>
        </div>
      )}

      {/* Дополнительная информация */}
      {(cell || batch) && (
        <div className="flex gap-3 text-xs text-gray-600">
          {cell && (
            <div className="flex items-center gap-1">
              <span>Ячейка: {cell}</span>
            </div>
          )}
          {batch && (
            <div className="flex items-center gap-1">
              <span>Партия: {batch}</span>
            </div>
          )}
        </div>
      )}

      {/* Кнопка быстрого сканирования */}
      {onScan && scanned < expected && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onScan();
          }}
          className={`
            mt-3 w-full py-2 rounded-lg font-medium text-sm
            ${colors.vibrant} text-white
            hover:opacity-90 transition-opacity
          `}
        >
          Сканировать
        </motion.button>
      )}
    </motion.div>
  );
};

/**
 * Определить статус позиции на основе прогресса
 */
function getItemStatus(scanned: number, expected: number): StatusType {
  if (scanned === 0) return 'pending';
  if (scanned === expected) return 'success';
  if (scanned < expected) return 'inProgress';
  return 'warning'; // Отсканировано больше ожидаемого
}

/**
 * 📋 ITEM LIST
 * Список позиций с группировкой по статусу
 */
interface ItemListProps {
  items: Array<{
    id: string;
    name: string;
    barcode: string;
    expected: number;
    scanned: number;
    cell?: string;
    batch?: string;
  }>;
  onItemClick?: (id: string) => void;
  onItemScan?: (id: string) => void;
}

export const ItemList: React.FC<ItemListProps> = ({
  items,
  onItemClick,
  onItemScan,
}) => {
  // Группировка по статусу
  const notStarted = items.filter(item => item.scanned === 0);
  const inProgress = items.filter(item => item.scanned > 0 && item.scanned < item.expected);
  const completed = items.filter(item => item.scanned === item.expected);

  return (
    <div className="space-y-6">
      {/* Не начаты */}
      {notStarted.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase px-4">
            Не начаты ({notStarted.length})
          </h3>
          <div className="space-y-2">
            {notStarted.map(item => (
              <ItemCard
                key={item.id}
                {...item}
                onClick={() => onItemClick?.(item.id)}
                onScan={() => onItemScan?.(item.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* В процессе */}
      {inProgress.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase px-4">
            В процессе ({inProgress.length})
          </h3>
          <div className="space-y-2">
            {inProgress.map(item => (
              <ItemCard
                key={item.id}
                {...item}
                onClick={() => onItemClick?.(item.id)}
                onScan={() => onItemScan?.(item.id)}
                highlight
              />
            ))}
          </div>
        </div>
      )}

      {/* Выполнены */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase px-4">
            Выполнено ({completed.length})
          </h3>
          <div className="space-y-2">
            {completed.map(item => (
              <ItemCard
                key={item.id}
                {...item}
                onClick={() => onItemClick?.(item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

