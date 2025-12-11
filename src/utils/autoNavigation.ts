/**
 * 🧭 AUTO NAVIGATION
 * Система автоматической навигации по паттернам Джеки Рида
 * 
 * Принципы:
 * - Single Path Flow
 * - Predictable Next Steps
 * - Contextual Navigation
 */

import { NavigateFunction } from 'react-router-dom';
import { metricsCollector } from '@/metrics/collector';

/**
 * Типы документов и их логические следующие шаги
 */
const documentFlow: Record<string, {
  next?: string;
  nextLabel?: string;
  prompt?: string;
}> = {
  receiving: {
    next: 'placement',
    nextLabel: 'Размещение',
    prompt: 'Приёмка завершена. Перейти к размещению?',
  },
  placement: {
    // После размещения возвращаемся к списку
  },
  picking: {
    next: 'shipping',
    nextLabel: 'Отгрузка',
    prompt: 'Подбор завершён. Перейти к отгрузке?',
  },
  shipping: {
    // После отгрузки возвращаемся к списку
  },
  inventory: {
    // После инвентаризации возвращаемся к списку
  },
  return: {
    // После возврата возвращаемся к списку
  },
};

/**
 * Автоматическая навигация после завершения документа
 */
export async function autoNavigateAfterComplete(
  docType: string,
  docId: string,
  navigate: NavigateFunction,
  options?: {
    userId?: string;
    skipPrompt?: boolean;
    onBeforeNavigate?: () => void | Promise<void>;
  }
): Promise<void> {
  const flow = documentFlow[docType];
  
  // Track navigation attempt
  if (options?.userId) {
    metricsCollector.trackUXEvent({
      userId: options.userId,
      eventType: 'auto_navigation',
      operationType: docType,
      documentId: docId,
      metadata: {
        nextStep: flow?.next || 'list',
      },
    });
  }

  // Callback перед навигацией
  if (options?.onBeforeNavigate) {
    await options.onBeforeNavigate();
  }

  // Если есть следующий шаг
  if (flow?.next) {
    const shouldNavigate = options?.skipPrompt || 
      (flow.prompt && confirm(flow.prompt));

    if (shouldNavigate) {
      // Создать документ следующего типа на основе текущего
      navigate(`/${flow.next}/create?source=${docId}&sourceType=${docType}`);
      return;
    }
  }

  // По умолчанию возвращаемся к списку
  navigate(`/${docType}`);
}

/**
 * Интеллектуальная навигация на основе контекста
 */
export function smartNavigate(
  from: string,
  to: string,
  navigate: NavigateFunction,
  options?: {
    userId?: string;
    method?: 'auto' | 'manual' | 'back';
    state?: any;
  }
): void {
  // Track navigation
  if (options?.userId) {
    metricsCollector.trackNavigation({
      userId: options.userId,
      from,
      to,
      navigationMethod: options?.method || 'manual',
      duration: 0, // Calculated on arrival
    });
  }

  // Navigate
  if (options?.state) {
    navigate(to, { state: options.state });
  } else {
    navigate(to);
  }
}

/**
 * Получить рекомендуемый следующий шаг
 */
export function getNextStep(docType: string): {
  next?: string;
  nextLabel?: string;
  prompt?: string;
} {
  return documentFlow[docType] || {};
}

/**
 * Проверить, нужно ли показывать промпт перехода
 */
export function shouldPromptNext(docType: string): boolean {
  const flow = documentFlow[docType];
  return !!(flow?.next && flow?.prompt);
}

/**
 * Создать breadcrumb-путь для текущей навигации
 */
export function buildBreadcrumbs(
  docType: string,
  docNumber?: string,
  step?: string
): Array<{ label: string; path?: string }> {
  const breadcrumbs: Array<{ label: string; path?: string }> = [];

  // Тип документа
  const typeLabels: Record<string, string> = {
    receiving: 'Приёмка',
    placement: 'Размещение',
    picking: 'Подбор',
    shipping: 'Отгрузка',
    inventory: 'Инвентаризация',
    return: 'Возврат',
  };

  breadcrumbs.push({
    label: typeLabels[docType] || docType,
    path: `/${docType}`,
  });

  // Номер документа
  if (docNumber) {
    breadcrumbs.push({
      label: `№${docNumber}`,
      path: docNumber ? `/${docType}/${docNumber}` : undefined,
    });
  }

  // Текущий шаг
  if (step) {
    breadcrumbs.push({
      label: step,
    });
  }

  return breadcrumbs;
}

/**
 * Определить, можно ли вернуться назад
 */
export function canGoBack(currentPath: string): boolean {
  // Нельзя вернуться с главной страницы
  if (currentPath === '/' || currentPath === '/home') {
    return false;
  }

  return true;
}

/**
 * Безопасная навигация назад
 */
export function safeGoBack(
  navigate: NavigateFunction,
  fallbackPath: string = '/'
): void {
  if (window.history.length > 1) {
    navigate(-1);
  } else {
    navigate(fallbackPath);
  }
}

/**
 * Хук для отслеживания пути навигации
 */
export class NavigationHistory {
  private static history: string[] = [];
  private static maxSize = 10;

  static push(path: string): void {
    this.history.push(path);
    if (this.history.length > this.maxSize) {
      this.history.shift();
    }
  }

  static pop(): string | undefined {
    return this.history.pop();
  }

  static peek(): string | undefined {
    return this.history[this.history.length - 1];
  }

  static clear(): void {
    this.history = [];
  }

  static getHistory(): string[] {
    return [...this.history];
  }
}

