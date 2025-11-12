# 🔒 Константы маршрутов операций

**Статус:** ✅ FROZEN (Зафиксировано)  
**Дата фиксации:** 12 ноября 2025  
**Версия:** 1.0.0  
**Файл:** `src/config/routes.ts`

---

## ⚠️ КРИТИЧЕСКОЕ ПРЕДУПРЕЖДЕНИЕ

**НЕ ИЗМЕНЯТЬ ЗНАЧЕНИЯ КОНСТАНТ В `src/config/routes.ts`!**

Эти константы используются в **нескольких программах** для привязки к кнопкам операций.  
Изменение этих значений **НАРУШИТ РАБОТУ ИНТЕГРАЦИИ** между системами!

---

## 📋 Список операций и их маршрутов

### Основные операции (кнопки главного экрана)

| Операция | Константа | Маршрут | Описание |
|----------|-----------|---------|----------|
| **Приход на склад** | `OPERATION_ROUTES.RECEIVING` | `/docs/PrihodNaSklad` | Приём товаров от поставщиков |
| **Подбор заказа** | `OPERATION_ROUTES.PICKING` | `/docs/PodborZakaza` | Комплектация заказа по маршруту |
| **Отгрузка** | `OPERATION_ROUTES.SHIPMENT` | `/docs/Otgruzka` | Оформление отгрузки клиенту |
| **Инвентаризация** | `OPERATION_ROUTES.INVENTORY` | `/docs/Inventarizaciya` | Пересчет остатков |
| **Размещение** | `OPERATION_ROUTES.PLACEMENT` | `/docs/RazmeshhenieVYachejki` | Размещение по ячейкам |
| **Возврат** | `OPERATION_ROUTES.RETURN` | `/docs/Vozvrat` | Возврат/списание товара |
| **Перемещение** | `OPERATION_ROUTES.MOVEMENT` | `/docs/Peremeshenie` | Перемещение между ячейками |
| **Маркировка** | `OPERATION_ROUTES.LABELING` | `/docs/Markirovka` | Печать этикеток |

### Системные маршруты

| Страница | Константа | Маршрут |
|----------|-----------|---------|
| Главная | `SYSTEM_ROUTES.HOME` | `/` |
| Все документы | `SYSTEM_ROUTES.DOCUMENTS` | `/documents` |
| Напарник | `SYSTEM_ROUTES.PARTNER` | `/partner` |
| Настройки | `SYSTEM_ROUTES.SETTINGS` | `/settings` |
| Статистика | `SYSTEM_ROUTES.STATISTICS` | `/statistics` |
| Диагностика | `SYSTEM_ROUTES.DIAGNOSTICS` | `/diagnostics` |
| О программе | `SYSTEM_ROUTES.ABOUT` | `/about` |
| Обратная связь | `SYSTEM_ROUTES.FEEDBACK` | `/feedback` |

### Публичные маршруты (без авторизации)

| Страница | Константа | Маршрут |
|----------|-----------|---------|
| Настройка | `PUBLIC_ROUTES.SETUP` | `/setup` |
| Вход | `PUBLIC_ROUTES.LOGIN` | `/login` |

---

## 💻 Использование в коде

### 1. Импорт констант

```typescript
// Импорт всех маршрутов
import { OPERATION_ROUTES, SYSTEM_ROUTES, PUBLIC_ROUTES } from '@/config/routes';

// Импорт вспомогательных функций
import { getDocTypeRoute, getDocumentRoute, isOperationRoute } from '@/config/routes';

// Импорт типов
import type { OperationRoute, SystemRoute, AppRoute } from '@/config/routes';
```

### 2. Навигация к операциям

```typescript
import { useNavigate } from 'react-router-dom';
import { OPERATION_ROUTES } from '@/config/routes';

function HomePage() {
  const navigate = useNavigate();
  
  const handleReceivingClick = () => {
    navigate(OPERATION_ROUTES.RECEIVING); // '/docs/PrihodNaSklad'
  };
  
  return (
    <button onClick={handleReceivingClick}>
      Приход на склад
    </button>
  );
}
```

### 3. Привязка к кнопкам (массив)

