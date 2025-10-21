// === 📁 src/types/shipment.ts ===
import { BaseDocument, BaseItem } from './common';

export interface ShipmentDocument extends BaseDocument {
  customerId: string;
  customerName: string;
  shippingAddress: string;
  deliveryAddress?: string;
  carrier?: string;
  trackingNumber?: string;
  items: ShipmentItem[];
  signature?: string;
  photos?: string[];
}

export interface ShipmentItem extends BaseItem {
  documentId: string;
  planned?: number;
  shipped: number;
  remaining: number;
  packageId?: string;
  serialNumbers?: string[];
  status: 'pending' | 'partial' | 'completed';
}

export interface Discrepancy {
  itemId: string;
  type: 'shortage' | 'excess' | 'damage';
  quantity: number;
  reason?: string;
  photo?: string;
}

