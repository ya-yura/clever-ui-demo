// === 📁 src/modules/placement/types.ts ===
// Types for Placement module

export type {
  PlacementDocument,
  PlacementLine,
} from '@/types/placement';

import type { DocumentStatus } from '@/types/common';

export interface PlacementFilters {
  status?: DocumentStatus[];
  cellId?: string;
  dateFrom?: number;
  dateTo?: number;
  searchQuery?: string;
}

export type PlacementSortField = 'date' | 'cell' | 'status' | 'id';
export type SortDirection = 'asc' | 'desc';

export interface PlacementSort {
  field: PlacementSortField;
  direction: SortDirection;
}

export interface CellInfo {
  cellId: string;
  currentQuantity: number;
  maxCapacity: number;
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
  }>;
}
