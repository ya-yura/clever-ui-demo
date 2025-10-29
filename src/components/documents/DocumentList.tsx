// === 📁 src/components/documents/DocumentList.tsx ===
// Virtualized document list component for handling large datasets

import React, { useState, useEffect, useRef } from 'react';
import { UniversalDocument } from '@/types/document';
import { DocumentCard } from './DocumentCard';

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
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <div className="text-gray-600">Загрузка документов...</div>
        </div>
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

  return (
    <div className="p-4 space-y-3">
      {/* Document Cards */}
      {visibleDocuments.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
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
          ✓ Все документы загружены ({documents.length})
        </div>
      )}
    </div>
  );
};

