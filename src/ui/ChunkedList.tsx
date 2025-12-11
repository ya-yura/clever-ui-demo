/**
 * 📋 CHUNKED LIST
 * Группировка информации по принципу Chunking (Джеки Рид)
 * Разбивает большие списки на управляемые когнитивные блоки
 */

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { StatusType, statusColors } from '../styles/statusColors';

interface ChunkedListItem {
  id: string;
  content: ReactNode;
  status?: StatusType;
  timestamp?: Date;
}

interface ChunkedListGroup {
  title: string;
  items: ChunkedListItem[];
  icon?: ReactNode;
  badge?: number;
}

interface ChunkedListProps {
  groups: ChunkedListGroup[];
  emptyMessage?: string;
  onItemClick?: (id: string) => void;
}

export const ChunkedList: React.FC<ChunkedListProps> = ({
  groups,
  emptyMessage = 'Нет элементов',
  onItemClick,
}) => {
  const hasItems = groups.some(group => group.items.length > 0);

  if (!hasItems) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group, groupIndex) => {
        if (group.items.length === 0) return null;

        return (
          <motion.div
            key={groupIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="space-y-3"
          >
            {/* Заголовок группы */}
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                {group.icon}
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  {group.title}
                </h3>
              </div>
              {group.badge !== undefined && (
                <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
                  {group.badge}
                </span>
              )}
            </div>

            {/* Элементы группы */}
            <div className="space-y-2">
              {group.items.map((item, itemIndex) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (groupIndex * 0.1) + (itemIndex * 0.05) }}
                  onClick={() => onItemClick?.(item.id)}
                  className={`
                    ${onItemClick ? 'cursor-pointer hover:shadow-md' : ''}
                    transition-shadow
                  `}
                >
                  {item.content}
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

/**
 * 📄 DOCUMENT CHUNKED LIST
 * Специализированный список для группировки документов
 */
interface DocumentChunkedListProps {
  documents: Array<{
    id: string;
    number: string;
    type: string;
    status: StatusType;
    date: Date;
    itemsCount?: number;
    completed?: number;
  }>;
  onDocumentClick: (id: string) => void;
}

export const DocumentChunkedList: React.FC<DocumentChunkedListProps> = ({
  documents,
  onDocumentClick,
}) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Группировка по времени
  const todayDocs = documents.filter(doc => doc.date >= today);
  const weekDocs = documents.filter(doc => doc.date < today && doc.date >= weekAgo);
  const olderDocs = documents.filter(doc => doc.date < weekAgo);

  // Группировка по статусу
  const requireAttention = documents.filter(doc => 
    doc.status === 'error' || doc.status === 'warning'
  );
  const inProgress = documents.filter(doc => 
    doc.status === 'inProgress'
  );
  const completed = documents.filter(doc => 
    doc.status === 'success'
  );

  const groups: ChunkedListGroup[] = [];

  // Приоритет: Требуют внимания
  if (requireAttention.length > 0) {
    groups.push({
      title: 'Требуют внимания',
      badge: requireAttention.length,
      items: requireAttention.map(doc => ({
        id: doc.id,
        content: <DocumentCard doc={doc} onClick={onDocumentClick} />,
        status: doc.status,
      })),
    });
  }

  // В работе
  if (inProgress.length > 0) {
    groups.push({
      title: 'В работе',
      badge: inProgress.length,
      items: inProgress.map(doc => ({
        id: doc.id,
        content: <DocumentCard doc={doc} onClick={onDocumentClick} />,
        status: doc.status,
      })),
    });
  }

  // Сегодня
  if (todayDocs.length > 0) {
    groups.push({
      title: 'Сегодня',
      badge: todayDocs.length,
      items: todayDocs.map(doc => ({
        id: doc.id,
        content: <DocumentCard doc={doc} onClick={onDocumentClick} />,
        status: doc.status,
      })),
    });
  }

  // На этой неделе
  if (weekDocs.length > 0) {
    groups.push({
      title: 'На этой неделе',
      badge: weekDocs.length,
      items: weekDocs.map(doc => ({
        id: doc.id,
        content: <DocumentCard doc={doc} onClick={onDocumentClick} />,
        status: doc.status,
      })),
    });
  }

  // Старые
  if (olderDocs.length > 0) {
    groups.push({
      title: 'Старые',
      badge: olderDocs.length,
      items: olderDocs.map(doc => ({
        id: doc.id,
        content: <DocumentCard doc={doc} onClick={onDocumentClick} />,
        status: doc.status,
      })),
    });
  }

  return (
    <ChunkedList
      groups={groups}
      emptyMessage="Нет документов"
      onItemClick={onDocumentClick}
    />
  );
};

/**
 * 🃏 DOCUMENT CARD
 * Карточка документа для использования в списках
 */
interface DocumentCardProps {
  doc: {
    id: string;
    number: string;
    type: string;
    status: StatusType;
    itemsCount?: number;
    completed?: number;
  };
  onClick: (id: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onClick }) => {
  const colors = statusColors[doc.status];
  const progress = doc.itemsCount && doc.completed 
    ? Math.round((doc.completed / doc.itemsCount) * 100) 
    : 0;

  return (
    <div
      onClick={() => onClick(doc.id)}
      className={`
        p-4 rounded-lg border-l-4 cursor-pointer
        bg-white shadow-sm hover:shadow-md transition-all
        ${colors.border}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs text-gray-500 uppercase font-medium">
            {doc.type}
          </p>
          <p className="text-lg font-bold text-gray-900">
            №{doc.number}
          </p>
        </div>
        
        <span className={`px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
          {getStatusLabel(doc.status)}
        </span>
      </div>

      {doc.itemsCount && doc.completed !== undefined && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Прогресс</span>
            <span className="font-medium">{doc.completed} / {doc.itemsCount}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${colors.vibrant}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

function getStatusLabel(status: StatusType): string {
  const labels: Record<StatusType, string> = {
    success: 'Выполнен',
    error: 'Ошибка',
    warning: 'Предупреждение',
    pending: 'Ожидает',
    inProgress: 'В работе',
    neutral: 'Информация',
  };
  return labels[status];
}

