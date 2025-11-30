// === 📁 src/modules/return/types.ts ===
// Types for Return/Write-off module

export type {
  ReturnDocument,
  ReturnLine,
  ReturnReason,
} from '@/types/return';

import type { DocumentStatus } from '@/types/common';
import type { ReturnReason } from '@/types/return';

export interface ReturnFilters {
  status?: DocumentStatus[];
  reason?: ReturnReason[];
  dateFrom?: number;
  dateTo?: number;
  searchQuery?: string;
}

export type ReturnSortField = 'date' | 'reason' | 'status' | 'id';
export type SortDirection = 'asc' | 'desc';

export interface ReturnSort {
  field: ReturnSortField;
  direction: SortDirection;
}
