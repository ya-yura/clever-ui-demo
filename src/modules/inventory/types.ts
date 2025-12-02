// === 📁 src/modules/inventory/types.ts ===
// Types for Inventory module

import type { DocumentStatus } from '@/types/common';

// Re-export from main types
export type { InventoryDocument, InventoryLine } from '@/types/inventory';

export interface InventoryFilters {
  status?: DocumentStatus[];
  type?: ('full' | 'partial' | 'cycle')[];
  zone?: string;
  dateFrom?: number;
  dateTo?: number;
  searchQuery?: string;
}

export type InventorySortField = 'date' | 'type' | 'status' | 'id';
export type SortDirection = 'asc' | 'desc';

export interface InventorySort {
  field: InventorySortField;
  direction: SortDirection;
}

export interface DiscrepancyReport {
  documentId: string;
  totalLines: number;
  exactMatches: number;
  shortages: Array<{
    productName: string;
    cellId: string;
    expected: number;
    actual: number;
    difference: number;
  }>;
  surpluses: Array<{
    productName: string;
    cellId: string;
    expected: number;
    actual: number;
    difference: number;
  }>;
  unknownItems: Array<{
    barcode: string;
    cellId: string;
    quantity: number;
  }>;
}
