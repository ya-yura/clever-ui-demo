# 🔌 Интеграция Analytics в существующее PWA

Пошаговое руководство по интеграции трекера в проект Cleverence Склад-15.

---

## 📁 Структура файлов

После интеграции у вас будет:

```
proto-3/
├── src/
│   ├── analytics.ts                    ← Основной трекер
│   ├── types/
│   │   └── analytics.types.ts          ← TypeScript типы
│   └── examples/
│       └── analytics-usage.example.tsx ← Примеры
├── server/
│   ├── track-server.js                 ← Express сервер
│   ├── package.json                    ← Зависимости
│   ├── queries.sql                     ← Полезные SQL-запросы
│   ├── README.md                       ← Документация сервера
│   └── env.example                     ← Пример конфига
└── DOCS/
    ├── ANALYTICS.md                    ← Полная документация
    ├── ANALYTICS_QUICK_START.md        ← Быстрый старт
    └── ANALYTICS_INTEGRATION.md        ← Эта инструкция
```

---

## 🚀 Шаг 1: Инициализация в App

### `src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import analytics from './analytics';

// Инициализация аналитики при старте
analytics.init({
  endpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT || 'http://localhost:9001/track',
  batchSize: 10,
  flushInterval: 30000,
  debug: import.meta.env.DEV,
  trackPerformance: true,
  trackErrors: true,
});

// Первое событие
analytics.trackPageView();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Добавьте в `.env`

```bash
# Analytics endpoint
VITE_ANALYTICS_ENDPOINT=http://localhost:9001/track
```

---

## 🧭 Шаг 2: Отслеживание навигации

### `src/App.tsx`

```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analytics from './analytics';

function App() {
  const location = useLocation();
  
  // Отслеживать каждую смену роута
  useEffect(() => {
    analytics.trackPageView();
  }, [location.pathname]);
  
  return (
    <Router>
      {/* Ваши роуты */}
    </Router>
  );
}
```

---

## 📦 Шаг 3: Интеграция в модули

### Приёмка (`src/pages/Receiving.tsx`)

```typescript
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import analytics from '../analytics';
import { EVENTS, DOCUMENT_TYPES } from '../types/analytics.types';

export function ReceivingPage() {
  const { id } = useParams();
  const [startTime] = useState(performance.now());
  
  useEffect(() => {
    // Открытие документа
    if (id) {
      analytics.track(EVENTS.DOCUMENT_OPENED, {
        document_type: DOCUMENT_TYPES.RECEIVING,
        document_id: id,
      });
    }
    
    // Время загрузки
    loadDocument(id).then(() => {
      analytics.trackScreenLoadTime('Receiving Document', startTime);
    });
    
    // Cleanup при закрытии
    return () => {
      const duration = (performance.now() - startTime) / 1000;
      analytics.track(EVENTS.DOCUMENT_OPENED, {
        document_type: DOCUMENT_TYPES.RECEIVING,
        document_id: id,
        duration_seconds: Math.round(duration),
      });
    };
  }, [id]);
  
  const handleComplete = () => {
    const duration = (performance.now() - startTime) / 1000;
    
    analytics.track(EVENTS.DOCUMENT_COMPLETED, {
      document_type: DOCUMENT_TYPES.RECEIVING,
      document_id: id,
      lines_count: document.lines.length,
      lines_completed: document.completedLines,
      duration_seconds: Math.round(duration),
    });
    
    // Завершение документа...
  };
  
  return (
    <div>
      {/* UI документа */}
      <button onClick={handleComplete}>Завершить</button>
    </div>
  );
}
```

---

## 🔍 Шаг 4: Интеграция сканера

### `src/hooks/useScanner.ts`

