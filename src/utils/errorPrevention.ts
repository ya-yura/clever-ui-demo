// === 📁 src/utils/errorPrevention.ts ===
// Error prevention and validation utilities

import { vibrate, vibratePattern } from './vibration';
import { playSound } from './sound';
import { speak } from './voice';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
  suggestion?: string;
}

/**
 * Validation error types with user-friendly messages
 */
export const ERROR_MESSAGES = {
  PRODUCT_NOT_IN_DOCUMENT: {
    title: '❌ Товар не входит в документ',
    message: 'Этот товар отсутствует в текущем документе',
    suggestion: 'Проверьте штрихкод или выберите правильный документ',
    vibration: [100, 50, 100, 50, 100],
    sound: 'error',
    voice: 'Товар не входит в документ',
  },
  QUANTITY_EXCEEDED: {
    title: '⚠️ Превышено количество',
    message: 'Отсканировано больше, чем планировалось',
    suggestion: 'Проверьте количество. При необходимости измените план.',
    vibration: [200, 100, 200],
    sound: 'warning',
    voice: 'Превышено количество',
  },
  PRODUCT_ALREADY_COMPLETED: {
    title: '✓ Товар уже выполнен',
    message: 'По этому товару уже выполнено плановое количество',
    suggestion: 'Если нужно добавить больше, измените количество вручную',
    vibration: [50, 30, 50],
    sound: 'warning',
    voice: 'Товар уже выполнен',
  },
  CELL_NOT_FOUND: {
    title: '❌ Ячейка не найдена',
    message: 'Указанная ячейка не существует в системе',
    suggestion: 'Проверьте адрес ячейки или обновите справочник',
    vibration: [100, 50, 100],
    sound: 'error',
    voice: 'Ячейка не найдена',
  },
  WRONG_CELL: {
    title: '❌ Неверная ячейка',
    message: 'Товар должен быть размещен в другой ячейке',
    suggestion: 'Следуйте указаниям маршрута',
    vibration: [100, 50, 100],
    sound: 'error',
    voice: 'Неверная ячейка',
  },
  INCOMPLETE_DOCUMENT: {
    title: '⚠️ Документ не завершен',
    message: 'Не все обязательные позиции выполнены',
    suggestion: 'Завершите все обязательные позиции перед закрытием',
    vibration: [200, 100, 200],
    sound: 'warning',
    voice: 'Документ не завершен',
  },
  NO_CONNECTION: {
    title: '📡 Нет связи',
    message: 'Отсутствует подключение к серверу',
    suggestion: 'Продолжайте работу. Данные синхронизируются автоматически при восстановлении связи',
    vibration: [100],
    sound: 'warning',
    voice: 'Нет связи с сервером',
  },
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;

/**
 * Show error with multi-modal feedback (visual + haptic + sound + voice)
 */
export function showError(
  errorCode: ErrorCode,
  options: {
    enableVibration?: boolean;
    enableSound?: boolean;
    enableVoice?: boolean;
  } = {}
) {
  const {
    enableVibration = true,
    enableSound = true,
    enableVoice = true,
  } = options;

  const error = ERROR_MESSAGES[errorCode];

  // Vibration feedback
  if (enableVibration && error.vibration) {
    vibratePattern(error.vibration);
  }

  // Sound feedback
  if (enableSound && error.sound) {
    playSound(error.sound as any);
  }

  // Voice feedback
  if (enableVoice && error.voice) {
    speak(error.voice);
  }

  return error;
}

/**
 * Validate product scan against document
 */
export function validateProductScan(
  productId: string,
  documentProducts: Array<{
    id: string;
    plannedQuantity: number;
    actualQuantity: number;
  }>
): ValidationResult {
  // Check if product exists in document
  const product = documentProducts.find(p => p.id === productId);
  
  if (!product) {
    return {
      valid: false,
      error: ERROR_MESSAGES.PRODUCT_NOT_IN_DOCUMENT.message,
      suggestion: ERROR_MESSAGES.PRODUCT_NOT_IN_DOCUMENT.suggestion,
    };
  }

  // Check if already completed
  if (product.actualQuantity >= product.plannedQuantity) {
    return {
      valid: false,
      warning: ERROR_MESSAGES.PRODUCT_ALREADY_COMPLETED.message,
      suggestion: ERROR_MESSAGES.PRODUCT_ALREADY_COMPLETED.suggestion,
    };
  }

  return { valid: true };
}

/**
 * Validate cell scan for placement/picking
 */
export function validateCellScan(
  scannedCellId: string,
  expectedCellId?: string,
  existingCells?: string[]
): ValidationResult {
  // Check if cell exists
  if (existingCells && !existingCells.includes(scannedCellId)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.CELL_NOT_FOUND.message,
      suggestion: ERROR_MESSAGES.CELL_NOT_FOUND.suggestion,
    };
  }

  // Check if correct cell for route
  if (expectedCellId && scannedCellId !== expectedCellId) {
    return {
      valid: false,
      error: ERROR_MESSAGES.WRONG_CELL.message,
      suggestion: `Ожидается ячейка: ${expectedCellId}`,
    };
  }

  return { valid: true };
}

