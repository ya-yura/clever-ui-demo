// === 📁 src/types/barcode.ts ===
export interface BarcodeItem {
  id: string;
  barcode: string;
  timestamp: number;
  type?: 'product' | 'cell' | 'document' | 'package';
  meta?: Record<string, unknown>;
}

export interface BarcodeSession {
  id: string;
  startTime: number;
  endTime?: number;
  items: BarcodeItem[];
  exported: boolean;
}

export type ExportFormat = 'csv' | 'txt' | 'json';



