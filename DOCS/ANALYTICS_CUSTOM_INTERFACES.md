# 📱 Аналитика кастомных интерфейсов

**Дата:** 12 ноября 2025  
**Версия:** 1.0.0

---

## 📋 Обзор

Система "Склад-15" поддерживает **два типа интерфейсов**:

1. **Стандартный** — встроенный интерфейс с фиксированными кнопками операций
2. **Кастомный** — динамически загружаемый интерфейс через QR-код конфигурации

Система аналитики автоматически определяет тип интерфейса и собирает специфичные данные для каждого.

---

## 🔍 Автоматическое определение интерфейса

### Как это работает

При каждом событии система автоматически добавляет в контекст:

```typescript
{
  context: {
    interfaceType: 'standard' | 'custom',
    interfaceConfigId?: 'config-id',
    interfaceConfigVersion?: '1.0.0'
  }
}
```

**Определение происходит так:**

1. Проверка наличия схемы в `localStorage` (`ui-schema-active` или `ui-schema-default`)
2. Если схема найдена → `interfaceType: 'custom'`
3. Извлечение `id` и `version` из схемы
4. Если схемы нет → `interfaceType: 'standard'`

---

## 📊 Специальные события для кастомных интерфейсов

### 1. Загрузка кастомного интерфейса

**Событие:** `custom_interface.loaded`

**Когда:** При загрузке схемы интерфейса (из QR-кода, localStorage или файла)

**Свойства:**
```typescript
{
  schema_id: string;           // ID конфигурации
  schema_version: string;      // Версия конфигурации
  buttons_count: number;       // Количество кнопок
  load_source: 'qr' | 'localStorage' | 'file'
}
```

**Пример:**
```json
{
  "event": "custom_interface.loaded",
  "properties": {
    "schema_id": "warehouse-a-v2",
    "schema_version": "2.1.0",
    "buttons_count": 8,
    "load_source": "qr"
  },
  "context": {
    "interfaceType": "custom",
    "interfaceConfigId": "warehouse-a-v2",
    "interfaceConfigVersion": "2.1.0"
  }
}
```

### 2. Клик по кастомной кнопке

**Событие:** `custom_interface.button_click`

**Когда:** При нажатии на любую кнопку в кастомном интерфейсе

**Свойства:**
```typescript
{
  button_label: string;        // Текст кнопки
  button_action: string;       // Действие (navigate, openDoc, etc.)
  button_params?: any;         // Параметры действия
  button_position?: {          // Позиция на сетке
    row: number;
    col: number;
  };
  button_color?: string;       // Цвет кнопки
}
```

**Пример:**
```json
{
  "event": "custom_interface.button_click",
  "properties": {
    "button_label": "Приёмка A",
    "button_action": "navigate",
    "button_params": { "path": "/docs/PrihodNaSklad" },
    "button_position": { "row": 0, "col": 0 },
    "button_color": "#DAA420"
  },
  "context": {
    "interfaceType": "custom",
    "interfaceConfigId": "warehouse-a-v2"
  }
}
```

### 3. Сканирование QR-кода конфигурации

**Событие:** `custom_interface.qr_scan`

**Когда:** При попытке загрузить интерфейс через QR-код

**Свойства:**
```typescript
{
  success: boolean;    // Успешно или нет
  error?: string;      // Текст ошибки (если failed)
}
```

**Примеры:**

```json
// Успешное сканирование
{
  "event": "custom_interface.qr_scan",
  "properties": {
    "success": true
  }
}

// Неудачное сканирование
{
  "event": "custom_interface.qr_scan",
  "properties": {
    "success": false,
    "error": "Invalid schema format"
  }
}
```

---

## 📈 SQL-запросы для анализа

### Использование интерфейсов (стандартный vs кастомный)

```sql
-- Распределение событий по типу интерфейса
SELECT 
  json_extract(context, '$.interfaceType') as interface_type,
  COUNT(*) as events,
  COUNT(DISTINCT user_id) as users,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM events), 2) as percentage
FROM events
WHERE context IS NOT NULL
GROUP BY interface_type
ORDER BY events DESC;
```

**Результат:**
| interface_type | events | users | percentage |
|----------------|--------|-------|------------|
| standard       | 8500   | 45    | 65.5       |
| custom         | 4500   | 25    | 34.5       |

---

### Популярные кастомные конфигурации

```sql
-- Какие конфигурации используются чаще всего
SELECT 
  json_extract(context, '$.interfaceConfigId') as config_id,
  json_extract(context, '$.interfaceConfigVersion') as config_version,
  COUNT(*) as events,
  COUNT(DISTINCT user_id) as users,
  MIN(timestamp) as first_used,
  MAX(timestamp) as last_used
FROM events
WHERE json_extract(context, '$.interfaceType') = 'custom'
  AND json_extract(context, '$.interfaceConfigId') IS NOT NULL
GROUP BY config_id, config_version
ORDER BY events DESC;
```

