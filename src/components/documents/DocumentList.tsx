// === 📁 src/components/documents/DocumentList.tsx ===
// Virtualized document list component for handling large datasets

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UniversalDocument, DOCUMENT_TYPE_LABELS } from '@/types/document';
import { DocumentCard } from './DocumentCard';
import { DocumentListSkeleton } from './DocumentListSkeleton';
import { QuickViewModal } from './QuickViewModal';
import { groupDocumentsByDate, sortDocumentsInGroups } from '@/utils/documentGrouping';
import { usePinnedDocuments } from '@/hooks/usePinnedDocuments';

interface DocumentListProps {
  documents: UniversalDocument[];
  loading?: boolean;
  groupByType?: boolean;
  groupByDate?: boolean;
}

const INITIAL_LOAD = 20;  // Initial number of documents to show
const LOAD_MORE = 20;     // Number of documents to load on scroll

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading = false,
  groupByType = false,
  groupByDate = true,
}) => {
  const [displayCount, setDisplayCount] = useState(INITIAL_LOAD);
  const [quickViewDoc, setQuickViewDoc] = useState<UniversalDocument | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Pin management
  const { isPinned, togglePin } = usePinnedDocuments();

  // US VII.3: Группировка по типам
  const groupedDocuments = useMemo(() => {
    if (!groupByType) return null;

    const grouped: Record<string, UniversalDocument[]> = {};
    documents.forEach((doc) => {
      if (!grouped[doc.type]) {
        grouped[doc.type] = [];
      }
      grouped[doc.type].push(doc);
    });
    return grouped;
  }, [documents, groupByType]);

  // Группировка по датам
  const dateGroupedDocuments = useMemo(() => {
    if (!groupByDate) return null;
    
    // Enrich documents with isPinned property
    const enrichedDocs = documents.map(doc => ({
      ...doc,
      isPinned: isPinned(doc.id),
    }));
    
    const grouped = groupDocumentsByDate(enrichedDocs);
    return sortDocumentsInGroups(grouped);
  }, [documents, groupByDate, isPinned]);

  // Reset display count when documents change
  useEffect(() => {
    setDisplayCount(INITIAL_LOAD);
  }, [documents]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && displayCount < documents.length) {
          setDisplayCount(prev => Math.min(prev + LOAD_MORE, documents.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [displayCount, documents.length]);

  const visibleDocuments = documents.slice(0, displayCount);
  const hasMore = displayCount < documents.length;

  // US VII.7: Быстрый просмотр
  const handleQuickView = (doc: UniversalDocument) => {
    setQuickViewDoc(doc);
  };

  if (loading) {
    return (
      <div className="p-4">
        <DocumentListSkeleton count={6} />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <div className="text-xl font-semibold text-gray-700 mb-2">
            Документы не найдены
          </div>
          <div className="text-gray-500">
            Попробуйте изменить параметры фильтрации
          </div>
        </div>
      </div>
    );
  }

  // Группировка по датам с sticky заголовками
  if (groupByDate && dateGroupedDocuments) {
    return (
      <>
        <div className="space-y-1">
          {dateGroupedDocuments.map((group) => (
            <div key={group.group}>
              {/* Sticky заголовок группы */}
              <div className="sticky top-0 z-20 bg-surface-secondary/95 backdrop-blur-sm border-b border-surface-tertiary px-4 py-3 shadow-sm">
                <h3 className="font-semibold text-sm text-content-primary flex items-center gap-2">
                  {group.label}
                  <span className="text-xs text-content-tertiary font-normal">
                    ({group.documents.length})
                  </span>
                </h3>
              </div>
              
              {/* Документы группы */}
              <div className="p-4 space-y-3 bg-surface-primary">
                {group.documents.slice(0, displayCount).map((doc) => (
                  <DocumentCard 
                    key={doc.id} 
                    document={doc} 
                    onQuickView={handleQuickView}
                    onTogglePin={togglePin}
                    isPinned={isPinned(doc.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Load More Trigger */}
        {hasMore && (
          <div ref={loadMoreRef} className="py-4 text-center bg-surface-primary">
            <div className="text-sm text-content-tertiary">
              Загружено {displayCount} из {documents.length}
            </div>
            <div className="mt-2 animate-pulse">
              <div className="inline-block w-2 h-2 bg-brand-primary rounded-full mx-1"></div>
              <div className="inline-block w-2 h-2 bg-brand-primary rounded-full mx-1"></div>
              <div className="inline-block w-2 h-2 bg-brand-primary rounded-full mx-1"></div>
            </div>
          </div>
        )}

        {/* Quick View Modal */}
        {quickViewDoc && (
          <QuickViewModal
            document={quickViewDoc}
            onClose={() => setQuickViewDoc(null)}
          />
        )}
      </>
    );
  }

  // US VII.3: Grouped render по типам
  if (groupByType && groupedDocuments) {
    return (
      <>
        <div className="p-4 space-y-6">
          {Object.entries(groupedDocuments).map(([type, docs]) => (
            <div key={type}>
              <h3 className="font-bold text-sm text-content-tertiary uppercase mb-3 flex items-center gap-2">
                {DOCUMENT_TYPE_LABELS[type as keyof typeof DOCUMENT_TYPE_LABELS]} ({docs.length})
              </h3>
              <div className="space-y-3">
                {docs.slice(0, displayCount).map((doc) => (
                  <DocumentCard 
                    key={doc.id} 
                    document={doc} 
                    onQuickView={handleQuickView}
                    onTogglePin={togglePin}
                    isPinned={isPinned(doc.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick View Modal */}
        {quickViewDoc && (
          <QuickViewModal
            document={quickViewDoc}
            onClose={() => setQuickViewDoc(null)}
          />
        )}
      </>
    );
  }

  // Regular render (без группировки)
  return (
    <>
      <div className="p-4 space-y-3">
        {/* Document Cards */}
        {visibleDocuments.map(doc => (
          <DocumentCard 
            key={doc.id} 
            document={doc} 
            onQuickView={handleQuickView}
            onTogglePin={togglePin}
            isPinned={isPinned(doc.id)}
          />
        ))}

        {/* Load More Trigger */}
        {hasMore && (
          <div ref={loadMoreRef} className="py-4 text-center">
            <div className="text-sm text-gray-500">
              Загружено {displayCount} из {documents.length}
            </div>
            <div className="mt-2 animate-pulse">
              <div className="inline-block w-2 h-2 bg-blue-500 rounded-full mx-1"></div>
              <div className="inline-block w-2 h-2 bg-blue-500 rounded-full mx-1"></div>
              <div className="inline-block w-2 h-2 bg-blue-500 rounded-full mx-1"></div>
            </div>
          </div>
        )}

        {/* End of List */}
        {!hasMore && documents.length > INITIAL_LOAD && (
          <div className="py-4 text-center text-sm text-gray-500">
            Все документы загружены ({documents.length})
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {quickViewDoc && (
        <QuickViewModal
          document={quickViewDoc}
          onClose={() => setQuickViewDoc(null)}
        />
      )}
    </>
  );
};

