// === 📁 src/components/documents/DocumentList.tsx ===
// Virtualized document list component for handling large datasets

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UniversalDocument, DOCUMENT_TYPE_LABELS } from '@/types/document';
import { DocumentCard } from './DocumentCard';
import { DocumentListSkeleton } from './DocumentListSkeleton';
import { QuickViewModal } from './QuickViewModal';

interface DocumentListProps {
  documents: UniversalDocument[];
  loading?: boolean;
  groupByType?: boolean;
}

const INITIAL_LOAD = 20;  // Initial number of documents to show
const LOAD_MORE = 20;     // Number of documents to load on scroll

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading = false,
  groupByType = false,
}) => {
  const [displayCount, setDisplayCount] = useState(INITIAL_LOAD);
  const [quickViewDoc, setQuickViewDoc] = useState<UniversalDocument | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

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
      <div>
        <DocumentListSkeleton count={6} />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="text-5xl mb-3">📋</div>
          <div className="text-base font-semibold text-content-primary mb-1">
            Документы не найдены
          </div>
          <div className="text-sm text-content-tertiary">
            Попробуйте изменить параметры фильтрации
          </div>
        </div>
      </div>
    );
  }

  // US VII.3: Grouped render
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
                  <DocumentCard key={doc.id} document={doc} onQuickView={handleQuickView} />
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

  // Regular render
  return (
    <div className="space-y-2.5">
      {/* Document Cards */}
      {visibleDocuments.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}

      {/* Load More Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-3 text-center">
          <div className="text-xs text-content-tertiary">
            Загружено {displayCount} из {documents.length}
          </div>
          <div className="mt-1.5 animate-pulse">
            <div className="inline-block w-1.5 h-1.5 bg-brand-primary rounded-full mx-0.5"></div>
            <div className="inline-block w-1.5 h-1.5 bg-brand-primary rounded-full mx-0.5"></div>
            <div className="inline-block w-1.5 h-1.5 bg-brand-primary rounded-full mx-0.5"></div>
          </div>
        )}
      </div>

      {/* End of List */}
      {!hasMore && documents.length > INITIAL_LOAD && (
        <div className="py-3 text-center text-xs text-content-tertiary">
          ✓ Все документы загружены ({documents.length})
        </div>
      )}
    </>
  );
};