**Результат:**
| config_id | config_version | events | users | first_used | last_used |
|-----------|----------------|--------|-------|------------|-----------|
| warehouse-a-v2 | 2.1.0 | 3200 | 18 | 2025-11-01 | 2025-11-12 |
| warehouse-b-v1 | 1.5.0 | 900  | 6  | 2025-11-05 | 2025-11-12 |
| office-setup   | 1.0.0 | 400  | 1  | 2025-11-10 | 2025-11-12 |

---

### Популярность кнопок в кастомных интерфейсах

```sql
-- Какие кнопки нажимаются чаще всего
SELECT 
  json_extract(context, '$.interfaceConfigId') as config_id,
  json_extract(properties, '$.button_label') as button_label,
  json_extract(properties, '$.button_action') as button_action,
  COUNT(*) as clicks,
  COUNT(DISTINCT user_id) as users
FROM events
WHERE event_name = 'custom_interface.button_click'
GROUP BY config_id, button_label, button_action
ORDER BY clicks DESC
LIMIT 20;
```

**Результат:**
| config_id | button_label | button_action | clicks | users |
|-----------|--------------|---------------|--------|-------|
| warehouse-a-v2 | Приёмка A | navigate | 850 | 15 |
| warehouse-a-v2 | Подбор | navigate | 720 | 14 |
| warehouse-b-v1 | Инвентаризация | navigate | 340 | 5 |

---

### Позиции кнопок на сетке (тепловая карта)

```sql
-- Какие позиции на сетке нажимаются чаще
SELECT 
  json_extract(properties, '$.button_position.row') as row,
  json_extract(properties, '$.button_position.col') as col,
  COUNT(*) as clicks,
  GROUP_CONCAT(DISTINCT json_extract(properties, '$.button_label')) as labels
FROM events
WHERE event_name = 'custom_interface.button_click'
  AND json_extract(context, '$.interfaceConfigId') = 'warehouse-a-v2'
GROUP BY row, col
ORDER BY row, col;
```

**Результат (тепловая карта):**
| row | col | clicks | labels |
|-----|-----|--------|--------|
| 0   | 0   | 850    | Приёмка A |
| 0   | 1   | 720    | Подбор |
| 1   | 0   | 450    | Отгрузка |
| 1   | 1   | 380    | Инвентаризация |

---

### Загрузки конфигураций

```sql
-- Как часто загружаются новые конфигурации и откуда
SELECT 
  json_extract(properties, '$.schema_id') as schema_id,
  json_extract(properties, '$.load_source') as load_source,
  COUNT(*) as loads,
  COUNT(DISTINCT user_id) as users,
  DATE(timestamp) as date
FROM events
WHERE event_name = 'custom_interface.loaded'
GROUP BY schema_id, load_source, date
ORDER BY date DESC, loads DESC;
```

**Результат:**
| schema_id | load_source | loads | users | date |
|-----------|-------------|-------|-------|------|
| warehouse-a-v2 | qr | 15 | 15 | 2025-11-12 |
| warehouse-a-v2 | localStorage | 125 | 15 | 2025-11-12 |
| warehouse-b-v1 | qr | 5 | 5 | 2025-11-12 |

---

### Успешность сканирования QR-кодов

```sql
-- Сколько QR-кодов сканируется успешно
SELECT 
  json_extract(properties, '$.success') as success,
  json_extract(properties, '$.error') as error,
  COUNT(*) as scans,
  COUNT(DISTINCT user_id) as users
FROM events
WHERE event_name = 'custom_interface.qr_scan'
GROUP BY success, error
ORDER BY scans DESC;
```

**Результат:**
| success | error | scans | users |
|---------|-------|-------|-------|
| true    | null  | 45    | 25    |
| false   | Invalid schema | 8 | 6 |
| false   | Decompression error | 3 | 2 |

---

## 📊 Аналитические вопросы

### 1. Какой интерфейс эффективнее?

**Вопрос:** Пользователи стандартного или кастомного интерфейса быстрее выполняют операции?

**Запрос:**
```sql
SELECT 
  json_extract(context, '$.interfaceType') as interface_type,
  AVG(json_extract(properties, '$.duration_seconds')) as avg_duration_seconds,
  COUNT(*) as completed_docs
FROM events
WHERE event_name = 'document.completed'
GROUP BY interface_type;
```

---

### 2. Переход со стандартного на кастомный

**Вопрос:** Сколько пользователей перешли со стандартного интерфейса на кастомный?

**Запрос:**
```sql
SELECT 
  user_id,
  MIN(CASE WHEN json_extract(context, '$.interfaceType') = 'standard' THEN timestamp END) as first_standard,
  MIN(CASE WHEN json_extract(context, '$.interfaceType') = 'custom' THEN timestamp END) as first_custom
FROM events
GROUP BY user_id
HAVING first_standard IS NOT NULL AND first_custom IS NOT NULL
  AND first_custom > first_standard;
```

