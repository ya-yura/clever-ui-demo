// === 📁 src/modules/shipment/types.ts ===
// Types for Shipment module

export type {
  ShipmentDocument,
  ShipmentLine,
} from '@/types/shipment';

import type { DocumentStatus } from '@/types/common';

export interface ShipmentFilters {
  status?: DocumentStatus[];
  carrier?: string;
  dateFrom?: number;
  dateTo?: number;
  searchQuery?: string;
}

export type ShipmentSortField = 'date' | 'carrier' | 'status' | 'id';
export type SortDirection = 'asc' | 'desc';

export interface ShipmentSort {
  field: ShipmentSortField;
  direction: SortDirection;
}
