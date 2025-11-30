// === 📁 src/modules/picking/types.ts ===
// Types for Picking module

export type {
  PickingDocument,
  PickingLine,
} from '@/types/picking';

import type { DocumentStatus } from '@/types/common';

export interface PickingFilters {
  status?: DocumentStatus[];
  customer?: string;
  dateFrom?: number;
  dateTo?: number;
  searchQuery?: string;
}

export type PickingSortField = 'date' | 'customer' | 'status' | 'id';
export type SortDirection = 'asc' | 'desc';

export interface PickingSort {
  field: PickingSortField;
  direction: SortDirection;
}

export interface RouteStep {
  lineId: string;
  cellId: string;
  productId: string;
  productName: string;
  quantity: number;
  order: number;
  completed: boolean;
}

export interface PickingRoute {
  documentId: string;
  steps: RouteStep[];
  currentStep: number;
  totalSteps: number;
}
