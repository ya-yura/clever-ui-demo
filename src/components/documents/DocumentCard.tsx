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

interface DocumentCardProps {
  document: UniversalDocument;
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

export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const navigate = useNavigate();
  
  const completionPercentage = documentService.getCompletionPercentage(document);
  const isOverdue = document.dueDate && document.dueDate < Date.now() && 
                     document.status !== 'completed' && document.status !== 'cancelled';

  const handleClick = () => {
    const url = documentService.getDocumentUrl(document);
    navigate(url);
  };

  // Format date like "16.06 14:16"
  const formatCompactDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month} ${hours}:${minutes}`;
  };

  // Format full date for title like "16.06.25 14:16:26"
  const formatFullDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div
      onClick={handleClick}
      className="bg-surface-secondary hover:bg-surface-tertiary border border-borders-default rounded-lg px-3 py-2.5 cursor-pointer transition-colors"
    >
      {/* Top Row: Title with date and Status */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-content-primary truncate">
            {DOCUMENT_TYPE_LABELS[document.type]} {formatFullDate(document.createdAt)}
          </h3>
          {document.number && (
            <div className="text-[11px] text-content-tertiary mt-0.5">
              {document.number}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-content-tertiary whitespace-nowrap">
            {formatCompactDate(document.createdAt)}
          </span>
          <Badge 
            label={STATUS_LABELS[document.status]} 
            variant={getStatusVariant(document.status)} 
          />
        </div>
      </div>

      {/* Bottom Row: User info with stats */}
      <div className="flex items-center gap-2 text-xs text-content-secondary">
        {document.userName && (
          <span>Кладовщик</span>
        )}
        {document.partnerName && !document.userName && (
          <span>{document.partnerName}</span>
        )}
        
        <span className="text-content-tertiary">•</span>
        
        {/* Always show item count if available */}
        {document.totalLines !== undefined && document.totalLines > 0 && (
          <span className="text-content-tertiary">
            {document.completedLines || 0}
          </span>
        )}
      </div>
    </div>
  );
};
