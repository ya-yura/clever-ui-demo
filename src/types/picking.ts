// === 📁 src/types/picking.ts ===
import { BaseDocument, BaseItem } from './common';

export interface PickingDocument extends BaseDocument {
  customerId: string;
  customerName: string;
  deliveryAddress?: string;
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  route?: RoutePoint[];
  items: PickingItem[];
}

export interface PickingItem extends BaseItem {
  documentId: string;
  cellId: string;
  cellBarcode: string;
  cellName?: string;
  planned?: number;
  picked: number;
  remaining: number;
  status: 'pending' | 'partial' | 'completed';
  routeOrder?: number;
}

export interface RoutePoint {
  cellId: string;
  cellName: string;
  order: number;
  completed: boolean;
}

