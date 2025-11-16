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
    <div className="bg-[#343436] border-b border-[#474747] sticky top-0 z-10">
      {/* Search Bar */}
      <div className="p-4 pb-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Найти"
            value={filter.searchQuery || ''}
            onChange={handleSearchChange}
            className="w-full px-4 py-3 pl-10 text-base border border-[#474747] rounded-lg bg-[#2a2a2c] text-[#e3e3dd] focus:ring-2 focus:ring-[#86e0cb] focus:border-[#86e0cb] placeholder-[#a7a7a7]"
          />
          {!filter.searchQuery && (
            <span className="absolute left-3 top-3.5 text-xl pointer-events-none">🔍</span>
          )}
          
          {filter.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filter, searchQuery: '' })}
              className="absolute right-3 top-3 text-[#a7a7a7] hover:text-[#e3e3dd]"
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
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            hasActiveFilters
              ? 'bg-[#FEA079] text-[#2d2d2d]'
              : 'bg-[#474747] text-[#e3e3dd] hover:bg-[#5a5a5a]'
          }`}
        >
          <span>🎚️</span>
          <span>Фильтры</span>
          {hasActiveFilters && (
            <span className="bg-[#2d2d2d] text-[#FEA079] text-xs px-2 py-0.5 rounded-full">
              {(filter.types?.length || 0) + (filter.statuses?.length || 0)}
            </span>
          )}
        </button>

        <div className="text-sm text-[#a7a7a7]">
          Показано: <strong className="text-[#e3e3dd]">{filteredCount}</strong> из <strong className="text-[#e3e3dd]">{totalCount}</strong>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="px-4 pb-4 border-t border-[#474747] pt-4 space-y-4">
          {/* Document Types */}
          <div>
            <div className="text-sm font-medium text-[#a7a7a7] mb-2">Тип документа</div>
            <div className="flex flex-wrap gap-[8px]">
              {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map(type => (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`chip ${filter.types?.includes(type) ? 'chip-active' : ''}`}
                >
                  {DOCUMENT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Statuses */}
          <div>
            <div className="text-sm font-medium text-[#a7a7a7] mb-2">Статус</div>
            <div className="flex flex-wrap gap-[8px]">
              {(Object.keys(STATUS_LABELS) as DocumentStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusToggle(status)}
                  className={`chip ${filter.statuses?.includes(status) ? 'chip-active' : ''}`}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <div className="text-sm font-medium text-[#a7a7a7] mb-2">Сортировка</div>
            <div className="flex flex-wrap gap-[8px]">
              {[
                { field: 'createdAt' as DocumentSortField, label: 'Дата создания' },
                { field: 'updatedAt' as DocumentSortField, label: 'Обновлено' },
                { field: 'number' as DocumentSortField, label: 'Номер' },
                { field: 'status' as DocumentSortField, label: 'Статус' },
              ].map(({ field, label }) => (
                <button
                  key={field}
                  onClick={() => handleSortChange(field)}
                  className={`chip ${sort.field === field ? 'chip-active' : ''}`}
                >
                  {label}
                  {sort.field === field && (
                    <span className="ml-1">{sort.direction === 'asc' ? '↑' : '↓'}</span>
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
                className="w-full px-4 py-2 bg-[#474747] text-[#e3e3dd] rounded-lg font-medium hover:bg-[#5a5a5a] active:bg-[#6a6a6a] transition-colors"
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

