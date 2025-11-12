/**
 * Сервис для получения количества документов по операциям
 * Интегрируется с функциональной программой Cleverence
 */

import type { ButtonAction } from '../types/ui-schema';

export interface DocumentCount {
  action: ButtonAction;
  count: number;
  lastUpdated: Date;
}

export class DocumentCounterService {
  private static apiBaseUrl = '/api'; // Настроить URL API функциональной программы
  private cache: Map<ButtonAction, DocumentCount> = new Map();
  private updateInterval: number | null = null;

  /**
   * Получить количество документов для конкретного действия
   */
  async getCount(action: ButtonAction): Promise<number> {
    // Проверяем кеш
    const cached = this.cache.get(action);
    if (cached && this.isCacheValid(cached)) {
      return cached.count;
    }

    try {
      const count = await this.fetchCount(action);
      this.updateCache(action, count);
      return count;
    } catch (error) {
      console.error(`Failed to fetch count for ${action}:`, error);
      return cached?.count || 0;
    }
  }

  /**
   * Получить количества для всех действий
   */
  async getAllCounts(actions: ButtonAction[]): Promise<Map<ButtonAction, number>> {
    const counts = new Map<ButtonAction, number>();
    
    await Promise.all(
      actions.map(async (action) => {
        if (action !== 'none') {
          const count = await this.getCount(action);
          counts.set(action, count);
        }
      })
    );

    return counts;
  }

  /**
   * Запрос к API функциональной программы
   */
  private async fetchCount(action: ButtonAction): Promise<number> {
    // Маппинг действий на эндпоинты API
    const endpointMap: Record<ButtonAction, string> = {
      none: '',
      RECEIVING: '/docs/PrihodNaSklad/count',
      ORDER_PICKING: '/docs/PodborZakaza/count',
      SHIPPING: '/docs/Otgruzka/count',
      INVENTORY: '/docs/Inventarizaciya/count',
      PLACEMENT: '/docs/RazmeshhenieVYachejki/count',
      RETURN: '/docs/Vozvrat/count',
      TRANSFER: '/docs/Peremeshenie/count',
      MARKING: '/docs/Markirovka/count',
    };

    const endpoint = endpointMap[action];
    if (!endpoint) {
      return 0;
    }

    try {
      const response = await fetch(`${DocumentCounterService.apiBaseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error(`API request failed for ${action}:`, error);
      // Fallback: возвращаем данные из локального хранилища
      return this.getCountFromLocalStorage(action);
    }
  }

  /**
   * Обновить кеш
   */
  private updateCache(action: ButtonAction, count: number): void {
    this.cache.set(action, {
      action,
      count,
      lastUpdated: new Date(),
    });

    // Сохраняем в localStorage для оффлайн режима
    this.saveToLocalStorage(action, count);
  }

  /**
   * Проверка валидности кеша (5 минут)
   */
  private isCacheValid(cached: DocumentCount): boolean {
    const now = new Date();
    const diff = now.getTime() - cached.lastUpdated.getTime();
    const maxAge = 5 * 60 * 1000; // 5 минут
    return diff < maxAge;
  }

  /**
   * Сохранить в localStorage
   */
  private saveToLocalStorage(action: ButtonAction, count: number): void {
    try {
      const key = `doc-count-${action}`;
      localStorage.setItem(key, JSON.stringify({
        count,
        timestamp: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  /**
   * Получить из localStorage
   */
  private getCountFromLocalStorage(action: ButtonAction): number {
    try {
      const key = `doc-count-${action}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        return data.count || 0;
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return 0;
  }

  /**
   * Запустить автоматическое обновление
   */
  startAutoUpdate(actions: ButtonAction[], intervalMs: number = 60000): void {
    this.stopAutoUpdate();
    
    this.updateInterval = window.setInterval(() => {
      this.getAllCounts(actions).catch(error => {
        console.error('Auto-update failed:', error);
      });
    }, intervalMs);
  }

  /**
   * Остановить автоматическое обновление
   */
  stopAutoUpdate(): void {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Очистить кеш
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const documentCounter = new DocumentCounterService();

