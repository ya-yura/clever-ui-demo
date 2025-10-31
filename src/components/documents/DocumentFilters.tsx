// === 📁 src/components/documents/DocumentFilters.tsx ===
// Document filters and search component

import React, { useState } from 'react';
import {
  DocumentFilter,
  DocumentType,
  DocumentSort,
  DocumentSortField,
  DOCUMENT_TYPE_LABELS,
  STATUS_LABELS,
} from '@/types/document';
import { DocumentStatus } from '@/types/common';

interface DocumentFiltersProps {
  filter: DocumentFilter;
  sort: DocumentSort;
  totalCount: number;
  filteredCount: number;
  onFilterChange: (filter: DocumentFilter) => void;
  onSortChange: (sort: DocumentSort) => void;
  onReset: () => void;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  filter,
  sort,
  totalCount,
  filteredCount,
  onFilterChange,
  onSortChange,
  onReset,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filter,
      searchQuery: e.target.value,
    });
  };

  const handleTypeToggle = (type: DocumentType) => {
    const types = filter.types || [];
    const newTypes = types.includes(type)
      ? types.filter(t => t !== type)
      : [...types, type];
    
    onFilterChange({
      ...filter,
      types: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  const handleStatusToggle = (status: DocumentStatus) => {
    const statuses = filter.statuses || [];
    const newStatuses = statuses.includes(status)
      ? statuses.filter(s => s !== status)
      : [...statuses, status];
    
    onFilterChange({
      ...filter,
      statuses: newStatuses.length > 0 ? newStatuses : undefined,
    });
  };

  const handleSortChange = (field: DocumentSortField) => {
    if (sort.field === field) {
      // Toggle direction
      onSortChange({
        field,
        direction: sort.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      onSortChange({
        field,
        direction: 'desc',
      });
    }
  };

  const hasActiveFilters = Boolean(
    filter.types?.length ||
    filter.statuses?.length ||
    filter.searchQuery?.trim()
  );

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      {/* Search Bar */}
      <div className="p-4 pb-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Найти"
            value={filter.searchQuery || ''}
            onChange={handleSearchChange}
            className="w-full px-4 py-3 pl-10 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {!filter.searchQuery && (
            <span className="absolute left-3 top-3.5 text-xl pointer-events-none">🔍</span>
          )}
          
          {filter.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filter, searchQuery: '' })}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Toggle & Stats */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            hasActiveFilters
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          <span>🎚️</span>
          <span>Фильтры</span>
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              {(filter.types?.length || 0) + (filter.statuses?.length || 0)}
            </span>
          )}
        </button>

        <div className="text-sm text-gray-600">
          Показано: <strong>{filteredCount}</strong> из <strong>{totalCount}</strong>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="px-4 pb-4 border-t border-gray-200 pt-4 space-y-4">
          {/* Document Types */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Тип документа</div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map(type => (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter.types?.includes(type)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {DOCUMENT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Statuses */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Статус</div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_LABELS) as DocumentStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusToggle(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter.statuses?.includes(status)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Сортировка</div>
            <div className="flex flex-wrap gap-2">
              {[
                { field: 'createdAt' as DocumentSortField, label: 'Дата создания' },
                { field: 'updatedAt' as DocumentSortField, label: 'Обновлено' },
                { field: 'number' as DocumentSortField, label: 'Номер' },
                { field: 'status' as DocumentSortField, label: 'Статус' },
              ].map(({ field, label }) => (
                <button
                  key={field}
                  onClick={() => handleSortChange(field)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    sort.field === field
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                  {sort.field === field && (
                    <span>{sort.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <div className="pt-2">
              <button
                onClick={onReset}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                ↻ Сбросить все фильтры
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

