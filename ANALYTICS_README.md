# 📊 Analytics System - README

**Минималистичная система аналитики для PWA-приложения Склад-15**

---

## 🎯 Что это?

Production-ready трекер поведения пользователей с offline-first архитектурой, разработанный специально для ТСД (терминалов сбора данных) на Android.

**Ключевые особенности:**
- ✅ Offline-First (буферизация в localStorage)
- ✅ Zero Dependencies (клиент)
- ✅ Анонимность (UUID без ПД)
- ✅ Минимальное влияние на UI
- ✅ Production-Ready из коробки

---

## 📦 Что включено?

### Клиентская часть
- `src/analytics.ts` — основной трекер (15 KB)
- `src/types/analytics.types.ts` — TypeScript типы
- `src/examples/analytics-usage.example.tsx` — примеры интеграции

### Серверная часть
- `server/track-server.js` — Express + SQLite сервер
- `server/package.json` — зависимости
- `server/queries.sql` — готовые SQL-запросы для анализа
- `server/README.md` — документация сервера

### Документация
- `DOCS/ANALYTICS.md` — **полное руководство** (главное!)
- `DOCS/ANALYTICS_QUICK_START.md` — быстрый старт (5 минут)
- `DOCS/ANALYTICS_INTEGRATION.md` — интеграция в существующий проект

---

## 🚀 Быстрый старт

### 1. Запустить сервер (2 минуты)

```bash
cd server
npm install
npm start
```

Сервер запустится на **http://localhost:9001**

### 2. Инициализировать в приложении (1 минута)

```typescript
// src/main.tsx
import analytics from './analytics';

analytics.init({
  endpoint: 'http://localhost:9001/track',
  debug: true,
});

analytics.trackPageView();
```

### 3. Отслеживать события (2 минуты)

```typescript
// Сканирование
analytics.trackScanSuccess(barcode, 'keyboard');

// Документы
analytics.track('document.completed', {
  document_type: 'receiving',
  document_id: 'RCV-001',
  lines_count: 15,
});

// Ошибки
analytics.trackError(error, { component: 'Receiving' });
```

### 4. Проверить (1 минута)

Откройте: **http://localhost:9001/stats**

```json
{
  "total_events": 15,
  "total_users": 1,
  "events": [
    { "event_name": "screen_view", "count": 5 },
    { "event_name": "scan.success", "count": 8 }
  ]
}
```

---

## 📊 Что отслеживается?

| Категория | События | Примеры |
|-----------|---------|---------|
| **Навигация** | `screen_view`, `page_load` | Просмотр экранов, переходы |
| **Сканирование** | `scan.attempt`, `scan.success`, `scan.fail` | Все операции со сканером |
| **Документы** | `document.opened`, `document.completed` | Жизненный цикл документов |
| **Действия** | `confirm`, `cancel`, `button.click` | Действия пользователя |
| **Ошибки** | `error` | Все исключения и ошибки |
| **Производительность** | `screen.load_time`, `timing` | Замеры времени |
| **Синхронизация** | `sync.started`, `sync.completed` | Offline-sync события |

---

## 📈 Анализ данных

### API Endpoints

```bash
# Статистика за 7 дней
GET http://localhost:9001/stats?days=7

# Последние 100 событий
GET http://localhost:9001/events?limit=100

# Список пользователей
GET http://localhost:9001/users

# Воронка конверсии
GET http://localhost:9001/funnel?events=screen_view,scan.attempt,scan.success

# Экспорт в CSV
GET http://localhost:9001/export?format=csv
```

### SQL-запросы

```bash
# Подключиться к базе
sqlite3 server/analytics.db

# Топ событий сегодня
SELECT event_name, COUNT(*) as count 
FROM events 
WHERE DATE(timestamp) = DATE('now')
GROUP BY event_name 
ORDER BY count DESC;
```

**Больше запросов в `server/queries.sql`**

---

## 🔧 Техническая информация

### Архитектура клиента

```typescript
analytics.init() 
  → События → localStorage buffer
  → Батчинг (10 событий или 30 сек)
  → sendBeacon() / fetch({ keepalive: true })
  → Сервер
```

**Особенности:**
- Автоматическая буферизация в offline
- Отправка при восстановлении сети
- Нет блокировки UI
- Работает при закрытии вкладки

### Архитектура сервера

