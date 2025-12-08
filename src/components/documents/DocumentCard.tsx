// === 📁 src/components/documents/DocumentCard.tsx ===
// Document card component for list display

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UniversalDocument,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_ICONS,
  STATUS_LABELS,
} from '@/types/document';
import { DocumentStatus } from '@/types/common';
import { documentService } from '@/services/documentService';
import { formatDate, formatRelativeTime } from '@/utils/date';
import { Card, Badge, ProgressBar, BadgeVariant } from '@/design/components';
import { Eye, Star } from 'lucide-react';

interface DocumentCardProps {
  document: UniversalDocument;
  onQuickView?: (document: UniversalDocument) => void;
  onTogglePin?: (documentId: string) => void;
  isPinned?: boolean;
}

// Map document status to badge variant
const getStatusVariant = (status: DocumentStatus): BadgeVariant => {
  switch (status) {
    case 'completed': return 'success';
    case 'in_progress': return 'info'; // Brand secondary is teal/info
    case 'cancelled': return 'error';
    case 'error': return 'error';
    case 'synced': return 'info';
    default: return 'neutral';
  }
};

export const DocumentCard: React.FC<DocumentCardProps> = ({ 
  document, 
  onQuickView, 
  onTogglePin,
  isPinned = false 
}) => {
  const navigate = useNavigate();
  
  const completionPercentage = documentService.getCompletionPercentage(document);
  const isOverdue = document.dueDate && document.dueDate < Date.now() && 
                     document.status !== 'completed' && document.status !== 'cancelled';

  const handleClick = () => {
    const url = documentService.getDocumentUrl(document);
    navigate(url);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView?.(document);
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePin?.(document.id);
  };

  const getActionButtonText = () => {
    if (document.status === 'completed') return 'Просмотр';
    if (document.status === 'in_progress') return 'Продолжить';
    return 'Начать';
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClick();
  };

  return (
    <Card
      variant="interactive"
      onClick={handleClick}
      className="p-4 hover:shadow-lg transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-xl">
            <span className="text-2xl">{DOCUMENT_TYPE_ICONS[document.type]}</span>
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold text-content-primary mb-0.5">
              {document.number || `#${document.id.slice(0, 8).toUpperCase()}`}
            </div>
            <Badge 
              label={DOCUMENT_TYPE_LABELS[document.type]}
              variant="neutral"
              className="text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pin/Favorite Button */}
          {onTogglePin && (
            <button
              onClick={handleTogglePin}
              className={`p-2 hover:bg-surface-tertiary rounded-lg transition-all ${
                isPinned ? 'text-warning' : 'text-content-tertiary'
              }`}
              title={isPinned ? 'Открепить' : 'Закрепить'}
            >
              <Star 
                size={18} 
                fill={isPinned ? 'currentColor' : 'none'}
                className="transition-all"
              />
            </button>
          )}
          
          {/* Quick View Button */}
          {onQuickView && (
            <button
              onClick={handleQuickView}
              className="p-2 hover:bg-surface-tertiary rounded-lg transition-colors"
              title="Быстрый просмотр"
            >
              <Eye size={18} className="text-brand-primary" />
            </button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-3">
        <Badge 
          label={STATUS_LABELS[document.status]} 
          variant={getStatusVariant(document.status)}
          className="text-sm"
        />
      </div>

      {/* Partner Info */}
      {document.partnerName && (
        <div className="mb-2 text-sm text-content-secondary">
          <span className="text-content-tertiary">Контрагент:</span>{' '}
          <span className="font-medium">{document.partnerName}</span>
        </div>
      )}

      {/* Progress Bar */}
      {document.totalQuantity && document.totalQuantity > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-content-tertiary mb-1">
            <span>Прогресс</span>
            <span className="font-medium text-content-primary">{completionPercentage}%</span>
          </div>
          <ProgressBar 
            value={completionPercentage} 
            variant={completionPercentage === 100 ? 'success' : 'primary'} 
            size="sm"
          />
        </div>
      )}

      {/* Stats - Крупное отображение количества позиций */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {document.totalLines !== undefined && (
          <div className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/5 border border-brand-primary/20 rounded-lg px-3 py-2.5">
            <div className="text-xs font-medium text-content-tertiary mb-1">Позиций</div>
            <div className="text-xl font-bold text-content-primary">
              {document.completedLines || 0}
              <span className="text-sm font-normal text-content-tertiary"> / {document.totalLines}</span>
            </div>
          </div>
        )}
        
        {document.totalQuantity !== undefined && (
          <div className="bg-gradient-to-br from-success/10 to-brand-secondary/5 border border-success/20 rounded-lg px-3 py-2.5">
            <div className="text-xs font-medium text-content-tertiary mb-1">Количество</div>
            <div className="text-xl font-bold text-content-primary">
              {document.completedQuantity || 0}
              <span className="text-sm font-normal text-content-tertiary"> / {document.totalQuantity}</span>
            </div>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="space-y-1 text-xs text-content-tertiary">
        {document.route && (
          <div>
            <span className="inline-block w-16">Маршрут:</span>
            <span className="text-content-secondary">{document.route}</span>
          </div>
        )}
        
        {document.vehicle && (
          <div>
            <span className="inline-block w-16">ТС:</span>
            <span className="text-content-secondary">{document.vehicle}</span>
          </div>
        )}
        
        {document.returnReason && (
          <div>
            <span className="inline-block w-16">Причина:</span>
            <span className="text-content-secondary">{document.returnReason}</span>
          </div>
        )}
        
        {document.userName && (
          <div>
            <span className="inline-block w-16">Исполнитель:</span>
            <span className="text-content-secondary">{document.userName}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-surface-tertiary flex items-center justify-between text-xs text-content-tertiary">
        <div className="flex items-center gap-3">
          <div title={formatDate(document.createdAt)}>
            📅 {formatRelativeTime(document.createdAt)}
          </div>
          
          {document.updatedAt !== document.createdAt && (
            <div title={formatDate(document.updatedAt)}>
              🔄 {formatRelativeTime(document.updatedAt)}
            </div>
          )}
        </div>

        {isOverdue && (
          <div className="text-error font-medium">
            ⚠️ Просрочен
          </div>
        )}
      </div>

      {/* Notes Preview */}
      {document.notes && (
        <div className="mt-2 text-xs text-content-secondary italic truncate">
          💬 {document.notes}
        </div>
      )}

      {/* CTA Button - Начать/Продолжить */}
      <div className="mt-4 pt-3 border-t border-surface-tertiary">
        <button
          onClick={handleActionClick}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
            document.status === 'completed'
              ? 'bg-surface-tertiary text-content-primary hover:bg-surface-tertiary/80'
              : 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {getActionButtonText()}
        </button>
      </div>
    </Card>
  );
};
