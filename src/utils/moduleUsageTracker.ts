/**
 * Система отслеживания использования модулей с временными метками
 * Автоматически сортирует модули по времени последнего использования
 */

export interface ModuleUsageRecord {
  uni: string;
  lastUsed: number; // timestamp
  usageCount: number;
}

const STORAGE_KEY = 'module_usage_history';
const MAX_HISTORY_SIZE = 50;

/**
 * Получить историю использования модулей
 */
export function getModuleUsageHistory(): ModuleUsageRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const history: ModuleUsageRecord[] = JSON.parse(stored);
    
    // Сортируем по времени последнего использования (новые первыми)
    return history.sort((a, b) => b.lastUsed - a.lastUsed);
  } catch (error) {
    console.error('Failed to load module usage history:', error);
    return [];
  }
}

/**
 * Записать использование модуля
 */
export function trackModuleUsage(uni: string): void {
  try {
    const history = getModuleUsageHistory();
    const now = Date.now();
    
    // Найти существующую запись или создать новую
    const existingIndex = history.findIndex(record => record.uni === uni);
    
    if (existingIndex >= 0) {
      // Обновить существующую запись
      history[existingIndex] = {
        uni,
        lastUsed: now,
        usageCount: history[existingIndex].usageCount + 1,
      };
    } else {
      // Добавить новую запись
      history.unshift({
        uni,
        lastUsed: now,
        usageCount: 1,
      });
    }
    
    // Ограничить размер истории
    const trimmedHistory = history
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, MAX_HISTORY_SIZE);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
    
    // Отправить событие для обновления UI
    window.dispatchEvent(new CustomEvent('module-usage-updated', { 
      detail: { uni, timestamp: now } 
    }));
    
    console.log(`📊 Tracked module usage: ${uni} at ${new Date(now).toLocaleTimeString()}`);
  } catch (error) {
    console.error('Failed to track module usage:', error);
  }
}

/**
 * Получить последние N использованных модулей
 */
export function getRecentModules(count: number = 3): string[] {
  const history = getModuleUsageHistory();
  return history.slice(0, count).map(record => record.uni);
}

/**
 * Получить все модули, отсортированные по использованию
 */
export function getAllModulesSortedByUsage(): string[] {
  const history = getModuleUsageHistory();
  return history.map(record => record.uni);
}

/**
 * Получить статистику по модулю
 */
export function getModuleStats(uni: string): ModuleUsageRecord | null {
  const history = getModuleUsageHistory();
  return history.find(record => record.uni === uni) || null;
}

/**
 * Очистить историю использования
 */
export function clearUsageHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('module-usage-updated'));
    console.log('🗑️ Module usage history cleared');
  } catch (error) {
    console.error('Failed to clear usage history:', error);
  }
}

/**
 * Хук для подписки на обновления использования модулей
 */
export function subscribeToUsageUpdates(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener('module-usage-updated', handler);
  
  return () => {
    window.removeEventListener('module-usage-updated', handler);
  };
}

