// === 📁 src/components/documents/DocumentCard.tsx ===
// Document card component for list display

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UniversalDocument,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_ICONS,
  STATUS_LABELS,
  STATUS_COLORS,
} from '@/types/document';
import { documentService } from '@/services/documentService';
import { formatDate, formatRelativeTime } from '@/utils/date';

interface DocumentCardProps {
  document: UniversalDocument;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const navigate = useNavigate();
  
  const completionPercentage = documentService.getCompletionPercentage(document);
  const isOverdue = document.dueDate && document.dueDate < Date.now() && 
                     document.status !== 'completed' && document.status !== 'cancelled';

  const handleClick = () => {
    const url = documentService.getDocumentUrl(document);
    navigate(url);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer active:bg-gray-50"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{DOCUMENT_TYPE_ICONS[document.type]}</span>
          <div>
            <div className="font-semibold text-gray-900">
              {document.number || document.id.slice(0, 8)}
            </div>
            <div className="text-xs text-gray-500">
              {DOCUMENT_TYPE_LABELS[document.type]}
            </div>
          </div>
        </div>

        <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[document.status]}`}>
          {STATUS_LABELS[document.status]}
        </span>
      </div>

      {/* Partner Info */}
      {document.partnerName && (
        <div className="mb-2 text-sm text-gray-700">
          <span className="text-gray-500">Контрагент:</span>{' '}
          <span className="font-medium">{document.partnerName}</span>
        </div>
      )}

      {/* Progress Bar */}
      {document.totalQuantity && document.totalQuantity > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Прогресс</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                completionPercentage === 100
                  ? 'bg-green-500'
                  : completionPercentage > 0
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        {document.totalLines !== undefined && (
          <div className="bg-gray-50 rounded px-2 py-1">
            <div className="text-xs text-gray-500">Строк</div>
            <div className="font-medium">
              {document.completedLines || 0} / {document.totalLines}
            </div>
          </div>
        )}
        
        {document.totalQuantity !== undefined && (
          <div className="bg-gray-50 rounded px-2 py-1">
            <div className="text-xs text-gray-500">Количество</div>
            <div className="font-medium">
              {document.completedQuantity || 0} / {document.totalQuantity}
            </div>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="space-y-1 text-xs text-gray-500">
        {document.route && (
          <div>
            <span className="inline-block w-16">Маршрут:</span>
            <span className="text-gray-700">{document.route}</span>
          </div>
        )}
        
        {document.vehicle && (
          <div>
            <span className="inline-block w-16">ТС:</span>
            <span className="text-gray-700">{document.vehicle}</span>
          </div>
        )}
        
        {document.returnReason && (
          <div>
            <span className="inline-block w-16">Причина:</span>
            <span className="text-gray-700">{document.returnReason}</span>
          </div>
        )}
        
        {document.userName && (
          <div>
            <span className="inline-block w-16">Исполнитель:</span>
            <span className="text-gray-700">{document.userName}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
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
          <div className="text-red-600 font-medium">
            ⚠️ Просрочен
          </div>
        )}
      </div>

      {/* Notes Preview */}
      {document.notes && (
        <div className="mt-2 text-xs text-gray-600 italic truncate">
          💬 {document.notes}
        </div>
      )}
    </div>
  );
};