---

### 3. Какие кнопки не используются?

**Вопрос:** Есть ли кнопки в кастомном интерфейсе, на которые никто не нажимает?

**Запрос:**
```sql
-- Сначала получаем все кнопки из события loaded
WITH loaded_buttons AS (
  SELECT 
    json_extract(properties, '$.schema_id') as schema_id,
    json_extract(properties, '$.buttons_count') as total_buttons
  FROM events
  WHERE event_name = 'custom_interface.loaded'
  ORDER BY timestamp DESC
  LIMIT 1
),
clicked_buttons AS (
  SELECT 
    COUNT(DISTINCT json_extract(properties, '$.button_label')) as used_buttons
  FROM events
  WHERE event_name = 'custom_interface.button_click'
)
SELECT 
  l.total_buttons,
  c.used_buttons,
  l.total_buttons - c.used_buttons as unused_buttons
FROM loaded_buttons l, clicked_buttons c;
```

---

### 4. Ошибки при загрузке конфигураций

**Вопрос:** Какие ошибки чаще всего возникают при загрузке QR-кодов?

**Запрос:**
```sql
SELECT 
  json_extract(properties, '$.error') as error_message,
  COUNT(*) as occurrences,
  COUNT(DISTINCT user_id) as affected_users
FROM events
WHERE event_name = 'custom_interface.qr_scan'
  AND json_extract(properties, '$.success') = 'false'
GROUP BY error_message
ORDER BY occurrences DESC;
```

---

## 🎯 Рекомендации по анализу

### 1. Всегда фильтруйте по типу интерфейса

При анализе поведения пользователей учитывайте тип интерфейса:

```sql
WHERE json_extract(context, '$.interfaceType') = 'custom'
```

### 2. Группируйте по конфигурации

Разные конфигурации — разное поведение:

```sql
GROUP BY json_extract(context, '$.interfaceConfigId')
```

### 3. Сравнивайте версии конфигураций

Новые версии могут изменить UX:

```sql
GROUP BY 
  json_extract(context, '$.interfaceConfigId'),
  json_extract(context, '$.interfaceConfigVersion')
```

### 4. Анализируйте переходы

Смотрите, как пользователи переключаются между интерфейсами:

```sql
SELECT 
  user_id,
  event_name,
  json_extract(context, '$.interfaceType') as interface_type,
  timestamp
FROM events
WHERE user_id = 'specific-user-id'
ORDER BY timestamp;
```

---

## 💡 Типичные инсайты

### Инсайт 1: Адаптация к кастомному интерфейсу

**Наблюдение:** Пользователи, перешедшие на кастомный интерфейс, первые 2 дня работают медленнее, потом — быстрее стандартного.

**Вывод:** Кастомный интерфейс эффективнее после периода адаптации.

---

### Инсайт 2: Позиция кнопок важна

**Наблюдение:** Кнопки в левом верхнем углу (row: 0, col: 0) нажимаются на 40% чаще.

**Вывод:** Размещайте самые важные операции в верхнем левом углу.

---

### Инсайт 3: Сложность конфигурации

**Наблюдение:** Конфигурации с >10 кнопками имеют на 25% больше ошибок сканирования.

**Вывод:** Упрощайте интерфейс, не перегружайте кнопками.

---

### Инсайт 4: QR-коды vs localStorage

**Наблюдение:** 80% загрузок после первой — из localStorage, только 20% — повторное сканирование QR.

**Вывод:** Пользователи редко меняют конфигурацию, сохраняйте в localStorage.

---

## 🔗 Интеграция с другими данными

### Связь с документами

```sql
-- Какие типы документов открываются из кастомного интерфейса
SELECT 
  json_extract(e1.context, '$.interfaceConfigId') as config_id,
  json_extract(e2.properties, '$.document_type') as doc_type,
  COUNT(*) as opens
FROM events e1
JOIN events e2 ON e2.user_id = e1.user_id 
  AND e2.timestamp > e1.timestamp
  AND e2.timestamp < datetime(e1.timestamp, '+5 seconds')
WHERE e1.event_name = 'custom_interface.button_click'
  AND e2.event_name = 'document.opened'
GROUP BY config_id, doc_type
ORDER BY opens DESC;
```

---

## 📖 См. также

- **[ANALYTICS.md](ANALYTICS.md)** — Полная документация по аналитике
- **[ANALYTICS_QUICK_START.md](ANALYTICS_QUICK_START.md)** — Быстрый старт
- **[server/queries.sql](../server/queries.sql)** — Готовые SQL-запросы

---

**Версия:** 1.0.0  
**Дата:** 12 ноября 2025  
**Статус:** ✅ Актуально


