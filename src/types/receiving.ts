// === 📁 src/types/receiving.ts ===
import { BaseDocument, BaseItem, Status, SyncStatus } from './common';

export interface ReceivingDocument extends BaseDocument {
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  items: ReceivingItem[];
}

export interface ReceivingItem extends BaseItem {
  documentId: string;
  planned: number;
  received: number;
  discrepancy: number;
  cellId?: string;
  cellName?: string;
  status: 'pending' | 'partial' | 'completed' | 'excess';
}

export interface ReceivingScan {
  barcode: string;
  timestamp: number;
  productId?: string;
  quantity: number;
}



