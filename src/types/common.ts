// === 📁 src/types/common.ts ===
// Common types used across modules

export type DocumentStatus = 
  | 'new'
  | 'pending'
  | 'draft'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'synced'
  | 'error';

export type LineStatus = 
  | 'pending'
  | 'completed'
  | 'partial'
  | 'error'
  | 'mismatch';

/**
 * Line status labels for UI (Russian)
 */
export const LINE_STATUS_LABELS: Record<LineStatus, string> = {
  pending: 'Ожидает',
  completed: 'Завершено',
  partial: 'Частично',
  error: 'Ошибка',
  mismatch: 'Несоответствие',
};

export interface BaseDocument {
  id: string;
  status: DocumentStatus;
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;
  userId?: string;
  notes?: string;
}

export interface BaseLine {
  id: string;
  documentId: string;
  productId: string;
  productName: string;
  productSku: string;
  barcode?: string;
  quantity: number;
  quantityPlan: number;
  quantityFact: number;
  status: LineStatus;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  unit?: string;
  weight?: number;
  volume?: number;
}

export interface Cell {
  id: string;
  name: string;
  zone?: string;
  type?: string;
  capacity?: number;
}

export interface User {
  id: string;
  name: string;
  role: string;
}
