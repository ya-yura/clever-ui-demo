// === 📁 src/hooks/useSync.ts ===
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { useOfflineStorage } from './useOfflineStorage';
import serverConfig from '@/config/server.json';

export function useSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const { getSyncQueue, removeFromSyncQueue, incrementRetries } = useOfflineStorage();

  // Отслеживание статуса сети
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Синхронизация очереди
  const syncQueue = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    setSyncProgress(0);

    try {
      const queue = await getSyncQueue();
      
      if (queue.length === 0) {
        setIsSyncing(false);
        return;
      }

      let completed = 0;

      for (const item of queue) {
        try {
          // Пропускаем элементы с превышенным числом попыток
          if (item.retries >= serverConfig.offline.maxRetries) {
            continue;
          }

          // Выполняем синхронизацию в зависимости от типа
          switch (item.type) {
            case 'receiving':
              await api.syncReceiving(item.documentId, item.data);
              break;
            case 'placement':
              await api.syncPlacement(item.documentId, item.data);
              break;
            case 'picking':
              await api.syncPicking(item.documentId, item.data);
              break;
            case 'shipment':
              await api.syncShipment(item.documentId, item.data);
              break;
            case 'return':
              await api.syncReturn(item.documentId, item.data);
              break;
            case 'inventory':
              await api.syncInventory(item.documentId, item.data);
              break;
          }

          // Удаляем из очереди при успехе
          await removeFromSyncQueue(item.id);
          completed++;
        } catch (error) {
          // Увеличиваем счётчик попыток
          await incrementRetries(item.id, error instanceof Error ? error.message : 'Unknown error');
        }

        setSyncProgress((completed / queue.length) * 100);
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  }, [isOnline, isSyncing, getSyncQueue, removeFromSyncQueue, incrementRetries]);

  // Автоматическая синхронизация при восстановлении сети
  useEffect(() => {
    if (isOnline && serverConfig.offline.autoSyncEnabled) {
      syncQueue();
    }
  }, [isOnline, syncQueue]);

  // Периодическая синхронизация
  useEffect(() => {
    if (!serverConfig.offline.autoSyncEnabled) return;

    const interval = setInterval(() => {
      if (isOnline) {
        syncQueue();
      }
    }, serverConfig.syncIntervalSec * 1000);

    return () => clearInterval(interval);
  }, [isOnline, syncQueue]);

  // Принудительная синхронизация
  const forceSync = useCallback(() => {
    syncQueue();
  }, [syncQueue]);

  return {
    isOnline,
    isSyncing,
    syncProgress,
    forceSync
  };
}



