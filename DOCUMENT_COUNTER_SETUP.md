# Настройка подсчёта документов

## Обзор

Система автоматически отображает количество документов в правом нижнем углу каждой кнопки интерфейса. Данные загружаются из функциональной программы Cleverence через API.

## Как это работает

1. **Автоматическая загрузка**: При открытии интерфейса система загружает количество документов для каждой операции
2. **Кеширование**: Данные кешируются на 5 минут для снижения нагрузки на API
3. **Автообновление**: Количество документов обновляется каждую минуту
4. **Оффлайн режим**: При отсутствии связи используются данные из localStorage

## Настройка API

### 1. Укажите URL API

В файле `src/services/documentCounter.ts` измените `apiBaseUrl`:

```typescript
export class DocumentCounterService {
  private static apiBaseUrl = 'http://your-server.com/api'; // Ваш URL
  // ...
}
```

### 2. Реализуйте эндпоинты на сервере

Каждый эндпоинт должен возвращать количество документов для соответствующей операции:

#### Требуемые эндпоинты:

```
GET /api/docs/PrihodNaSklad/count       - Приход на склад
GET /api/docs/PodborZakaza/count        - Подбор заказа
GET /api/docs/Otgruzka/count            - Отгрузка
GET /api/docs/Inventarizaciya/count     - Инвентаризация
GET /api/docs/RazmeshhenieVYachejki/count - Размещение
GET /api/docs/Vozvrat/count             - Возврат
GET /api/docs/Peremeshenie/count        - Перемещение
GET /api/docs/Markirovka/count          - Маркировка
```

#### Формат ответа:

```json
{
  "count": 42,
  "lastUpdated": "2025-11-12T10:30:00Z"
}
```

### 3. Пример серверной реализации (Node.js/Express)

```typescript
// Пример для Node.js + Express
import express from 'express';

const app = express();

// Middleware для CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Эндпоинты для подсчёта документов
app.get('/api/docs/:docType/count', async (req, res) => {
  const { docType } = req.params;
  
  try {
    // Запрос к базе данных Cleverence
    const count = await getDocumentCount(docType);
    
    res.json({
      count,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Failed to get count for ${docType}:`, error);
    res.status(500).json({ count: 0, error: 'Failed to fetch count' });
  }
});

// Функция для получения количества из БД
async function getDocumentCount(docType: string): Promise<number> {
  // ВАРИАНТ 1: Запрос к SQL базе данных Cleverence
  const query = `
    SELECT COUNT(*) as count 
    FROM Documents 
    WHERE Type = ? AND Status = 'Active'
  `;
  const result = await database.execute(query, [docType]);
  return result[0].count;
  
  // ВАРИАНТ 2: Через API Cleverence (если есть)
  // const response = await fetch(`http://cleverence-server/api/documents/${docType}/count`);
  // const data = await response.json();
  // return data.count;
}

app.listen(3000, () => {
  console.log('Document counter API running on port 3000');
});
```

## Настройка интервала обновления

По умолчанию данные обновляются каждую минуту. Чтобы изменить интервал:

В `src/components/DynamicGridInterface.tsx` измените значение:

```typescript
// Обновлять каждые 30 секунд
documentCounter.startAutoUpdate(actions, 30000);

// Обновлять каждые 5 минут
documentCounter.startAutoUpdate(actions, 300000);
```

## Отладка

### Включить логирование

В консоли браузера вы увидите:

```
✅ Loaded counts: Map { 'RECEIVING' => 42, 'ORDER_PICKING' => 15, ... }
```

### Проверить запросы

Откройте DevTools → Network и найдите запросы к `/api/docs/.../count`

### Проверить кеш

```javascript
// В консоли браузера
Object.keys(localStorage)
  .filter(key => key.startsWith('doc-count-'))
  .forEach(key => {
    console.log(key, localStorage.getItem(key));
  });
```

## Интеграция с существующей системой Cleverence

### Вариант 1: Прямой доступ к БД

Если у вас есть доступ к базе данных Cleverence:

```sql
-- Пример SQL запроса для получения количества
SELECT COUNT(*) 
FROM [dbo].[Documents] 
WHERE [DocumentType] = 'PrihodNaSklad' 
  AND [Status] IN ('New', 'InProgress')
```

### Вариант 2: Через существующий API

Если Cleverence предоставляет API:

```typescript
async function fetchFromCleverence(docType: string): Promise<number> {
  const response = await fetch(
    `http://cleverence-server/api/v1/documents/count`, 
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLEVERENCE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: docType,
        status: ['New', 'InProgress']
      })
    }
  );
  
  const data = await response.json();
  return data.totalCount;
}
```

### Вариант 3: Webhook от Cleverence

Настройте Cleverence на отправку обновлений:

```typescript
// Сервер принимает webhook от Cleverence
app.post('/webhook/document-updated', (req, res) => {
  const { docType, count } = req.body;
  
  // Обновляем кеш
  cache.set(docType, count);
  
  res.json({ success: true });
});
```

## Безопасность

### CORS

Убедитесь, что API разрешает запросы от вашего домена:

```typescript
app.use(cors({
  origin: 'https://your-warehouse-app.com',
  methods: ['GET']
}));
```

### Аутентификация

Добавьте токен авторизации:

```typescript
// В documentCounter.ts
private async fetchCount(action: ButtonAction): Promise<number> {
  const response = await fetch(`${DocumentCounterService.apiBaseUrl}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`, // Добавьте токен
    },
  });
  // ...
}
```

## Производительность

### Оптимизация запросов

1. **Батчинг**: Запрашивайте все счётчики одним запросом:

```typescript
// Вместо 8 запросов - один
GET /api/docs/counts?types=PrihodNaSklad,PodborZakaza,...

// Ответ:
{
  "counts": {
    "PrihodNaSklad": 42,
    "PodborZakaza": 15,
    ...
  }
}
```

2. **Кеширование на сервере**: Используйте Redis для кеширования:

```typescript
// На сервере
const cachedCount = await redis.get(`doc-count:${docType}`);
if (cachedCount) {
  return parseInt(cachedCount);
}

const count = await database.getCount(docType);
await redis.setex(`doc-count:${docType}`, 300, count); // 5 минут
return count;
```

## Troubleshooting

### Проблема: Количество не обновляется

**Решение:**
1. Проверьте консоль на ошибки API
2. Убедитесь, что `apiBaseUrl` правильный
3. Проверьте CORS настройки на сервере

### Проблема: Показывает 0 вместо реальных данных

**Решение:**
1. Проверьте формат ответа API (должен быть `{ count: number }`)
2. Убедитесь, что эндпоинты возвращают 200 OK
3. Проверьте логи сервера

### Проблема: Слишком много запросов к API

**Решение:**
1. Увеличьте интервал автообновления
2. Увеличьте время кеширования (в `isCacheValid`)
3. Используйте батчинг запросов

---

**Версия:** 1.0  
**Дата:** 12 ноября 2025

