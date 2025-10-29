// === 📁 src/pages/Documents.tsx ===
// Main documents page with filters and list

import React, { useState, useEffect, useMemo } from 'react';
import { DocumentFilters } from '@/components/documents/DocumentFilters';
import { DocumentList } from '@/components/documents/DocumentList';
import { documentService } from '@/services/documentService';
import {
  UniversalDocument,
  DocumentFilter,
  DocumentSort,
} from '@/types/document';

const DEFAULT_FILTER: DocumentFilter = {
  searchQuery: '',
};

const DEFAULT_SORT: DocumentSort = {
  field: 'updatedAt',
  direction: 'desc',
};

const Documents: React.FC = () => {
  const [allDocuments, setAllDocuments] = useState<UniversalDocument[]>([]);
  const [filter, setFilter] = useState<DocumentFilter>(DEFAULT_FILTER);
  const [sort, setSort] = useState<DocumentSort>(DEFAULT_SORT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await documentService.getAllDocuments();
      setAllDocuments(docs);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Ошибка загрузки документов');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  const filteredAndSortedDocuments = useMemo(() => {
    let result = documentService.filterDocuments(allDocuments, filter);
    result = documentService.sortDocuments(result, sort);
    return result;
  }, [allDocuments, filter, sort]);

  const handleFilterChange = (newFilter: DocumentFilter) => {
    setFilter(newFilter);
  };

  const handleSortChange = (newSort: DocumentSort) => {
    setSort(newSort);
  };

  const handleReset = () => {
    setFilter(DEFAULT_FILTER);
    setSort(DEFAULT_SORT);
  };

  const handleRefresh = () => {
    loadDocuments();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Документы</h1>
          <p className="text-sm text-gray-500 mt-1">
            Все документы склада в одном месте
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          title="Обновить список"
        >
          <span className={loading ? 'animate-spin inline-block' : ''}>
            🔄
          </span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={handleRefresh}
                className="text-sm text-red-600 underline mt-1"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <DocumentFilters
        filter={filter}
        sort={sort}
        totalCount={allDocuments.length}
        filteredCount={filteredAndSortedDocuments.length}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onReset={handleReset}
      />

      {/* Document List */}
      <div className="flex-1 overflow-auto">
        <DocumentList
          documents={filteredAndSortedDocuments}
          loading={loading}
        />
      </div>

      {/* Quick Stats Footer (Optional) */}
      {!loading && allDocuments.length > 0 && (
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-center justify-around text-center text-xs">
            <div>
              <div className="text-gray-500">Всего</div>
              <div className="text-lg font-bold text-gray-900">
                {allDocuments.length}
              </div>
            </div>
            
            <div className="h-8 w-px bg-gray-300"></div>
            
            <div>
              <div className="text-gray-500">В работе</div>
              <div className="text-lg font-bold text-blue-600">
                {allDocuments.filter(d => d.status === 'in_progress').length}
              </div>
            </div>
            
            <div className="h-8 w-px bg-gray-300"></div>
            
            <div>
              <div className="text-gray-500">Завершено</div>
              <div className="text-lg font-bold text-green-600">
                {allDocuments.filter(d => d.status === 'completed').length}
              </div>
            </div>
            
            <div className="h-8 w-px bg-gray-300"></div>
            
            <div>
              <div className="text-gray-500">Новые</div>
              <div className="text-lg font-bold text-gray-600">
                {allDocuments.filter(d => d.status === 'draft').length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;

