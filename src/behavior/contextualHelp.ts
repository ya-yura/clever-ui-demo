// === 📁 src/behavior/contextualHelp.ts ===
// Contextual help and hints system

import { getAppropiateTrigger } from './foggModel';

export interface HintConfig {
  id: string;
  trigger: 'spark' | 'facilitator' | 'signal';
  message: string;
  action?: string;
  icon?: string;
  dismissible?: boolean;
  priority: number;
}

/**
 * Get contextual hints based on current state
 */
export function getContextualHints(context: {
  operationType: string;
  currentStep: string;
  userProgress: number;
  errorCount: number;
  timeSpent: number;
}): HintConfig[] {
  const hints: HintConfig[] = [];

  // Motivation hints (sparks)
  if (context.userProgress > 0.7) {
    hints.push({
      id: 'almost_done',
      trigger: 'spark',
      message: 'Отлично! Ещё немного и документ будет завершён',
      icon: '🎯',
      dismissible: true,
      priority: 8,
    });
  }

  // Ability hints (facilitators)
  if (context.currentStep === 'scanning' && context.errorCount > 3) {
    hints.push({
      id: 'scan_tip',
      trigger: 'facilitator',
      message: 'Совет: держите сканер на расстоянии 10-15 см от штрихкода',
      action: 'Понятно',
      icon: '💡',
      dismissible: true,
      priority: 9,
    });
  }

  if (context.currentStep === 'item_list') {
    hints.push({
      id: 'swipe_tip',
      trigger: 'facilitator',
      message: 'Свайп вправо увеличивает количество, влево — уменьшает',
      icon: '👆',
      dismissible: true,
      priority: 5,
    });
  }

  // Signal hints (reminders)
  if (context.timeSpent > 300000 && context.userProgress < 0.3) {
    hints.push({
      id: 'continue_work',
      trigger: 'signal',
      message: 'Продолжайте сканирование товаров',
      icon: '📦',
      dismissible: false,
      priority: 3,
    });
  }

  // Sort by priority
  return hints.sort((a, b) => b.priority - a.priority);
}

/**
 * Get hint for specific error
 */
export function getErrorHint(errorType: string): HintConfig | null {
  const errorHints: Record<string, HintConfig> = {
    PRODUCT_NOT_IN_DOCUMENT: {
      id: 'wrong_product',
      trigger: 'facilitator',
      message: 'Этот товар не входит в документ. Проверьте номер документа',
      action: 'Проверить документ',
      icon: '❌',
      dismissible: true,
      priority: 10,
    },
    QUANTITY_EXCEEDED: {
      id: 'quantity_exceeded',
      trigger: 'facilitator',
      message: 'Вы отсканировали больше товара, чем планировалось',
      action: 'Исправить',
      icon: '⚠️',
      dismissible: true,
      priority: 10,
    },
    CELL_NOT_FOUND: {
      id: 'cell_not_found',
      trigger: 'facilitator',
      message: 'Ячейка не найдена. Проверьте адрес ячейки',
      action: 'Повторить',
      icon: '📍',
      dismissible: true,
      priority: 10,
    },
    WRONG_CELL: {
      id: 'wrong_cell',
      trigger: 'facilitator',
      message: 'Неверная ячейка. Следуйте указаниям маршрута',
      action: 'Показать маршрут',
      icon: '🗺️',
      dismissible: true,
      priority: 10,
    },
  };

  return errorHints[errorType] || null;
}

/**
 * Get operation-specific tips
 */
export function getOperationTips(operationType: string): HintConfig[] {
  const tips: Record<string, HintConfig[]> = {
    receiving: [
      {
        id: 'receiving_tip_1',
        trigger: 'facilitator',
        message: 'Сканируйте штрихкод товара и проверяйте количество',
        icon: '📦',
        dismissible: true,
        priority: 5,
      },
      {
        id: 'receiving_tip_2',
        trigger: 'facilitator',
        message: 'Используйте долгий тап для ручного ввода количества',
        icon: '🔢',
        dismissible: true,
        priority: 4,
      },
    ],
    picking: [
      {
        id: 'picking_tip_1',
        trigger: 'facilitator',
        message: 'Следуйте указаниям маршрута для оптимальной скорости',
        icon: '🗺️',
        dismissible: true,
        priority: 5,
      },
      {
        id: 'picking_tip_2',
        trigger: 'facilitator',
        message: 'Проверяйте адрес ячейки перед взятием товара',
        icon: '📍',
        dismissible: true,
        priority: 4,
      },
    ],
    inventory: [
      {
        id: 'inventory_tip_1',
        trigger: 'facilitator',
        message: 'Сканируйте все товары в ячейке подряд',
        icon: '📊',
        dismissible: true,
        priority: 5,
      },
      {
        id: 'inventory_tip_2',
        trigger: 'facilitator',
        message: 'Свайп влево/вправо для быстрой смены ячейки',
        icon: '👆',
        dismissible: true,
        priority: 4,
      },
    ],
  };

  return tips[operationType] || [];
}

/**
 * Should show hint based on user's previous interactions
 */
export function shouldShowHint(hintId: string): boolean {
  const dismissedHints = getDismissedHints();
  
  // Don't show if already dismissed
  if (dismissedHints.includes(hintId)) {
    return false;
  }

  const shownCount = getHintShownCount(hintId);
  
  // Show max 3 times
  if (shownCount >= 3) {
    return false;
  }

  return true;
}

/**
 * Mark hint as shown
 */
export function markHintShown(hintId: string): void {
  const key = `hint_shown_${hintId}`;
  const count = parseInt(localStorage.getItem(key) || '0');
  localStorage.setItem(key, (count + 1).toString());
}

/**
 * Dismiss hint permanently
 */
export function dismissHint(hintId: string): void {
  const dismissedHints = getDismissedHints();
  if (!dismissedHints.includes(hintId)) {
    dismissedHints.push(hintId);
    localStorage.setItem('dismissedHints', JSON.stringify(dismissedHints));
  }
}

/**
 * Get list of dismissed hints
 */
function getDismissedHints(): string[] {
  try {
    const stored = localStorage.getItem('dismissedHints');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Get how many times hint was shown
 */
function getHintShownCount(hintId: string): number {
  const key = `hint_shown_${hintId}`;
  return parseInt(localStorage.getItem(key) || '0');
}

/**
 * Reset all hints (for testing)
 */
export function resetAllHints(): void {
  localStorage.removeItem('dismissedHints');
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('hint_shown_')) {
      localStorage.removeItem(key);
    }
  });
}