/**
 * Check if document can be completed
 */
export function validateDocumentCompletion(
  products: Array<{
    id: string;
    plannedQuantity: number;
    actualQuantity: number;
    required?: boolean;
  }>
): ValidationResult {
  // Check if all required items are completed
  const incompleteRequired = products.filter(
    p => p.required !== false && p.actualQuantity < p.plannedQuantity
  );

  if (incompleteRequired.length > 0) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INCOMPLETE_DOCUMENT.message,
      suggestion: `Осталось выполнить: ${incompleteRequired.length} позиций`,
    };
  }

  return { valid: true };
}

/**
 * Auto-save handler with error handling
 */
export class AutoSaveManager {
  private intervalId: NodeJS.Timeout | null = null;
  private lastSaveTime: number = Date.now();

  constructor(
    private saveFunction: () => Promise<void>,
    private intervalMs: number = 30000 // 30 seconds
  ) {}

  start() {
    this.stop(); // Clear any existing interval
    
    this.intervalId = setInterval(async () => {
      try {
        await this.saveFunction();
        this.lastSaveTime = Date.now();
        console.log('✓ Auto-save successful');
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
        // Don't throw - let user continue working
      }
    }, this.intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async saveNow() {
    try {
      await this.saveFunction();
      this.lastSaveTime = Date.now();
      return true;
    } catch (error) {
      console.error('❌ Manual save failed:', error);
      return false;
    }
  }

  getLastSaveTime() {
    return this.lastSaveTime;
  }

  getTimeSinceLastSave() {
    return Date.now() - this.lastSaveTime;
  }
}

/**
 * Highlight wrong product with visual feedback
 */
export function highlightWrongProduct(elementId: string, duration: number = 2000) {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Add error highlight class
  element.classList.add('bg-error/20', 'border-error', 'animate-pulse');

  // Remove after duration
  setTimeout(() => {
    element.classList.remove('bg-error/20', 'border-error', 'animate-pulse');
  }, duration);
}

/**
 * Show suggestion overlay
 */
export function showSuggestion(message: string, autoHideMs: number = 3000) {
  // Create toast/overlay element
  const overlay = document.createElement('div');
  overlay.className = 'fixed bottom-20 left-4 right-4 bg-brand-primary text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
  overlay.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-xl">💡</span>
      <span class="flex-1">${message}</span>
    </div>
  `;

  document.body.appendChild(overlay);

  // Auto-hide
  setTimeout(() => {
    overlay.classList.add('animate-slide-down');
    setTimeout(() => overlay.remove(), 300);
  }, autoHideMs);
}


