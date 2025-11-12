/**
 * UI Schema Types
 * Типы для динамической схемы интерфейса
 */

/**
 * Типы действий для кнопок (новые, согласованные с маршрутами)
 */
export type ButtonAction = 
  | 'none'
  | 'RECEIVING'        // Приёмка
  | 'ORDER_PICKING'    // Подбор заказа
  | 'SHIPPING'         // Отгрузка
  | 'INVENTORY'        // Инвентаризация
  | 'PLACEMENT'        // Размещение в ячейки
  | 'RETURN'           // Возврат
  | 'TRANSFER'         // Перемещение
  | 'MARKING';         // Маркировка

/**
 * Маппинг действий на маршруты
 */
export const ACTION_ROUTES: Record<ButtonAction, string> = {
  none: '',
  RECEIVING: '/docs/PrihodNaSklad',
  ORDER_PICKING: '/docs/PodborZakaza',
  SHIPPING: '/docs/Otgruzka',
  INVENTORY: '/docs/Inventarizaciya',
  PLACEMENT: '/docs/RazmeshhenieVYachejki',
  RETURN: '/docs/Vozvrat',
  TRANSFER: '/docs/Peremeshenie',
  MARKING: '/docs/Markirovka',
};

export interface UISchema {
  metadata: {
    name: string;
    description?: string;
  };
  grid: {
    rows: number;
    columns: number;
  };
  buttons: ButtonConfig[];
}

export interface ButtonConfig {
  id: string;
  label: string;
  action: ButtonAction | string; // string для обратной совместимости
  route?: string; // Прямой маршрут (приоритет над action)
  params?: Record<string, any>;
  position: {
    startRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
  };
  style?: 'light' | 'dark';
  color?: string;
  documentCount?: number; // Опциональный счетчик документов
}

/**
 * Validate UI Schema
 */
export function validateSchema(schema: any): schema is UISchema {
  if (!schema || typeof schema !== 'object') return false;
  
  if (!schema.metadata || !schema.metadata.name) return false;
  if (!schema.grid || !schema.grid.rows || !schema.grid.columns) return false;
  if (!Array.isArray(schema.buttons)) return false;
  
  return true;
}

/**
 * Create default schema
 */
export function createDefaultSchema(): UISchema {
  return {
    metadata: {
      name: 'Стандартный интерфейс',
      description: 'Встроенный интерфейс по умолчанию',
    },
    grid: {
      rows: 4,
      columns: 4,
    },
    buttons: [],
  };
}

/**
 * Decompress schema from base64+gzip string
 */
export function decompressSchema(compressed: string): UISchema | null {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(compressed);
    if (validateSchema(parsed)) {
      return parsed;
    }
  } catch {
    // Not JSON, might be compressed
  }
  
  // TODO: Implement actual decompression if needed
  console.error('Schema decompression not yet implemented');
  return null;
}

/**
 * Compress schema to base64+gzip string
 */
export function compressSchema(schema: UISchema): string {
  // For now, just stringify
  return JSON.stringify(schema);
}


