// === 📁 src/types/inventory.ts ===
import { BaseDocument, BaseItem } from './common';

export interface InventoryDocument extends BaseDocument {
  warehouseId: string;
  responsiblePerson: string;
  zone: string;
  zones?: string[];
  items: InventoryItem[];
}

export interface InventoryItem extends BaseItem {
  documentId: string;
  cellId: string;
  cellBarcode: string;
  cellName?: string;
  expectedQuantity: number;
  actualQuantity: number;
  planned?: number;
  actual?: number;
  discrepancy: number;
  status: 'pending' | 'counted' | 'verified' | 'discrepancy';
  countedAt?: string | null;
  countedBy?: string;
}

export interface InventoryReport {
  totalItems: number;
  countedItems: number;
  discrepancies: number;
  shortages: number;
  excesses: number;
  accuracy: number;
}

