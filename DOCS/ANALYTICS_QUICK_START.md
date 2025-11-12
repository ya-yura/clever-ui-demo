# 🚀 Analytics - Quick Start Guide

**5 минут от установки до первого события**

---

## Шаг 1: Запуск сервера (2 минуты)

```bash
# Перейти в папку сервера
cd server

# Установить зависимости
npm install

# Запустить
npm start
```

✅ Сервер запущен на **http://localhost:9001**

---

## Шаг 2: Инициализация в приложении (1 минута)

Откройте `src/main.tsx` и добавьте:

```typescript
import analytics from './analytics';

// Инициализация
analytics.init({
  endpoint: 'http://localhost:9001/track',
  debug: true, // Включите для отладки
});

// Первое событие
analytics.trackPageView();
```

✅ Трекер инициализирован

---

## Шаг 3: Отслеживание событий (2 минуты)

### В компоненте со сканером:

```typescript
import analytics from './analytics';

// Успешное сканирование
analytics.trackScanSuccess(barcode, 'keyboard');

// Ошибка
analytics.trackScanFail('Invalid barcode', 'keyboard');
```

### В компоненте документа:

```typescript
// Открытие документа
analytics.track('document.opened', {
  document_type: 'receiving',
  document_id: 'RCV-001',
});

// Завершение
analytics.track('document.completed', {
  document_type: 'receiving',
  document_id: 'RCV-001',
  lines_count: 15,
  duration_seconds: 180,
});
```

### При ошибках:

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

---

## Шаг 4: Проверка (1 минута)

Откройте браузер и перейдите на:

**http://localhost:9001/stats**

Вы увидите статистику:

```json
{
  "period": "7 days",
  "total_events": 15,
  "total_users": 1,
  "events": [
    { "event_name": "screen_view", "count": 5, "unique_users": 1 },
    { "event_name": "scan.success", "count": 8, "unique_users": 1 },
    { "event_name": "document.opened", "count": 2, "unique_users": 1 }
  ]
}
```

---

## Готово! 🎉

Теперь у вас работает:
- ✅ Клиентский трекер с offline-first
- ✅ Серверная часть с SQLite
- ✅ Автоматическая буферизация и отправка
- ✅ Анонимное отслеживание (UUID)

---

## Что дальше?

### Просмотр событий

```bash
# Последние события
curl http://localhost:9001/events?limit=20

# Список пользователей
curl http://localhost:9001/users

# Анализ воронки
curl "http://localhost:9001/funnel?events=screen_view,scan.attempt,scan.success"
```

### Запросы к базе

```bash
# Подключиться к SQLite
sqlite3 server/analytics.db

# Топ событий сегодня
SELECT event_name, COUNT(*) as count 
FROM events 
WHERE DATE(timestamp) = DATE('now')
GROUP BY event_name 
ORDER BY count DESC;
```

Больше запросов в `server/queries.sql`

### Экспорт данных

```bash
# CSV для Excel
curl http://localhost:9001/export?format=csv > events.csv

# JSON для анализа
curl http://localhost:9001/export?format=json > events.json
```

---

## Типичные события для ТСД

### Навигация
```typescript
analytics.trackPageView('Receiving Document');
```

### Сканирование
```typescript
analytics.trackScanAttempt('keyboard');
analytics.trackScanSuccess(barcode, 'keyboard', duration);
analytics.trackScanFail('Not found', 'keyboard');
```

### Документы
```typescript
analytics.track('document.opened', { document_type, document_id });
analytics.track('document.completed', { document_type, document_id });
```

### Действия
```typescript
analytics.trackConfirm('save_document', { document_id });
analytics.trackCancel('save_document', { reason: 'incomplete' });
```

### Ошибки
```typescript
analytics.trackError(error, { component, action });
```

### Производительность
```typescript
analytics.trackScreenLoadTime(screenName, startTime);
```

---

## Production Checklist

Перед деплоем:

```typescript
// src/main.tsx
analytics.init({
  endpoint: 'https://analytics.your-domain.com/track', // ✅ HTTPS
  batchSize: 20,          // ✅ Больше для production
  flushInterval: 60000,   // ✅ 1 минута
  debug: false,           // ✅ Выключить логи
  trackPerformance: true,
  trackErrors: true,
});
```

```bash
# server/.env
PORT=9001
CORS_ORIGINS=https://your-pwa-domain.com  # ✅ Только ваш домен
DB_PATH=/var/lib/analytics/analytics.db   # ✅ Persistent storage
```

---

## Поддержка

- 📖 Полная документация: `/DOCS/ANALYTICS.md`
- 🔍 Примеры использования: `/src/examples/analytics-usage.example.tsx`
- 🗃️ SQL-запросы: `/server/queries.sql`
- 📊 Типы событий: `/src/types/analytics.types.ts`

---

**Время на интеграцию:** ~5 минут  
**Зависимости клиента:** 0 (zero dependencies)  
**Размер клиента:** ~15 KB  
**Поддержка offline:** ✅ Да  
**Production-ready:** ✅ Да



