// === 📁 src/types/label.ts ===
export interface LabelTemplate {
  id: string;
  name: string;
  type: 'product' | 'cell' | 'package' | 'document';
  width: number;
  height: number;
  fields: LabelField[];
  preview?: string;
}

export interface LabelField {
  name: string;
  type: 'text' | 'barcode' | 'qrcode' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  align?: 'left' | 'center' | 'right';
}

export interface LabelData {
  templateId: string;
  values: Record<string, string | number>;
  copies: number;
}

export interface PrintJob {
  id: string;
  labelData: LabelData;
  printer: string;
  status: 'pending' | 'printing' | 'completed' | 'error';
  createdAt: number;
  error?: string;
}