```typescript
import { useState } from 'react';
import analytics from '../analytics';
import { SCAN_METHODS } from '../types/analytics.types';

export function useScanner() {
  const [lastScan, setLastScan] = useState<string>('');
  
  const handleScan = (barcode: string, method: 'keyboard' | 'camera' | 'manual') => {
    const startTime = performance.now();
    
    // Отследить попытку
    analytics.trackScanAttempt(method);
    
    try {
      // Обработка штрихкода
      const product = findProductByBarcode(barcode);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Успех
      const duration = performance.now() - startTime;
      analytics.trackScanSuccess(barcode, method, duration);
      
      setLastScan(barcode);
      return product;
    } catch (error) {
      // Ошибка
      analytics.trackScanFail(
        error instanceof Error ? error.message : 'Unknown error',
        method
      );
      
      throw error;
    }
  };
  
  return { lastScan, handleScan };
}
```

### Использование в компоненте:

```typescript
function ReceivingDocument() {
  const { handleScan } = useScanner();
  
  const onBarcodeScan = (code: string) => {
    try {
      const product = handleScan(code, 'keyboard');
      // Добавить товар в документ
    } catch (error) {
      // Показать ошибку
    }
  };
  
  return <ScannerInput onScan={onBarcodeScan} />;
}
```

---

## ❌ Шаг 5: Обработка ошибок

