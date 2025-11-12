# 🔒 Константы маршрутов операций

**Статус:** ✅ FROZEN (Зафиксировано с 12.11.2025)

---

## ⚠️ КРИТИЧЕСКОЕ ПРЕДУПРЕЖДЕНИЕ

**НЕ ИЗМЕНЯТЬ значения констант в `src/config/routes.ts`!**

Эти константы используются в **нескольких программах**.  
Изменение нарушит интеграцию!

---

## 📋 Основные маршруты операций

| Операция | Маршрут |
|----------|---------|
| Приход на склад | `/docs/PrihodNaSklad` |
| Подбор заказа | `/docs/PodborZakaza` |
| Отгрузка | `/docs/Otgruzka` |
| Инвентаризация | `/docs/Inventarizaciya` |
| Размещение | `/docs/RazmeshhenieVYachejki` |
| Возврат | `/docs/Vozvrat` |
| Перемещение | `/docs/Peremeshenie` |
| Маркировка | `/docs/Markirovka` |

---

## 📂 Файлы

### Для TypeScript/JavaScript
```typescript
// src/config/routes.ts
import { OPERATION_ROUTES } from '@/config/routes';
console.log(OPERATION_ROUTES.RECEIVING); // '/docs/PrihodNaSklad'
```

### Для других языков/программ
```bash
# JSON конфигурация
public/routes-config.json

# Доступно по URL
http://localhost:5173/routes-config.json
```

---

## 📖 Документация

- **Критическое предупреждение:** [DOCS/CRITICAL_FROZEN_ROUTES.md](DOCS/CRITICAL_FROZEN_ROUTES.md)
- **Полная документация:** [DOCS/ROUTES_CONSTANTS.md](DOCS/ROUTES_CONSTANTS.md)
- **Главный индекс:** [DOCS/INDEX.md](DOCS/INDEX.md)

---

## 💻 Использование

### В коде приложения
```typescript
import { OPERATION_ROUTES } from '@/config/routes';
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  return (
    <button onClick={() => navigate(OPERATION_ROUTES.RECEIVING)}>
      Приход на склад
    </button>
  );
}
```

### Из внешней программы (JavaScript)
```javascript
fetch('http://localhost:5173/routes-config.json')
  .then(r => r.json())
  .then(config => {
    const receivingRoute = config.operations.RECEIVING.route;
    window.location.href = receivingRoute; // '/docs/PrihodNaSklad'
  });
```

### Из внешней программы (Python)
```python
import json
import requests

# Загрузка конфигурации
response = requests.get('http://localhost:5173/routes-config.json')
routes = response.json()

# Использование
receiving_url = routes['operations']['RECEIVING']['route']
print(f'Маршрут приёмки: {receiving_url}')
```

---

## 🔐 Версия

- **Версия:** 1.0.0  
- **Дата фиксации:** 12 ноября 2025  
- **Статус:** 🔒 FROZEN  

---

## 🆘 Вопросы?

См. полную документацию: **[DOCS/ROUTES_CONSTANTS.md](DOCS/ROUTES_CONSTANTS.md)**