```typescript
import { OPERATION_ROUTES } from '@/config/routes';

const operationButtons = [
  {
    label: 'Приход',
    route: OPERATION_ROUTES.RECEIVING,
    icon: '📦',
    color: '#DAA420'
  },
  {
    label: 'Подбор',
    route: OPERATION_ROUTES.PICKING,
    icon: '🚚',
    color: '#FEA079'
  },
  {
    label: 'Отгрузка',
    route: OPERATION_ROUTES.SHIPMENT,
    icon: '📄',
    color: '#F3A361'
  },
  // и т.д.
];

// Использование
operationButtons.forEach(btn => {
  console.log(`${btn.label}: ${btn.route}`);
});
```

### 4. Динамические маршруты

```typescript
import { getDocTypeRoute, getDocumentRoute } from '@/config/routes';

// Маршрут к списку документов типа
const route = getDocTypeRoute('CustomDocType');
// => '/docs/CustomDocType'

// Маршрут к конкретному документу
const detailRoute = getDocumentRoute('PrihodNaSklad', 'DOC-12345');
// => '/docs/PrihodNaSklad/DOC-12345'

// Использование в навигации
navigate(route);
```

### 5. Проверка типа маршрута

```typescript
import { isOperationRoute, getOperationNameByRoute } from '@/config/routes';

const currentRoute = window.location.pathname;

if (isOperationRoute(currentRoute)) {
  console.log('Это маршрут операции');
  
  const operationName = getOperationNameByRoute(currentRoute);
  console.log('Название операции:', operationName);
  // => 'RECEIVING', 'PICKING', 'SHIPMENT', etc.
}
```

### 6. TypeScript типизация

```typescript
import type { OperationRoute, SystemRoute, AppRoute } from '@/config/routes';

// Типизация параметров функций
function navigateToOperation(route: OperationRoute) {
  navigate(route);
}

// Валидация только операционных маршрутов
navigateToOperation(OPERATION_ROUTES.RECEIVING); // ✅ OK
navigateToOperation(SYSTEM_ROUTES.SETTINGS);     // ❌ TypeScript error

// Любой маршрут
function navigateToAny(route: AppRoute) {
  navigate(route);
}

navigateToAny(OPERATION_ROUTES.RECEIVING); // ✅ OK
navigateToAny(SYSTEM_ROUTES.SETTINGS);     // ✅ OK
```

---

## 🔗 Интеграция в другие программы

### Сценарий 1: Внешняя программа создает интерфейс

```typescript
// external-app/src/interface-builder.ts
import { OPERATION_ROUTES } from 'proto-3/src/config/routes';

// Создание кнопок на основе констант
const buttons = [
  {
    id: 'btn-receiving',
    label: 'Приход',
    url: OPERATION_ROUTES.RECEIVING,
    action: () => window.location.href = OPERATION_ROUTES.RECEIVING
  },
  {
    id: 'btn-picking',
    label: 'Подбор',
    url: OPERATION_ROUTES.PICKING,
    action: () => window.location.href = OPERATION_ROUTES.PICKING
  },
  // ...
];

// Рендеринг кнопок
buttons.forEach(btn => {
  const element = document.createElement('button');
  element.textContent = btn.label;
  element.onclick = btn.action;
  document.body.appendChild(element);
});
```

### Сценарий 2: API endpoint для получения маршрутов

```typescript
// server/api/routes-config.ts
import { OPERATION_ROUTES, SYSTEM_ROUTES } from '../src/config/routes';

// Endpoint для получения конфигурации маршрутов
app.get('/api/config/routes', (req, res) => {
  res.json({
    version: '1.0.0',
    frozen: true,
    operations: OPERATION_ROUTES,
    system: SYSTEM_ROUTES,
  });
});

// Внешняя программа получает маршруты по API
fetch('http://localhost:5173/api/config/routes')
  .then(r => r.json())
  .then(config => {
    console.log('Маршрут приёмки:', config.operations.RECEIVING);
    // Использование полученных маршрутов
  });
```

### Сценарий 3: JSON-конфигурация для других языков

