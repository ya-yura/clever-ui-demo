# 📊 Analytics Tracking System

**Версия:** 1.0.0  
**Статус:** ✅ Production-Ready  
**Дата:** 12 ноября 2025

---

## 📋 Содержание

- [Обзор](#обзор)
- [Быстрый старт](#быстрый-старт)
- [Клиентская часть](#клиентская-часть)
- [Серверная часть](#серверная-часть)
- [API Reference](#api-reference)
- [Анализ данных](#анализ-данных)
- [Кастомные интерфейсы](#кастомные-интерфейсы)
- [Интеграция с PostHog](#интеграция-с-posthog)
- [Troubleshooting](#troubleshooting)

---

## Обзор

Минималистичная система аналитики для PWA-приложений с поддержкой offline-first режима, разработанная специально для ТСД (терминалов сбора данных) на Android.

### ✨ Ключевые особенности

- ✅ **Offline-First:** События буферизуются в localStorage, отправляются пакетами при наличии сети
- ✅ **Надежность:** Использует `navigator.sendBeacon()` с fallback на `fetch({ keepalive: true })`
- ✅ **Анонимность:** UUID-based tracking без персональных данных
- ✅ **Zero Dependencies:** Клиентская часть без внешних библиотек
- ✅ **Performance:** Batch sending, минимальное влияние на UI
- ✅ **Production-Ready:** Готов к использованию из коробки

### 📦 Что включено

1. **Клиентский трекер** (`src/analytics.ts`) — TypeScript, ESModules
2. **Серверная часть** (`server/track-server.js`) — Node.js/Express + SQLite
3. **Документация** — Полное руководство

---

## Быстрый старт

### 1. Установка клиентской части

Файл `src/analytics.ts` уже создан в вашем проекте. Инициализируйте трекер в точке входа приложения:

```typescript
// src/main.tsx или src/App.tsx
import analytics from './analytics';

// Инициализация при старте приложения
analytics.init({
  endpoint: 'http://localhost:9001/track',
  batchSize: 10,           // Отправка после 10 событий
  flushInterval: 30000,    // Или каждые 30 секунд
  debug: true,             // Включить логи (отключить в production)
  trackPerformance: true,  // Отслеживать производительность
  trackErrors: true,       // Отслеживать ошибки
});

// Отследить первый просмотр экрана
analytics.trackPageView();
```

### 2. Установка серверной части

```bash
# Перейти в папку сервера
cd server

# Установить зависимости
npm install

# Запустить сервер
npm start
```

Сервер запустится на порту **9001** и будет готов принимать события.

### 3. Проверка работы

Откройте DevTools → Console и увидите:

```
[Analytics] Analytics initialized
[Analytics] Event tracked: screen_view
[Analytics] Sending 1 events to http://localhost:9001/track
[Analytics] Successfully sent 1 events
```

🎉 **Готово!** Система работает.

---

## Клиентская часть

### Конфигурация

```typescript
interface AnalyticsConfig {
  /** API endpoint для отправки событий */
  endpoint: string;
  
  /** Размер пакета (кол-во событий до авто-отправки) */
  batchSize?: number; // по умолчанию: 10
  
  /** Интервал авто-отправки (мс) */
  flushInterval?: number; // по умолчанию: 30000 (30 сек)
  
  /** Включить debug-логи */
  debug?: boolean; // по умолчанию: false
  
  /** Отслеживать производительность */
  trackPerformance?: boolean; // по умолчанию: true
  
  /** Отслеживать ошибки */
  trackErrors?: boolean; // по умолчанию: true
  
  /** Версия приложения (переопределяет manifest) */
  appVersion?: string;
}
```

### Основные методы

#### 📄 Отслеживание просмотра экрана

```typescript
// Автоматическое определение экрана
analytics.trackPageView();

// С явным названием
analytics.trackPageView('Receiving Document');
```

#### 📦 События сканирования

```typescript
// Попытка сканирования
analytics.trackScanAttempt('keyboard'); // или 'camera', 'manual'

// Успешное сканирование
analytics.trackScanSuccess('1234567890123', 'keyboard', 150); // barcode, method, duration_ms

// Ошибка сканирования
analytics.trackScanFail('Invalid barcode format', 'camera');
```

#### ✏️ Ручной ввод

```typescript
analytics.trackManualInput('barcode');
analytics.trackManualInput('quantity');
```

#### ✅ Подтверждение и отмена

```typescript
// Подтверждение действия
analytics.trackConfirm('complete_document', {
  document_type: 'receiving',
  lines_count: 15,
});

// Отмена действия
analytics.trackCancel('complete_document', {
  reason: 'incomplete',
});
```

#### ❌ Отслеживание ошибок

```typescript
try {
  // Ваш код
} catch (error) {
  analytics.trackError(error, {
    component: 'Receiving',
    action: 'scan',
  });
}
```

#### ⏱️ Производительность

```typescript
// Замер времени загрузки экрана
const startTime = performance.now();
// ... загрузка данных ...
analytics.trackScreenLoadTime('Receiving', startTime);

// Произвольный timing
analytics.trackTiming('api', 'load_documents', 1250, 'receiving');
```

#### 🎯 Кастомные события

```typescript
analytics.track('custom_event', {
  property1: 'value1',
  property2: 123,
  property3: true,
});
```

### Интеграция в React-компоненты

#### Отслеживание навигации (React Router)

```typescript
// src/App.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analytics from './analytics';

function App() {
  const location = useLocation();
  
  useEffect(() => {
    analytics.trackPageView();
  }, [location.pathname]);
  
  return <Router>{/* ... */}</Router>;
}
```

#### Отслеживание загрузки компонента

```typescript
function ReceivingPage() {
  useEffect(() => {
    const startTime = performance.now();
    
    // Загрузка данных...
    loadData().then(() => {
      analytics.trackScreenLoadTime('Receiving', startTime);
    });
  }, []);
  
  return <div>{/* ... */}</div>;
}
```

#### Отслеживание сканирования

```typescript
const { handleScan } = useScanner({
  onScan: (barcode) => {
    const startTime = performance.now();
    
    analytics.trackScanAttempt('keyboard');
    
    try {
      const result = processBarcode(barcode);
      const duration = performance.now() - startTime;
      
      analytics.trackScanSuccess(barcode, 'keyboard', duration);
    } catch (error) {
      analytics.trackScanFail(error.message, 'keyboard');
    }
  },
});
```

#### Отслеживание кнопок

```typescript
<button
  onClick={() => {
    analytics.trackConfirm('save_document', {
      document_id: doc.id,
      lines_count: doc.lines.length,
    });
    
    saveDocument(doc);
  }}
>
  Сохранить
</button>
```

### Offline-режим

Трекер автоматически обрабатывает offline:

1. **Буферизация:** События сохраняются в `localStorage`
2. **Автоотправка:** При восстановлении связи автоматически отправляет накопленные события
3. **Индикация:** Проверяйте статус через `navigator.onLine`

```typescript
// События работают одинаково online и offline
analytics.track('button_click'); // ✅ Сохранится в любом случае
```

### Принудительная отправка

```typescript
// Отправить все накопленные события немедленно
analytics.flush();
```

### Очистка данных (для отладки)

```typescript
// Очистить буфер и localStorage
analytics.clear();
```

---

## Серверная часть

### Установка

```bash
cd server
npm install
```

**Зависимости:**
- `express` — веб-сервер
- `better-sqlite3` — SQLite база данных
- `cors` — CORS для PWA

### Запуск

```bash
# Production
npm start

# Development (с auto-reload)
npm run dev
```

### Переменные окружения

Создайте файл `.env` в папке `server/`:

```bash
# Порт сервера
PORT=9001

# Путь к базе данных
DB_PATH=./analytics.db

# CORS origins (разделенные запятой)
CORS_ORIGINS=http://localhost:5173,http://localhost:9000

# Fallback на JSONL если SQLite не работает
JSONL_FALLBACK=false
```

### Структура базы данных

#### Таблица `events`

```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  properties TEXT,  -- JSON
  context TEXT,     -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Индексы:**
- `idx_event_name` — быстрый поиск по типу события
- `idx_user_id` — поиск по пользователю
- `idx_timestamp` — поиск по времени

#### Таблица `event_stats` (агрегаты)

```sql
CREATE TABLE event_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  event_name TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  UNIQUE(date, event_name)
);
```

### API Endpoints

#### POST `/track` — Прием событий

**Request:**
```json
{
  "events": [
    {
      "event": "screen_view",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "sessionId": "660e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2025-11-12T10:30:00.000Z",
      "properties": {
        "screen": "Receiving",
        "url": "/receiving/RCV-001"
      },
      "context": {
        "appVersion": "1.0.0",
        "device": "Samsung SM-G950F",
        "networkStatus": "online"
      }
    }
  ]
}
```

**Response:**
```json
{
  "received": 1,
  "stored": 1,
  "timestamp": "2025-11-12T10:30:00.500Z"
}
```

#### GET `/stats?days=7` — Статистика

**Response:**
```json
{
  "period": "7 days",
  "total_events": 1250,
  "total_users": 15,
  "events": [
    {
      "event_name": "screen_view",
      "count": 450,
      "unique_users": 15
    },
    {
      "event_name": "scan.success",
      "count": 380,
      "unique_users": 12
    }
  ]
}
```

#### GET `/events?limit=100&event_name=scan.success` — Просмотр событий

Параметры:
- `limit` — количество событий (по умолчанию: 100)
- `event_name` — фильтр по типу события
- `user_id` — фильтр по пользователю

#### GET `/users` — Список пользователей

**Response:**
```json
{
  "count": 15,
  "users": [
    {
      "user_id": "550e8400-...",
      "event_count": 125,
      "first_seen": "2025-11-01T08:00:00.000Z",
      "last_seen": "2025-11-12T10:30:00.000Z"
    }
  ]
}
```

#### GET `/funnel?events=screen_view,scan.attempt,scan.success,confirm` — Воронка конверсии

**Response:**
```json
{
  "funnel": [
    { "step": 1, "event": "screen_view", "users": 100, "events": 450, "conversion": 100 },
    { "step": 2, "event": "scan.attempt", "users": 85, "events": 320, "conversion": 85.0 },
    { "step": 3, "event": "scan.success", "users": 75, "events": 280, "conversion": 88.24 },
    { "step": 4, "event": "confirm", "users": 70, "events": 250, "conversion": 93.33 }
  ],
  "overall_conversion": 93.33
}
```

#### GET `/export?format=csv` — Экспорт данных

Параметры:
- `format` — `csv` или `json` (по умолчанию: csv)

Скачивает файл `events.csv` или `events.json` со всеми событиями.

#### GET `/health` — Health Check

```json
{
  "status": "ok",
  "storage": "sqlite",
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

---

## Анализ данных

### SQL-запросы для анализа

Подключитесь к базе данных:

```bash
sqlite3 server/analytics.db
```

#### Топ событий за сегодня

```sql
SELECT 
  event_name,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_users
FROM events
WHERE DATE(timestamp) = DATE('now')
GROUP BY event_name
ORDER BY count DESC;
```

#### Активность по часам

```sql
SELECT 
  strftime('%H', timestamp) as hour,
  COUNT(*) as events
FROM events
WHERE DATE(timestamp) = DATE('now')
GROUP BY hour
ORDER BY hour;
```

#### Конверсия сканирования

```sql
SELECT 
  (SELECT COUNT(*) FROM events WHERE event_name = 'scan.attempt') as attempts,
  (SELECT COUNT(*) FROM events WHERE event_name = 'scan.success') as success,
  ROUND(
    100.0 * (SELECT COUNT(*) FROM events WHERE event_name = 'scan.success') / 
    (SELECT COUNT(*) FROM events WHERE event_name = 'scan.attempt'),
    2
  ) as success_rate;
```

#### Среднее время загрузки экранов

```sql
SELECT 
  json_extract(properties, '$.screen') as screen,
  ROUND(AVG(json_extract(properties, '$.load_time_ms')), 0) as avg_load_ms,
  COUNT(*) as measurements
FROM events
WHERE event_name = 'screen.load_time'
GROUP BY screen
ORDER BY avg_load_ms DESC;
```

#### Топ ошибок

```sql
SELECT 
  json_extract(properties, '$.message') as error_message,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as affected_users
FROM events
WHERE event_name = 'error'
GROUP BY error_message
ORDER BY count DESC
LIMIT 10;
```

#### Сессии пользователя

```sql
SELECT 
  session_id,
  COUNT(*) as events,
  MIN(timestamp) as session_start,
  MAX(timestamp) as session_end,
  ROUND(
    (julianday(MAX(timestamp)) - julianday(MIN(timestamp))) * 24 * 60,
    1
  ) as duration_minutes
FROM events
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY session_id
ORDER BY session_start DESC;
```

### Визуализация данных

#### Простой dashboard на Python

```python
import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

# Подключение к БД
conn = sqlite3.connect('server/analytics.db')

# Загрузка данных
df = pd.read_sql_query("""
    SELECT 
        event_name,
        COUNT(*) as count
    FROM events
    WHERE DATE(timestamp) >= DATE('now', '-7 days')
    GROUP BY event_name
    ORDER BY count DESC
    LIMIT 10
""", conn)

# График
df.plot(x='event_name', y='count', kind='bar', title='Top 10 Events (Last 7 Days)')
plt.show()
```

#### Экспорт в Excel для анализа

```bash
# Экспорт в CSV
curl http://localhost:9001/export?format=csv > events.csv

# Открыть в Excel
start events.csv  # Windows
open events.csv   # macOS
```

---

## Кастомные интерфейсы

### Автоматическое определение типа интерфейса

Система автоматически определяет, использует ли пользователь **стандартный** или **кастомный** интерфейс (загруженный через QR-код).

**В каждом событии добавляется контекст:**

```json
{
  "context": {
    "interfaceType": "standard" | "custom",
    "interfaceConfigId": "warehouse-a-v2",
    "interfaceConfigVersion": "2.1.0"
  }
}
```

### Специальные события

#### 1. Загрузка кастомного интерфейса

```typescript
analytics.trackCustomInterfaceLoaded({
  id: 'warehouse-a-v2',
  version: '2.1.0',
  buttonsCount: 8,
  source: 'qr'
});
```

#### 2. Клик по кастомной кнопке

```typescript
analytics.trackCustomButtonClick({
  label: 'Приёмка A',
  action: 'navigate',
  params: { path: '/docs/PrihodNaSklad' },
  position: { row: 0, col: 0 },
  color: '#DAA420'
});
```

#### 3. Сканирование QR-кода

```typescript
analytics.trackCustomInterfaceQRScan(true);  // Успешно
analytics.trackCustomInterfaceQRScan(false, 'Invalid schema');  // Ошибка
```

### Анализ кастомных интерфейсов

**Подробная документация:** [`ANALYTICS_CUSTOM_INTERFACES.md`](ANALYTICS_CUSTOM_INTERFACES.md)

**Содержит:**
- SQL-запросы для анализа разных интерфейсов
- Сравнение эффективности стандартного vs кастомного
- Анализ популярности кнопок
- Тепловые карты позиций кнопок
- Статистика загрузок конфигураций
- Типичные инсайты

**Пример запроса:**

```sql
-- Распределение по типу интерфейса
SELECT 
  json_extract(context, '$.interfaceType') as interface_type,
  COUNT(*) as events,
  COUNT(DISTINCT user_id) as users
FROM events
GROUP BY interface_type;
```

---

## Интеграция с PostHog

Если вы хотите использовать PostHog (self-hosted) для расширенной аналитики:

### 1. Установка PostHog (Docker)

```bash
docker run -d \
  --name posthog \
  -p 8000:8000 \
  -e POSTGRES_USER=posthog \
  -e POSTGRES_PASSWORD=posthog \
  posthog/posthog:latest
```

### 2. Проброс событий из track-server

Добавьте в `server/track-server.js`:

```javascript
const axios = require('axios');

const POSTHOG_CONFIG = {
  enabled: process.env.POSTHOG_ENABLED === 'true',
  host: process.env.POSTHOG_HOST || 'http://localhost:8000',
  apiKey: process.env.POSTHOG_API_KEY || '',
};

async function forwardToPostHog(events) {
  if (!POSTHOG_CONFIG.enabled) return;
  
  try {
    await axios.post(`${POSTHOG_CONFIG.host}/capture/`, {
      api_key: POSTHOG_CONFIG.apiKey,
      batch: events.map(e => ({
        event: e.event,
        properties: e.properties,
        timestamp: e.timestamp,
        distinct_id: e.userId,
      })),
    });
  } catch (error) {
    console.error('PostHog forwarding error:', error.message);
  }
}

// В обработчике POST /track
app.post('/track', async (req, res) => {
  // ... существующий код ...
  
  // Форвард в PostHog
  await forwardToPostHog(events);
  
  // ... остальное ...
});
```

### 3. Переменные окружения

```bash
POSTHOG_ENABLED=true
POSTHOG_HOST=http://localhost:8000
POSTHOG_API_KEY=your-project-api-key
```

Теперь события будут дублироваться в PostHog для расширенного анализа (когерты, воронки, графики).

---

## Troubleshooting

### События не отправляются

**Проблема:** События не доходят до сервера

**Решения:**

1. **Проверьте endpoint:**
   ```typescript
   // DevTools → Console
   analytics.init({ 
     endpoint: 'http://localhost:9001/track',
     debug: true  // Включите логи
   });
   ```

2. **Проверьте CORS:**
   - Убедитесь, что ваш origin в `CORS_ORIGINS` на сервере
   - Проверьте DevTools → Network → Headers

3. **Проверьте сервер:**
   ```bash
   curl http://localhost:9001/health
   ```

4. **Проверьте offline-буфер:**
   ```typescript
   // DevTools → Application → Local Storage
   // Ищите ключ: analytics_buffer
   ```

### Дубликаты событий

**Проблема:** События отправляются несколько раз

**Решение:**

- Убедитесь, что `analytics.init()` вызывается только один раз
- Проверьте, что не используете несколько экземпляров трекера

```typescript
// ❌ Плохо - создается новый экземпляр
import Analytics from './analytics';
const tracker = new Analytics();

// ✅ Хорошо - используйте singleton
import analytics from './analytics';
analytics.init({...});
```

### localStorage переполнен

**Проблема:** `QuotaExceededError` в offline-режиме

**Решение:**

- Уменьшите `batchSize` для более частой отправки
- Увеличьте `flushInterval` для реже отправки больших пакетов
- Реализуйте очистку старых событий:

```typescript
// В analytics.ts, метод addToBuffer:
if (this.buffer.length > 1000) { // Лимит
  this.buffer = this.buffer.slice(-500); // Оставить последние 500
}
```

### Сервер падает при большой нагрузке

**Проблема:** SQLite не справляется

**Решения:**

1. **Включите WAL-режим** (уже включено по умолчанию):
   ```javascript
   db.pragma('journal_mode = WAL');
   ```

2. **Батч-insert вместо транзакций:**
   ```javascript
   // Уже реализовано через db.transaction()
   ```

3. **Переключитесь на PostgreSQL** (для высоких нагрузок):
   - Замените `better-sqlite3` на `pg`
   - Адаптируйте SQL-запросы

### Не работает на iOS Safari

**Проблема:** `sendBeacon()` не поддерживается

**Решение:**

Трекер автоматически использует fallback на `fetch()`:

```typescript
// Уже реализовано в sendBatch()
if (navigator.sendBeacon) {
  // Попытка sendBeacon
} else {
  // Fallback на fetch
}
```

### Производительность страдает

**Проблема:** Трекер замедляет UI

**Решение:**

1. **Увеличьте `batchSize` и `flushInterval`:**
   ```typescript
   analytics.init({
     batchSize: 50,        // Больше событий в пакете
     flushInterval: 60000, // Реже отправка (1 мин)
   });
   ```

2. **Отключите trackPerformance в production:**
   ```typescript
   analytics.init({
     trackPerformance: false,
     trackErrors: true, // Оставьте только ошибки
   });
   ```

3. **Используйте debounce для частых событий:**
   ```typescript
   import { debounce } from 'lodash';
   
   const trackScroll = debounce(() => {
     analytics.track('scroll');
   }, 1000);
   
   window.addEventListener('scroll', trackScroll);
   ```

---

## Best Practices

### 1. Naming Conventions

Используйте понятные имена событий:

```typescript
// ✅ Хорошо
analytics.track('document.created', { type: 'receiving' });
analytics.track('scan.success', { method: 'keyboard' });
analytics.track('button.clicked', { button_id: 'save' });

// ❌ Плохо
analytics.track('evt1');
analytics.track('action');
```

**Рекомендуемая структура:** `<category>.<action>`

### 2. Properties

Добавляйте контекстные данные:

```typescript
// ✅ Хорошо - достаточно контекста
analytics.trackConfirm('complete_document', {
  document_type: 'receiving',
  document_id: 'RCV-001',
  lines_count: 15,
  lines_completed: 15,
  duration_seconds: 180,
});

// ❌ Плохо - нет контекста
analytics.trackConfirm('complete_document');
```

### 3. Privacy

**НЕ отправляйте персональные данные:**

```typescript
// ❌ НИКОГДА так не делайте
analytics.track('login', {
  email: 'user@example.com',  // ПД!
  password: '***',             // ПД!
  phone: '+7900...',           // ПД!
});

// ✅ Правильно - только анонимные ID
analytics.track('login', {
  user_role: 'worker',
  department: 'warehouse',
  auth_method: 'password',
});
```

### 4. Error Handling

Всегда добавляйте контекст к ошибкам:

```typescript
try {
  await loadDocument(id);
} catch (error) {
  analytics.trackError(error, {
    component: 'DocumentLoader',
    document_id: id,
    action: 'load',
    retry_count: retries,
  });
}
```

### 5. Production Config

Разные настройки для dev/production:

```typescript
const isProd = process.env.NODE_ENV === 'production';

analytics.init({
  endpoint: isProd 
    ? 'https://analytics.your-domain.com/track'
    : 'http://localhost:9001/track',
  batchSize: isProd ? 20 : 5,
  flushInterval: isProd ? 60000 : 10000,
  debug: !isProd,
  trackPerformance: isProd,
  trackErrors: true,
});
```

---

## Roadmap

Планируемые улучшения:

- [ ] Сжатие событий (gzip) перед отправкой
- [ ] Retry механизм с exponential backoff
- [ ] Sessionization (группировка событий в сессии)
- [ ] A/B testing support
- [ ] Feature flags integration
- [ ] Real-time dashboard (WebSocket)
- [ ] Automated reports (email/Telegram)

---

## Поддержка

**Вопросы и проблемы:**
- GitHub Issues: [github.com/cleverence/analytics](https://github.com/cleverence)
- Email: support@cleverence.com

**Документация:**
- `/DOCS/ANALYTICS.md` — это руководство
- `/DOCS/SYSTEM_FUNCTIONS_REFERENCE.md` — общее описание системы

---

**Дата последнего обновления:** 12 ноября 2025  
**Версия документации:** 1.0.0


