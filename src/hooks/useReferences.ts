// === 📁 src/hooks/useReferences.ts ===
// Hook for updating reference data (справочники)

import { useState, useCallback } from 'react';
import { db } from '@/services/db';
import { api } from '@/services/api';
import { demoDataService } from '@/services/demoDataService';

export const useReferences = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const updateReferences = useCallback(async () => {
    // Проверить, включен ли демо-режим
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';

    if (!isDemoMode && !navigator.onLine) {
      setUpdateError('Требуется подключение к интернету');
      return false;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      if (isDemoMode) {
        // Загрузить данные из демо-сервиса
        console.log('📦 [DEMO] Обновление справочников из демо-данных');
        
        const references = demoDataService.getReferences();
        
        // Update products
        if (references.products && references.products.length > 0) {
          await db.products.clear();
          await db.products.bulkAdd(references.products);
          console.log(`✅ [DEMO] Загружено товаров: ${references.products.length}`);
        }

        // Update cells
        if (references.cells && references.cells.length > 0) {
          await db.cells.clear();
          await db.cells.bulkAdd(references.cells);
          console.log(`✅ [DEMO] Загружено ячеек: ${references.cells.length}`);
        }

        // Update employees
        if (references.employees && references.employees.length > 0) {
          await db.employees.clear();
          await db.employees.bulkAdd(references.employees as any);
          console.log(`✅ [DEMO] Загружено сотрудников: ${references.employees.length}`);
        }

        setLastUpdateTime(Date.now());
        return true;
      } else {
        // Fetch reference data from server
        const response = await api.get('/api/references/sync');

        if (response.success && response.data) {
          // Update products
          if (response.data.products) {
            await db.products.clear();
            await db.products.bulkAdd(response.data.products);
          }

          // Update cells
          if (response.data.cells) {
            await db.cells.clear();
            await db.cells.bulkAdd(response.data.cells);
          }

          // Update employees
          if (response.data.employees) {
            await db.employees.clear();
            await db.employees.bulkAdd(response.data.employees);
          }

          setLastUpdateTime(Date.now());
          return true;
        } else {
          throw new Error(response.error || 'Failed to update references');
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Update failed';
      setUpdateError(errorMessage);
      console.error('Reference update error:', error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    isUpdating,
    lastUpdateTime,
    updateError,
    updateReferences,
  };
};

