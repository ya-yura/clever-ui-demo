// === 📁 src/types/return.ts ===
import { BaseDocument, BaseItem } from './common';

export type ReturnType = 'return' | 'writeoff';

export interface ReturnDocument extends BaseDocument {
  type: ReturnType;
  customerId?: string | null;
  customerName?: string | null;
  sourceDocumentId?: string | null;
  items: ReturnItem[];
}

export interface ReturnItem extends BaseItem {
  documentId: string;
  reason: string;
  reasonText?: string;
  reasonCode?: string;
  processed: number;
  remaining: number;
  status: 'pending' | 'partial' | 'completed';
  photos?: string[];
  signature?: string;
  damage?: boolean;
  cellId?: string;
}

export const RETURN_REASONS = [
  { value: 'defect', label: 'Брак / Дефект' },
  { value: 'damaged', label: 'Повреждение' },
  { value: 'expired', label: 'Срок годности истёк' },
  { value: 'wrong_item', label: 'Ошибка комплектации' },
  { value: 'not_satisfied', label: 'Возврат от клиента' },
  { value: 'quality', label: 'Низкое качество' },
  { value: 'other', label: 'Другое' }
];

