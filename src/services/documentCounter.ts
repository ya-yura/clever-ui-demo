/**
 * Сервис для получения количества документов по операциям
 * Интегрируется с функциональной программой Cleverence
 */

import type { ButtonAction } from '../types/ui-schema';
import { api } from './api';
import { demoDataService } from './demoDataService';

export interface DocumentCount {
  action: ButtonAction;
  count: number;
  lastUpdated: Date;
}

export class DocumentCounterService {
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
   * Проверить демо-режим
   */
  private isDemoMode(): boolean {
    return localStorage.getItem('demo_mode') === 'true';
  }

  /**
   * Запрос к API функциональной программы
   */
  private async fetchCount(action: ButtonAction): Promise<number> {
    // Маппинг действий на эндпоинты API
    const endpointMap: Record<ButtonAction, string> = {
      none: '',
      RECEIVING: '/Docs/PrihodNaSklad',
      ORDER_PICKING: '/Docs/PodborZakaza',
      SHIPPING: '/Docs/Otgruzka',
      INVENTORY: '/Docs/Inventarizaciya',
      PLACEMENT: '/Docs/RazmeshhenieVYachejki',
      RETURN: '/Docs/Vozvrat',
      TRANSFER: '/Docs/Peremeshenie',
      MARKING: '/Docs/Markirovka',
    };

    const uniMap: Record<ButtonAction, string> = {
      none: '',
      RECEIVING: 'PrihodNaSklad',
      ORDER_PICKING: 'PodborZakaza',
      SHIPPING: 'Otgruzka',
      INVENTORY: 'Inventarizaciya',
      PLACEMENT: 'RazmeshhenieVYachejki',
      RETURN: 'Vozvrat',
      TRANSFER: 'Peremeshenie',
      MARKING: 'Markirovka',
    };

    // Demo mode - return data from JSON
    if (this.isDemoMode()) {
      const uni = uniMap[action];
      if (!uni) return 0;
      
      const count = demoDataService.getDocumentsCount(uni);
      console.log(`🎭 [DEMO] ${action}: ${count} documents`);
      return count;
    }

    const endpoint = endpointMap[action];
    if (!endpoint) {
      return 0;
    }

    try {
      const response = await api.get(endpoint, {
        $top: 0, // некоторые серверы игнорируют, но оставим для совместимости
        $count: true,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Empty response');
      }

      const data: any = response.data;

      if (typeof data === 'number') {
        return data;
      }

      if (typeof data?.['@odata.count'] === 'number') {
        return data['@odata.count'];
      }

      if (typeof data?.count === 'number') {
        return data.count;
      }

      if (Array.isArray(data?.value)) {
        return data.value.length;
      }

      return 0;
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

