// === 📁 src/components/common/GroupedDocumentList.tsx ===
// Grouped document list component (already implemented in DocumentList but as standalone)

import React from 'react';
import { UniversalDocument } from '@/types/document';
import { groupDocumentsByDate, sortDocumentsInGroups } from '@/utils/documentGrouping';
import { DocumentCard } from '../documents/DocumentCard';
import { usePinnedDocuments } from '@/hooks/usePinnedDocuments';

interface GroupedDocumentListProps {
  documents: UniversalDocument[];
  onDocumentClick?: (document: UniversalDocument) => void;
  showPinning?: boolean;
}

export const GroupedDocumentList: React.FC<GroupedDocumentListProps> = ({
  documents,
  onDocumentClick,
  showPinning = true,
}) => {
  const { isPinned, togglePin } = usePinnedDocuments();

  // Enrich documents with isPinned property
  const enrichedDocs = documents.map(doc => ({
    ...doc,
    isPinned: isPinned(doc.id),
  }));

  // Group by date
  const grouped = groupDocumentsByDate(enrichedDocs);
  const sortedGroups = sortDocumentsInGroups(grouped);

  if (documents.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <div className="text-xl font-semibold text-content-primary mb-2">
            Документы не найдены
          </div>
          <div className="text-content-tertiary">
            Попробуйте изменить параметры поиска
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {sortedGroups.map((group) => (
        <div key={group.group}>
          {/* Sticky Group Header */}
          <div className="sticky top-0 z-20 bg-surface-secondary/95 backdrop-blur-sm border-b border-surface-tertiary px-4 py-3 shadow-sm">
            <h3 className="font-semibold text-sm text-content-primary flex items-center gap-2">
              {group.label}
              <span className="text-xs text-content-tertiary font-normal">
                ({group.documents.length})
              </span>
            </h3>
          </div>

          {/* Documents in Group */}
          <div className="p-4 space-y-3 bg-surface-primary">
            {group.documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onQuickView={onDocumentClick ? () => onDocumentClick(doc) : undefined}
                onTogglePin={showPinning ? togglePin : undefined}
                isPinned={isPinned(doc.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
