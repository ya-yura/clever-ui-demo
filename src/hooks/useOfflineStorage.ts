// === 📁 src/hooks/useOfflineStorage.ts ===
import { useCallback } from 'react';
import { db, SyncQueueItem } from '@/services/db';
import { getISOString } from '@/utils/date';

export function useOfflineStorage() {
  // Добавление в очередь синхронизации
  const addToSyncQueue = useCallback(async (
    type: SyncQueueItem['type'],
    documentId: string,
    action: SyncQueueItem['action'],
    data: any
  ) => {
    const item: SyncQueueItem = {
      id: `${type}-${documentId}-${Date.now()}`,
      type,
      documentId,
      action,
      data,
      timestamp: Date.now(),
      retries: 0
    };

    await db.syncQueue.add(item);
  }, []);

  // Получение очереди синхронизации
  const getSyncQueue = useCallback(async () => {
    return await db.syncQueue.toArray();
  }, []);

  // Удаление из очереди
  const removeFromSyncQueue = useCallback(async (id: string) => {
    await db.syncQueue.delete(id);
  }, []);

  // Увеличение счётчика попыток
  const incrementRetries = useCallback(async (id: string, error: string) => {
    const item = await db.syncQueue.get(id);
    if (item) {
      await db.syncQueue.update(id, {
        retries: item.retries + 1,
        lastError: error
      });
    }
  }, []);

  // Сохранение документа приёмки
  const saveReceivingDoc = useCallback(async (doc: any) => {
    await db.receivingDocs.put({
      ...doc,
      updatedAt: getISOString()
    });
  }, []);

  // Сохранение документа размещения
  const savePlacementDoc = useCallback(async (doc: any) => {
    await db.placementDocs.put({
      ...doc,
      updatedAt: getISOString()
    });
  }, []);

  // Сохранение документа подбора
  const savePickingDoc = useCallback(async (doc: any) => {
    await db.pickingDocs.put({
      ...doc,
      updatedAt: getISOString()
    });
  }, []);

  // Сохранение документа отгрузки
  const saveShipmentDoc = useCallback(async (doc: any) => {
    await db.shipmentDocs.put({
      ...doc,
      updatedAt: getISOString()
    });
  }, []);

  // Сохранение документа возврата
  const saveReturnDoc = useCallback(async (doc: any) => {
    await db.returnDocs.put({
      ...doc,
      updatedAt: getISOString()
    });
  }, []);

  // Сохранение документа инвентаризации
  const saveInventoryDoc = useCallback(async (doc: any) => {
    await db.inventoryDocs.put({
      ...doc,
      updatedAt: getISOString()
    });
  }, []);

  // Автосохранение с интервалом
  const setupAutoSave = useCallback((
    saveFunction: () => Promise<void>,
    intervalSec: number = 30
  ) => {
    const interval = setInterval(saveFunction, intervalSec * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    addToSyncQueue,
    getSyncQueue,
    removeFromSyncQueue,
    incrementRetries,
    saveReceivingDoc,
    savePlacementDoc,
    savePickingDoc,
    saveShipmentDoc,
    saveReturnDoc,
    saveInventoryDoc,
    setupAutoSave
  };
}