```
POST /track 
  → Валидация
  → SQLite (WAL mode)
  → Индексы (event_name, user_id, timestamp)
  → Response 200 OK
```

**Особенности:**
- SQLite с WAL-режимом (concurrent access)
- Автоматические индексы
- Fallback на JSONL (если SQLite падает)
- CORS для PWA

---

## 📖 Полная документация

| Файл | Описание | Время чтения |
|------|----------|--------------|
| **[ANALYTICS.md](DOCS/ANALYTICS.md)** | Полное руководство | 30 мин |
| **[ANALYTICS_QUICK_START.md](DOCS/ANALYTICS_QUICK_START.md)** | Быстрый старт | 5 мин |
| **[ANALYTICS_INTEGRATION.md](DOCS/ANALYTICS_INTEGRATION.md)** | Интеграция в проект | 15 мин |

**Также читайте:**
- `server/README.md` — документация сервера
- `server/queries.sql` — готовые SQL-запросы
- `src/examples/analytics-usage.example.tsx` — примеры кода

---

## 🎯 Примеры использования

### React Router integration

```typescript
function App() {
  const location = useLocation();
  
  useEffect(() => {
    analytics.trackPageView();
  }, [location.pathname]);
  
  return <Router>{/* routes */}</Router>;
}
```

### Scanner integration

```typescript
const handleScan = (barcode: string) => {
  analytics.trackScanAttempt('keyboard');
  
  try {
    const product = findProduct(barcode);
    analytics.trackScanSuccess(barcode, 'keyboard', duration);
  } catch (error) {
    analytics.trackScanFail(error.message, 'keyboard');
  }
};
```

### Error Boundary

```typescript
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    analytics.trackError(error, {
      component: errorInfo.componentStack,
    });
  }
}
```

**Больше примеров в `src/examples/analytics-usage.example.tsx`**

---

## 🔐 Privacy & Security

### Что НЕ отслеживается

❌ Email, телефоны, имена  
❌ Пароли, токены  
❌ Персональные данные

### Что отслеживается

✅ Анонимный UUID (генерируется локально)  
✅ Тип устройства (из user-agent)  
✅ Тип события и контекст  
✅ Производительность  

**GDPR/Privacy-friendly** — никаких личных данных.

---

## 📊 Production Checklist

Перед деплоем:

- [ ] Изменить `endpoint` на production URL
- [ ] Отключить `debug: false`
- [ ] Настроить CORS только на ваш домен
- [ ] Использовать HTTPS для сервера
- [ ] Настроить backup базы данных
- [ ] Добавить мониторинг диска (SQLite растет)
- [ ] Опционально: rate limiting
- [ ] Опционально: authentication (API keys)

---

## 🆘 Поддержка

**Документация:**
- 📖 Главная: `DOCS/ANALYTICS.md`
- 🚀 Быстрый старт: `DOCS/ANALYTICS_QUICK_START.md`
- 🔌 Интеграция: `DOCS/ANALYTICS_INTEGRATION.md`

**Проблемы:**
- События не отправляются? → Проверьте CORS и endpoint
- Ошибки SQLite? → Включите `JSONL_FALLBACK=true`
- localStorage переполнен? → Уменьшите `batchSize`

**Файлы:**
- Клиент: `src/analytics.ts`
- Сервер: `server/track-server.js`
- SQL: `server/queries.sql`
- Примеры: `src/examples/analytics-usage.example.tsx`

---

## 📦 Размеры

| Компонент | Размер | Зависимости |
|-----------|--------|-------------|
| Клиент | ~15 KB | 0 |
| Сервер | ~8 KB | 3 (express, better-sqlite3, cors) |
| База данных | ~50 KB (пустая) | SQLite |

**Влияние на производительность:** ~0.5ms на событие (незаметно для UI)

---

## 🎉 Готово!

Система аналитики готова к использованию. Начните с:

1. **[DOCS/ANALYTICS_QUICK_START.md](DOCS/ANALYTICS_QUICK_START.md)** — 5 минут до первого события
2. **[DOCS/ANALYTICS.md](DOCS/ANALYTICS.md)** — полное руководство
3. **[DOCS/ANALYTICS_INTEGRATION.md](DOCS/ANALYTICS_INTEGRATION.md)** — интеграция в проект

---

**Версия:** 1.0.0  
**Дата:** 12 ноября 2025  
**Проект:** Cleverence Склад-15  
**Лицензия:** MIT