```json
{
  "version": "1.0.0",
  "frozen": true,
  "operations": {
    "RECEIVING": "/docs/PrihodNaSklad",
    "PICKING": "/docs/PodborZakaza",
    "SHIPMENT": "/docs/Otgruzka",
    "INVENTORY": "/docs/Inventarizaciya",
    "PLACEMENT": "/docs/RazmeshhenieVYachejki",
    "RETURN": "/docs/Vozvrat",
    "MOVEMENT": "/docs/Peremeshenie",
    "LABELING": "/docs/Markirovka"
  }
}
```

```python
# external-app/config.py
import json

# Загрузка конфигурации маршрутов
with open('routes-config.json') as f:
    ROUTES = json.load(f)

# Использование
receiving_url = ROUTES['operations']['RECEIVING']
print(f'Маршрут приёмки: {receiving_url}')
```

---

## 📝 Правила работы с константами

### ✅ РАЗРЕШЕНО

1. **Читать константы** для использования в навигации
2. **Использовать вспомогательные функции** (getDocTypeRoute, getDocumentRoute)
3. **Импортировать в другие модули** и программы
4. **Создавать алиасы** для удобства (но не менять значения!)
5. **Добавлять новые категории** маршрутов (если необходимо)

### ❌ ЗАПРЕЩЕНО

1. **Изменять значения** существующих констант (RECEIVING, PICKING, etc.)
2. **Удалять существующие** константы
3. **Переименовывать ключи** (RECEIVING → RECEPTION)
4. **Менять формат** маршрутов (`/docs/` → `/documents/`)
5. **Создавать дубликаты** с другими значениями

---

## 🔄 Процедура изменения (если критически необходимо)

Если по какой-то причине необходимо изменить маршруты:

### Шаг 1: Создайте новую версию
```typescript
// src/config/routes.v2.ts
export const OPERATION_ROUTES_V2 = {
  RECEIVING: '/documents/receiving', // Новый формат
  // ...
};
```

### Шаг 2: Сохраните старую версию
```typescript
// src/config/routes.ts остается без изменений
export const OPERATION_ROUTES = {
  RECEIVING: '/docs/PrihodNaSklad', // Старый формат
  // ...
};
```

### Шаг 3: Миграция
```typescript
// src/config/route-migration.ts
export function migrateRoute(oldRoute: string): string {
  const migrations: Record<string, string> = {
    '/docs/PrihodNaSklad': '/documents/receiving',
    // ...
  };
  return migrations[oldRoute] || oldRoute;
}
```

### Шаг 4: Обновление всех интегрированных систем
- Обновите proto-3
- Обновите все внешние программы
- Тестирование
- Постепенный rollout

### Шаг 5: Удаление старой версии (через 6+ месяцев)

---

## 📊 Контрольная таблица интеграций

| Система | Версия констант | Дата обновления | Статус |
|---------|----------------|-----------------|--------|
| proto-3 (основное PWA) | 1.0.0 | 12.11.2025 | ✅ Активно |
| Внешняя программа А | - | - | ⏳ Планируется |
| Внешняя программа Б | - | - | ⏳ Планируется |

**Обновите эту таблицу при интеграции новых систем!**

---

## 🆘 Troubleshooting

### Проблема: Маршрут не работает после импорта

**Решение:**
```typescript
// ❌ Плохо - относительный путь может не работать
import { OPERATION_ROUTES } from '../config/routes';

// ✅ Хорошо - используйте алиас @
import { OPERATION_ROUTES } from '@/config/routes';
```

### Проблема: TypeScript ошибка "Cannot find module"

**Решение:**
Убедитесь, что в `tsconfig.json` настроены пути:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Проблема: Нужен новый тип операции

**Решение:**
```typescript
// НЕ добавляйте в OPERATION_ROUTES напрямую!
// Используйте динамический маршрут:
const customRoute = getDocTypeRoute('NewOperationType');
// => '/docs/NewOperationType'
```

---

## 📞 Контакты

**Вопросы по константам маршрутов:**
- Документация: `DOCS/ROUTES_CONSTANTS.md` (этот файл)
- Файл констант: `src/config/routes.ts`
- Обновления: См. changelog в `src/config/routes.ts`

**Изменения требуют согласования!**

---

**Версия документации:** 1.0.0  
**Дата последнего обновления:** 12 ноября 2025  
**Статус:** 🔒 FROZEN - Не изменять без согласования