### Error Boundary (`src/components/ErrorBoundary.tsx`)

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';
import analytics from '../analytics';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Отследить ошибку
    analytics.trackError(error, {
      component: errorInfo.componentStack,
      error_boundary: true,
    });
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Что-то пошло не так.</h1>;
    }
    
    return this.props.children;
  }
}
```

### Использование:

```typescript
// src/App.tsx
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>{/* routes */}</Router>
    </ErrorBoundary>
  );
}
```

### В async функциях:

```typescript
async function loadDocument(id: string) {
  try {
    const response = await fetch(`/api/documents/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    analytics.trackError(error as Error, {
      component: 'DocumentLoader',
      document_id: id,
      action: 'load',
    });
    
    throw error;
  }
}
```

---

## 🔄 Шаг 6: Синхронизация

### `src/hooks/useSync.ts`

```typescript
import { useState } from 'react';
import analytics from '../analytics';
import { EVENTS } from '../types/analytics.types';

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  
  const sync = async (module: string) => {
    setIsSyncing(true);
    const startTime = performance.now();
    
    analytics.track(EVENTS.SYNC_STARTED, { module });
    
    try {
      const result = await performSync(module);
      
      const duration = performance.now() - startTime;
      
      analytics.track(EVENTS.SYNC_COMPLETED, {
        module,
        items_count: result.itemsCount,
        duration_ms: Math.round(duration),
      });
      
      return result;
    } catch (error) {
      analytics.track(EVENTS.SYNC_FAILED, {
        module,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };
  
  return { isSyncing, sync };
}
```

---

## 🎯 Шаг 7: Кастомные события

### Пример: Отслеживание работы с меню

```typescript
// src/modules/menu/HamburgerMenu.tsx
import analytics from '../../analytics';

function HamburgerMenu() {
  const handleMenuOpen = () => {
    analytics.track('menu.opened');
  };
  
  const handleMenuItemClick = (item: string) => {
    analytics.track('menu.item_clicked', {
      item_name: item,
    });
  };
  
  return (
    <Menu onOpen={handleMenuOpen}>
      <MenuItem onClick={() => handleMenuItemClick('sync')}>
        Синхронизировать
      </MenuItem>
      {/* Другие пункты */}
    </Menu>
  );
}
```

### Отслеживание поиска:

```typescript
// src/pages/Documents.tsx
import { debounce } from 'lodash';
import analytics from '../analytics';

function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Отслеживать поиск с debounce
  const trackSearch = debounce((query: string) => {
    if (query.length >= 3) {
      analytics.track('search.performed', {
        query_length: query.length,
        context: 'documents',
      });
    }
  }, 1000);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    trackSearch(query);
  };
  
  return (
    <input 
      value={searchQuery}
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Поиск документов"
    />
  );
}
```

---

## 📊 Шаг 8: Мониторинг в Development

### DevTools для аналитики

Создайте компонент для отладки:

```typescript
// src/components/AnalyticsDebugPanel.tsx
import { useState, useEffect } from 'react';

export function AnalyticsDebugPanel() {
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    // Загружать статистику каждые 5 секунд
    const interval = setInterval(async () => {
      const response = await fetch('http://localhost:9001/stats?days=1');
      const data = await response.json();
      setStats(data);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!import.meta.env.DEV) return null;
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
    }}>
      <h4>📊 Analytics (Today)</h4>
      {stats && (
        <>
          <div>Events: {stats.total_events}</div>
          <div>Users: {stats.total_users}</div>
          {stats.events.slice(0, 5).map((e: any) => (
            <div key={e.event_name}>
              {e.event_name}: {e.count}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
```

Добавьте в `App.tsx`:

```typescript
import { AnalyticsDebugPanel } from './components/AnalyticsDebugPanel';

function App() {
  return (
    <>
      <Router>{/* routes */}</Router>
      <AnalyticsDebugPanel />
    </>
  );
}
```

---

## 🚢 Шаг 9: Production Deploy

### 1. Настройка переменных окружения

#### `.env.production`

```bash
VITE_ANALYTICS_ENDPOINT=https://analytics.your-domain.com/track
```

### 2. Настройка сервера

```bash
# server/.env
PORT=9001
DB_PATH=/var/lib/analytics/analytics.db
CORS_ORIGINS=https://your-pwa-domain.com
```

### 3. Nginx reverse proxy

```nginx
# /etc/nginx/sites-available/analytics
server {
    listen 443 ssl http2;
    server_name analytics.your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:9001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Systemd service

```ini
# /etc/systemd/system/analytics-server.service
[Unit]
Description=Analytics Tracking Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/analytics
ExecStart=/usr/bin/node /var/www/analytics/track-server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Запуск:

```bash
sudo systemctl enable analytics-server
sudo systemctl start analytics-server
sudo systemctl status analytics-server
```

---

## ✅ Чеклист интеграции

- [ ] ✅ Файлы трекера скопированы в `src/`
- [ ] ✅ Сервер установлен и запущен
- [ ] ✅ Инициализация в `main.tsx`
- [ ] ✅ Отслеживание навигации в `App.tsx`
- [ ] ✅ Интеграция в сканер
- [ ] ✅ Интеграция в модули документов
- [ ] ✅ Error Boundary добавлен
- [ ] ✅ Отслеживание синхронизации
- [ ] ✅ Debug панель в dev-режиме
- [ ] ✅ Production конфигурация
- [ ] ✅ Nginx настроен (production)
- [ ] ✅ SSL сертификат установлен (production)

---

## 📈 Примеры отчетов

### Дневной отчет (SQL)

```sql
-- Сохраните в daily_report.sql
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as events,
  COUNT(DISTINCT user_id) as users,
  COUNT(DISTINCT session_id) as sessions,
  SUM(CASE WHEN event_name = 'scan.success' THEN 1 ELSE 0 END) as scans,
  SUM(CASE WHEN event_name = 'document.completed' THEN 1 ELSE 0 END) as completed_docs,
  SUM(CASE WHEN event_name = 'error' THEN 1 ELSE 0 END) as errors
FROM events
WHERE timestamp >= datetime('now', '-7 days')
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

Запуск:

```bash
sqlite3 server/analytics.db < daily_report.sql
```

---

## 🆘 Поддержка

- 📖 **Полная документация:** `/DOCS/ANALYTICS.md`
- 🚀 **Быстрый старт:** `/DOCS/ANALYTICS_QUICK_START.md`
- 💡 **Примеры использования:** `/src/examples/analytics-usage.example.tsx`
- 🗃️ **SQL-запросы:** `/server/queries.sql`
- 📊 **Типы событий:** `/src/types/analytics.types.ts`

---

**Время интеграции:** ~30 минут  
**Влияние на производительность:** Минимальное (~0.5ms на событие)  
**Размер bundle:** +15 KB  
**Зависимости:** 0 (клиент), 3 (сервер)



