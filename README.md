# Clever UI Demo - "Склад-15"

**Версия: 2.0.0**

Современное PWA-приложение для складского учета с UX на основе паттернов коммуникации Джеки Рида.

## Особенности

### Применённые UX-паттерны

1. **Signal → Action → Feedback** - каждый экран чётко показывает что делать, где делать и что произошло
2. **Chunking** - информация разбита на управляемые блоки
3. **Progressive Disclosure** - показываем только необходимое
4. **Single Path Flow** - один очевидный путь без развилок
5. **Error-as-Guidance** - ошибки помогают, а не наказывают
6. **Contextual Hints** - подсказки в нужный момент
7. **Zero Cognitive Overload** - минимум когнитивной нагрузки

### Технологический стек

- **React 18** + **TypeScript**
- **Vite** - быстрая сборка
- **TailwindCSS** - утилитарные стили
- **Framer Motion** - анимации
- **Zustand** - управление состоянием
- **React Router** - маршрутизация
- **IndexedDB** (Dexie) - локальное хранилище
- **Workbox** - PWA и офлайн-режим

### Модули

- Приёмка товара
- Размещение в ячейки
- Подбор заказов
- Отгрузка
- Инвентаризация
- Возвраты

## Установка

```bash
npm install
```

## Запуск

### Режим разработки

```bash
npm run dev
```

Приложение откроется на `http://localhost:5173`

### Production сборка

```bash
npm run build
```

### Предпросмотр production сборки

```bash
npm run preview
```

## Структура проекта

```
src/
├── ui/                    # UI-компоненты по паттернам Джеки Рида
│   ├── ActionScreen.tsx   # Signal → Action → Feedback
│   ├── ChunkedList.tsx    # Группировка информации
│   ├── DocumentHeader.tsx # First Glance Understanding
│   ├── ErrorHint.tsx      # Error-as-Guidance
│   ├── MicroHint.tsx      # Контекстные подсказки
│   ├── ScannerScreen.tsx  # Универсальное сканирование
│   └── microcopy.ts       # Направляющий текст
├── hooks/                 # React хуки
│   ├── useUXTracking.ts   # Трекинг UX-метрик
│   ├── useModernDocument.ts # Работа с документами
│   └── useAutoNavigation.ts # Умная навигация
├── metrics/               # Система метрик
├── pages/                 # Страницы приложения
├── components/            # Общие компоненты
└── styles/               # Стили и токены
```

## UI Kit

Визуальный каталог всех компонентов доступен по адресу `/ui-kit`

## Демонстрация

Модернизированный модуль приёмки с применением всех паттернов: `/receiving-modern`

## Документация

- [UI Components](./src/ui/README.md) - полная документация компонентов
- [UX Redesign](./DOCS/UX_REDESIGN_COMPLETE.md) - описание внедрения паттернов
- [Developer Docs](./DOCS/developer/) - техническая документация

## Метрики UX

Приложение автоматически собирает UX-метрики:
- Время до первого действия
- Эффективность подсказок
- Паттерны ошибок
- Когнитивная нагрузка
- Общая эффективность работы

Просмотр метрик: DevTools → Application → IndexedDB → `metrics`

## PWA

Приложение работает как Progressive Web App:
- Установка на устройство
- Работа в офлайн-режиме
- Фоновая синхронизация
- Push-уведомления (опционально)

## Лицензия

MIT

## Автор

Ya-Yura

---

**Версия:** 2.0  
**Дата:** 2024
