// === 📁 src/modules/receiving/types.ts ===
// Re-export existing types and add module-specific types

export type {
  ReceivingDocument,
  ReceivingLine,
} from '@/types/receiving';

import type { DocumentStatus } from '@/types/common';

export interface ReceivingFilters {
  status?: DocumentStatus[];
  supplier?: string;
  dateFrom?: number;
  dateTo?: number;
  searchQuery?: string;
}

export type ReceivingSortField = 'date' | 'supplier' | 'status' | 'id';
export type SortDirection = 'asc' | 'desc';

export interface ReceivingSort {
  field: ReceivingSortField;
  direction: SortDirection;
}
