// === 📁 src/utils/voicePhrases.ts ===
// Pre-defined voice phrases for warehouse operations

import { VoiceService } from './voice';

/**
 * Warehouse voice phrases (работают без интернета через Web Speech API)
 */
export class WarehouseVoicePhrases {
  /**
   * Scanning feedback
   */
  static scanSuccess(productName?: string): void {
    if (productName) {
      VoiceService.speak(`Отсканировано: ${productName}`);
    } else {
      VoiceService.speak('Отсканировано');
    }
  }

  static scanError(): void {
    VoiceService.speak('Ошибка сканирования', { pitch: 0.8, rate: 0.9 });
  }

  static productNotFound(): void {
    VoiceService.speak('Товар не найден', { pitch: 0.8 });
  }

  static wrongProduct(): void {
    VoiceService.speak('Неверный товар', { pitch: 0.7, rate: 0.9 });
  }

  /**
   * Navigation
   */
  static nextCell(cellAddress: string): void {
    VoiceService.speak(`Следующая ячейка: ${cellAddress}`);
  }

  static moveToCell(cellAddress: string): void {
    VoiceService.speak(`Перейдите к ячейке: ${cellAddress}`);
  }

  static cellCompleted(): void {
    VoiceService.speak('Ячейка завершена');
  }

  /**
   * Quantity
   */
  static quantityConfirm(quantity: number): void {
    VoiceService.speak(`Количество: ${quantity}`);
  }

  static quantityExceeded(): void {
    VoiceService.speak('Превышено количество', { pitch: 0.8 });
  }

  static quantityShort(missing: number): void {
    VoiceService.speak(`Недостача: ${missing}`);
  }

  /**
   * Document operations
   */
  static documentStarted(type: string): void {
    const typeLabels: Record<string, string> = {
      receiving: 'приёмка',
      placement: 'размещение',
      picking: 'подбор',
      shipment: 'отгрузка',
      inventory: 'инвентаризация',
      return: 'возврат',
    };
    VoiceService.speak(`Начата ${typeLabels[type] || type}`);
  }

  static documentCompleted(): void {
    VoiceService.speak('Документ завершён');
  }

  static documentProgress(completed: number, total: number): void {
    VoiceService.speak(`Выполнено ${completed} из ${total}`);
  }

  /**
   * Errors and warnings
   */
  static warning(message: string): void {
    VoiceService.speak(`Внимание: ${message}`, { pitch: 0.9 });
  }

  static error(message: string): void {
    VoiceService.speak(`Ошибка: ${message}`, { pitch: 0.7, rate: 0.85 });
  }

  static info(message: string): void {
    VoiceService.speak(message, { pitch: 1.1 });
  }

  /**
   * Confirmations
   */
  static confirmed(): void {
    VoiceService.speak('Подтверждено');
  }

  static cancelled(): void {
    VoiceService.speak('Отменено');
  }

  static saved(): void {
    VoiceService.speak('Сохранено');
  }

  /**
   * Inventory
   */
  static inventoryMatch(): void {
    VoiceService.speak('Совпадение', { pitch: 1.2 });
  }

  static inventoryDiscrepancy(): void {
    VoiceService.speak('Расхождение', { pitch: 0.8 });
  }

  static inventorySurplus(quantity: number): void {
    VoiceService.speak(`Излишек: ${quantity}`);
  }

  /**
   * Picking
   */
  static pickItem(quantity: number, productName: string): void {
    VoiceService.speak(`Подберите ${quantity} штук: ${productName}`);
  }

  static pickCompleted(): void {
    VoiceService.speak('Позиция завершена');
  }

  static pickNext(): void {
    VoiceService.speak('Следующая позиция');
  }

  /**
   * General instructions
   */
  static scanBarcode(): void {
    VoiceService.speak('Отсканируйте штрихкод');
  }

  static scanCell(): void {
    VoiceService.speak('Отсканируйте ячейку');
  }

  static enterQuantity(): void {
    VoiceService.speak('Введите количество');
  }

  static waitPlease(): void {
    VoiceService.speak('Подождите');
  }

  /**
   * Custom phrase
   */
  static custom(text: string, options?: { pitch?: number; rate?: number }): void {
    VoiceService.speak(text, options);
  }

  /**
   * Test voice
   */
  static test(): void {
    VoiceService.speak('Голосовая помощь активна. Система готова к работе.');
  }
}

// Convenience exports
export const voiceScanned = (name?: string) => WarehouseVoicePhrases.scanSuccess(name);
export const voiceError = (msg: string) => WarehouseVoicePhrases.error(msg);
export const voiceCell = (cell: string) => WarehouseVoicePhrases.nextCell(cell);
export const voiceQuantity = (qty: number) => WarehouseVoicePhrases.quantityConfirm(qty);
export const voiceCompleted = () => WarehouseVoicePhrases.documentCompleted();

/**
 * Quick voice shortcuts for common operations
 */
export const quickVoice = {
  scan: () => WarehouseVoicePhrases.scanSuccess(),
  error: () => WarehouseVoicePhrases.scanError(),
  next: () => WarehouseVoicePhrases.pickNext(),
  done: () => WarehouseVoicePhrases.pickCompleted(),
  wait: () => WarehouseVoicePhrases.waitPlease(),
  ok: () => WarehouseVoicePhrases.confirmed(),
};






















