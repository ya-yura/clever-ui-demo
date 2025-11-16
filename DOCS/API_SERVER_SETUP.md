## Подключение к серверу Mobile SMARTS

> Этот документ описывает настройки соединения с сервером Cleverence Mobile SMARTS (Склад‑15) для клиентского PWA.

### 1. Базовый URL

- **DEV (Vite):** используем прокси `http://localhost:5174/MobileSMARTS/api/v1` (относительный путь `/MobileSMARTS/api/v1`).
- **PROD:** укажите полный URL сервера, например `https://ms-cloud.cleverence.ru/MobileSMARTS/api/v1`.

### 2. Настройка в приложении

1. Откройте страницу `/setup`.
2. Введите полный API URL (например, `http://localhost:9000/MobileSMARTS/api/v1`).
3. Нажмите «Проверить соединение».
4. При успешной проверке сохраните настройки – они будут использоваться `api.ts`, `documentCounter` и всеми сервисами.

### 3. Структура API

| Endpoint                         | Описание                               |
| -------------------------------- | --------------------------------------- |
| `/DocTypes`                      | Список типов документов                 |
| `/Docs/{DocType.uni}`            | Список документов выбранного типа       |
| `/Docs/{DocType.uni}/$count`     | Количество документов по типу           |
| `/Docs('{id}')?$expand=items`    | Документ с позициями                    |
| `/Products`, `/Cells`, `/Employees` | Справочники                           |

### 4. Требования к заголовкам

```http
Accept: application/json
Content-Type: application/json
```

Для `$count` допускается `text/plain`. В этом случае ответ – число (например, `57`).

### 5. Ошибки «Unexpected token '<'»

Если в консоли появляется `Unexpected token '<'`, значит приложение вместо JSON получает HTML (часто это страница ошибки). Проверьте:

1. Верно ли указан `baseURL`.
2. Запущен ли сервер по адресу `http://localhost:9000`.
3. Работает ли прокси `/MobileSMARTS` в Vite (см. `vite.config.ts`).

### 6. Настройка DocumentCounter

Сервис `documentCounter` использует запросы `GET /Docs/{DocType}` (те же, что и клиент), получает JSON и просто считает количество элементов в массиве `value`. Если сервер поддерживает `$count`, можно добавить параметр `$count=true`, но приложение автоматически справляется даже без него.

### 7. Тестирование соединения

```
curl http://localhost:9000/MobileSMARTS/api/v1/DocTypes
curl http://localhost:9000/MobileSMARTS/api/v1/Docs/PrihodNaSklad/$count
```

Убедитесь, что ответы приходят быстро и без авторизации (OData в DEV режиме допускает анонимный доступ).

---

**Напоминание:** храните конфигурацию в `/setup` – она автоматически подхватывается всеми сервисами.

