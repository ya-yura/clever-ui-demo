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

  return (
    <div
      onClick={handleClick}
      className="bg-surface-secondary hover:bg-surface-tertiary border border-borders-default rounded-lg px-3 py-2.5 cursor-pointer transition-colors"
    >
      {/* Top Row: Title and Status */}
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-content-primary truncate">
            {document.number || document.id}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-content-tertiary">
            {formatDate(document.createdAt).split(' ')[0]} {formatDate(document.createdAt).split(' ')[1]}
          </span>
          <Badge 
            label={STATUS_LABELS[document.status]} 
            variant={getStatusVariant(document.status)} 
          />
        </div>
      </div>

      {/* Bottom Row: User/Partner + Progress indicator */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-content-secondary">
          {document.userName && (
            <span>{document.userName}</span>
          )}
          {document.partnerName && !document.userName && (
            <span>{document.partnerName}</span>
          )}
          
          {/* Progress indicator - only for in-progress documents */}
          {document.status === 'in_progress' && document.totalLines && (
            <div className="flex items-center gap-1">
              <span className="text-brand-primary">●</span>
              <span className="text-content-tertiary">
                {document.completedLines || 0}
              </span>
            </div>
          )}
        </div>

        {/* Compact stats for completed/total */}
        {document.totalLines !== undefined && document.totalLines > 0 && (
          <div className="text-[10px] text-content-tertiary">
            {document.completedLines || 0}/{document.totalLines}
          </div>
        )}
      </div>
    </div>
  );
};
