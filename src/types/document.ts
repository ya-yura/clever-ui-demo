// === 📁 src/types/document.ts ===
// Universal document types for document list module

import { DocumentStatus } from './common';

/**
 * Document type enum
 */
export type DocumentType = 
  | 'receiving'      // Приёмка
  | 'placement'      // Размещение
  | 'picking'        // Подбор
  | 'shipment'       // Отгрузка
  | 'return'         // Возврат
  | 'inventory';     // Инвентаризация

/**
 * Document priority levels
 */
export type DocumentPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Universal document interface combining all document types
 */
export interface UniversalDocument {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  priority?: DocumentPriority;
  
  // Document metadata
  number?: string;              // Document number
  externalId?: string;          // External system ID
  
  // Dates
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;
  dueDate?: number;             // Deadline for completion
  
  // References
  partnerId?: string;           // Supplier/Customer ID
  partnerName?: string;         // Supplier/Customer name
  warehouseId?: string;
  warehouseName?: string;
  userId?: string;
  userName?: string;
  
  // Counters
  totalLines?: number;          // Total number of lines
  completedLines?: number;      // Completed lines
  totalQuantity?: number;       // Total planned quantity
  completedQuantity?: number;   // Completed quantity
  
  // Additional info
  notes?: string;
  tags?: string[];
  
  // Type-specific fields
  sourceDocument?: string;      // For placement (from receiving)
  route?: string;               // For picking
  vehicle?: string;             // For shipment
  returnReason?: string;        // For returns
  inventoryType?: string;       // For inventory (full/partial/cycle)
}

/**
 * Document filter criteria
 */
export interface DocumentFilter {
  types?: DocumentType[];
  statuses?: DocumentStatus[];
  priorities?: DocumentPriority[];
  dateFrom?: number;
  dateTo?: number;
  searchQuery?: string;
  partnerId?: string;
  userId?: string;
  tags?: string[];
}

/**
 * Document sort options
 */
export type DocumentSortField = 
  | 'createdAt'
  | 'updatedAt'
  | 'dueDate'
  | 'number'
  | 'priority'
  | 'status'
  | 'type'
  | 'partnerName';

export type SortDirection = 'asc' | 'desc';

export interface DocumentSort {
  field: DocumentSortField;
  direction: SortDirection;
}

/**
 * Document list state
 */
export interface DocumentListState {
  documents: UniversalDocument[];
  filteredDocuments: UniversalDocument[];
  filter: DocumentFilter;
  sort: DocumentSort;
  loading: boolean;
  error?: string;
}

/**
 * Document type labels for UI
 */
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  receiving: 'Приёмка',
  placement: 'Размещение',
  picking: 'Подбор',
  shipment: 'Отгрузка',
  return: 'Возврат',
  inventory: 'Инвентаризация',
};

/**
 * Document type colors for UI
 */
export const DOCUMENT_TYPE_COLORS: Record<DocumentType, string> = {
  receiving: 'bg-blue-100 text-blue-800',
  placement: 'bg-purple-100 text-purple-800',
  picking: 'bg-orange-100 text-orange-800',
  shipment: 'bg-green-100 text-green-800',
  return: 'bg-red-100 text-red-800',
  inventory: 'bg-yellow-100 text-yellow-800',
};

/**
 * Document type icons (emoji)
 */
export const DOCUMENT_TYPE_ICONS: Record<DocumentType, string> = {
  receiving: '📦',
  placement: '📍',
  picking: '🛒',
  shipment: '🚚',
  return: '↩️',
  inventory: '📊',
};

/**
 * Status labels for UI
 */
export const STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Черновик',
  in_progress: 'В работе',
  completed: 'Завершён',
  cancelled: 'Отменён',
  synced: 'Синхронизирован',
  error: 'Ошибка',
};

/**
 * Status colors for UI
 */
export const STATUS_COLORS: Record<DocumentStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  synced: 'bg-teal-100 text-teal-800',
  error: 'bg-red-100 text-red-800',
};

/**
 * Priority labels for UI
 */
export const PRIORITY_LABELS: Record<DocumentPriority, string> = {
  low: 'Низкий',
  normal: 'Обычный',
  high: 'Высокий',
  urgent: 'Срочный',
};

/**
 * Priority colors for UI
 */
export const PRIORITY_COLORS: Record<DocumentPriority, string> = {
  low: 'text-gray-500',
  normal: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
};

