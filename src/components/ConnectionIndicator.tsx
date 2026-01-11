import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useSync } from '@/hooks/useSync';

interface ConnectionIndicatorProps {
  module?: string;
  showDetails?: boolean;
  className?: string;
}

// Форматирование времени последнего синка
const formatTimeSince = (timestamp: number | null): string => {
  if (!timestamp) return 'Никогда';
  
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (seconds < 60) return 'Только что';
  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  
  const days = Math.floor(hours / 24);
  return `${days} дн. назад`;
};

/**
 * US IX.3: Connection Status Indicator
 * - Red indicator when offline
 * - Shows sync queue count
 * - Auto-sync on reconnect
 * - Retry on error
 */
export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  module = 'app',
  showDetails = false,
  className = '',
}) => {
  const { isOnline, pendingSyncActions } = useOfflineStorage(module);
  const { isSyncing, syncError, sync } = useSync({ 
    module, 
    syncEndpoint: '/api/sync' 
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Обновление текущего времени каждую минуту для таймера
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Каждую минуту
    
    return () => clearInterval(interval);
  }, []);

  // Загрузка времени последнего синка
  useEffect(() => {
    const loadLastSync = () => {
      const stored = localStorage.getItem('last_sync_time');
      if (stored) {
        setLastSyncTime(parseInt(stored, 10));
      }
    };
    
    loadLastSync();
  }, [isSyncing]); // Обновляем при изменении статуса синхронизации

  // US IX.2.2: Auto-sync when going online
  useEffect(() => {
    if (isOnline && pendingSyncActions.length > 0 && !isSyncing) {
      console.log('📡 Connection restored, auto-syncing...');
      sync();
    }
  }, [isOnline, pendingSyncActions.length, isSyncing, sync]);

  const handleRetry = async () => {
    await sync();
    const now = Date.now();
    setLastSyncTime(now);
    localStorage.setItem('last_sync_time', now.toString());
  };

  const statusColor = isOnline
    ? syncError
      ? 'warning'
      : pendingSyncActions.length > 0
      ? 'info'
      : 'success'
    : 'error';

  const statusIcon = isOnline ? (
    isSyncing ? (
      <RefreshCw size={16} className="animate-spin" />
    ) : syncError ? (
      <AlertCircle size={16} />
    ) : (
      <Wifi size={16} />
    )
  ) : (
    <WifiOff size={16} />
  );

  const statusText = isOnline
    ? isSyncing
      ? 'Синхронизация...'
      : syncError
      ? 'Ошибка синхронизации'
      : pendingSyncActions.length > 0
      ? `В очереди: ${pendingSyncActions.length}`
      : 'Синхронизировано'
    : 'Нет связи';

  if (!showDetails) {
    // Compact mode - just indicator dot
    return (
      <div
        className={`flex items-center gap-2 ${className}`}
        title={statusText}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            statusColor === 'success'
              ? 'bg-success'
              : statusColor === 'error'
              ? 'bg-error animate-pulse'
              : statusColor === 'warning'
              ? 'bg-warning animate-pulse'
              : 'bg-brand-primary animate-pulse'
          }`}
        />
      </div>
    );
  }

  // Full mode - with text and dropdown
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          statusColor === 'success'
            ? 'bg-success/10 text-success hover:bg-success/20'
            : statusColor === 'error'
            ? 'bg-error/10 text-error hover:bg-error/20'
            : statusColor === 'warning'
            ? 'bg-warning/10 text-warning hover:bg-warning/20'
            : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20'
        }`}
      >
        {statusIcon}
        <span>{statusText}</span>
      </button>

      {/* Dropdown with details */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown content */}
          <div className="absolute right-0 mt-2 w-72 bg-surface-primary rounded-lg shadow-2xl border border-separator z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-surface-secondary border-b border-separator">
              <div className="flex items-center gap-2 mb-2">
                {statusIcon}
                <h3 className="font-bold">Статус подключения</h3>
              </div>
              <p className="text-sm text-content-secondary">{statusText}</p>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              {/* Online status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-content-tertiary">Сеть:</span>
                <span
                  className={`text-sm font-medium ${
                    isOnline ? 'text-success' : 'text-error'
                  }`}
                >
                  {isOnline ? 'Онлайн' : 'Оффлайн'}
                </span>
              </div>

              {/* Таймер последнего синка */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-content-tertiary flex items-center gap-1">
                  <Clock size={14} />
                  Последняя синхронизация:
                </span>
                <span className="text-sm font-medium text-content-primary">
                  {formatTimeSince(lastSyncTime)}
                </span>
              </div>

              {/* Sync queue */}
              {pendingSyncActions.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-content-tertiary">В очереди:</span>
                  <span className="text-sm font-medium text-brand-primary">
                    {pendingSyncActions.length}
                  </span>
                </div>
              )}

              {/* Простое объяснение когда всё синхронизировано */}
              {isOnline && pendingSyncActions.length === 0 && !syncError && (
                <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-success flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-success-dark mb-1">
                        Синхронизация не требуется
                      </p>
                      <p className="text-xs text-success-dark/80">
                        Все ваши действия сохранены на сервере. Можете работать спокойно.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error message */}
              {syncError && (
                <div className="p-3 bg-error/10 rounded-lg">
                  <p className="text-xs text-error font-medium mb-1">Ошибка:</p>
                  <p className="text-xs text-error-dark">{syncError}</p>
                </div>
              )}

              {/* Status message */}
              {!isOnline && (
                <div className="p-3 bg-warning/10 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-warning flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-warning-dark">
                      Работа продолжается локально. Данные автоматически сохраняются и будут синхронизированы при восстановлении связи.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {isOnline && !isSyncing && (
                <button
                  onClick={handleRetry}
                  disabled={pendingSyncActions.length === 0}
                  className={`w-full py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    pendingSyncActions.length > 0
                      ? 'bg-brand-primary text-white hover:brightness-110'
                      : 'bg-surface-tertiary text-content-tertiary cursor-not-allowed'
                  }`}
                >
                  <RefreshCw size={16} />
                  {pendingSyncActions.length > 0 
                    ? `Синхронизировать (${pendingSyncActions.length})`
                    : 'Синхронизация не требуется'
                  }
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
