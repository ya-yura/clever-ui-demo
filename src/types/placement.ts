// === 📁 src/types/placement.ts ===
import { BaseDocument, BaseItem } from './common';

export interface PlacementDocument extends BaseDocument {
  warehouseId: string;
  sourceDocumentId?: string;
  items: PlacementItem[];
}

export interface PlacementItem extends BaseItem {
  documentId: string;
  sourceCellId?: string;
  targetCellId?: string;
  targetCellName?: string;
  cellId: string;
  cellBarcode: string;
  planned?: number;
  placed: number;
  remaining: number;
  status: 'pending' | 'partial' | 'completed';
}

export interface Cell {
  id: string;
  name: string;
  zoneId: string;
  zoneName: string;
  type: string;
  capacity: number;
  occupied: number;
}

