// === 📁 src/components/documents/DocumentList.tsx ===
// Virtualized document list component for handling large datasets

import React, { useState, useEffect, useRef } from 'react';
import { UniversalDocument } from '@/types/document';
import { DocumentCard } from './DocumentCard';
import { DocumentListSkeleton } from './DocumentListSkeleton';

interface DocumentListProps {
  documents: UniversalDocument[];
  loading?: boolean;
}

const INITIAL_LOAD = 20;  // Initial number of documents to show
const LOAD_MORE = 20;     // Number of documents to load on scroll

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading = false,
}) => {
  const [displayCount, setDisplayCount] = useState(INITIAL_LOAD);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="space-y-1.5">
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
        </div>
      )}

      {/* End of List */}
      {!hasMore && documents.length > INITIAL_LOAD && (
        <div className="py-3 text-center text-xs text-content-tertiary">
          ✓ Все документы загружены ({documents.length})
        </div>
      )}
    </div>
  );
};

