# 🎨 UI Component Library — «Склад-15»

Библиотека UI-компонентов, основанная на паттернах коммуникации **Джеки Рида**.

---

## 📋 Оглавление

1. [Принципы дизайна](#принципы-дизайна)
2. [Система статусов](#система-статусов)
3. [Базовые компоненты](#базовые-компоненты)
4. [Составные компоненты](#составные-компоненты)
5. [Хуки и утилиты](#хуки-и-утилиты)
6. [Примеры использования](#примеры-использования)

---

## 🎯 Принципы дизайна

### 1. Signal → Action → Feedback

Каждый экран должен иметь:
- **Сигнал**: что нужно сделать сейчас
- **Действие**: явная зона взаимодействия
- **Обратная связь**: мгновенная реакция системы

### 2. Chunking (Группировка)

Информация разбивается на управляемые блоки:
- Списки документов → группы по статусу
- Позиции документа → группы по выполнению

### 3. Progressive Disclosure

Показываем только необходимое:
- Скрываем второстепенные элементы
- Раскрываем детали по требованию
- Минимизируем когнитивную нагрузку

### 4. Single Path Flow

Один очевидный путь для пользователя:
- Убираем развилки
- Автоматические переходы
- Фокус на текущей задаче

### 5. Error-as-Guidance

Ошибки помогают, а не наказывают:
- Ясное описание проблемы
- Направление к решению
- Мягкая обратная связь

---

## 🎨 Система статусов

### Цветовая кодировка

```typescript
import { statusColors, StatusType } from '@/ui';

const colors = statusColors.success;  // 🟢 Успешно
const colors = statusColors.error;    // 🔴 Ошибка
const colors = statusColors.warning;  // 🟡 Предупреждение
const colors = statusColors.pending;  // 🔵 Ожидает
const colors = statusColors.inProgress; // 🟣 В работе
const colors = statusColors.neutral;  // ⚪ Нейтральный
```

### Использование

```tsx
<div className={`${colors.bg} ${colors.border} border`}>
  <span className={colors.text}>Статус</span>
</div>
```

---

## 🧩 Базовые компоненты

### StatusIcon

Визуальный индикатор статуса.

```tsx
import { StatusIcon } from '@/ui';

<StatusIcon 
  status="success" 
  size="md" 
  showPulse={true} 
/>
```

**Пропсы:**
- `status`: StatusType — тип статуса
- `size`: 'sm' | 'md' | 'lg' — размер
- `showPulse`: boolean — анимация пульсации

---

### MicroHint

Контекстная подсказка для направления пользователя.

```tsx
import { MicroHint } from '@/ui';

<MicroHint
  message="Сканируйте следующий товар"
  status="pending"
  showIcon={true}
  duration={3000}
/>
```

**Пропсы:**
- `message`: string — текст подсказки
- `status`: StatusType — тип статуса
- `showIcon`: boolean — показывать иконку
- `duration`: number — длительность показа (мс)
- `persistent`: boolean — не скрывать автоматически

---

### ErrorHint

Ошибка как направляющая подсказка.

```tsx
import { ErrorHint } from '@/ui';

<ErrorHint
  error="Товар не найден в документе"
  guidance="Проверьте штрихкод и попробуйте снова"
  onDismiss={() => {}}
  vibrate={true}
/>
```

**Пропсы:**
- `error`: string — описание ошибки
- `guidance`: string — подсказка к решению
- `onDismiss`: () => void — обработчик закрытия
- `autoDismiss`: number — автоматическое закрытие (мс)
- `vibrate`: boolean — вибрация

---

### ProgressBar

Визуальный индикатор прогресса.

```tsx
import { ProgressBar } from '@/ui';

<ProgressBar
  current={7}
  total={10}
  showLabel={true}
  showPercentage={true}
  animated={true}
/>
```

**Пропсы:**
- `current`: number — текущее значение
- `total`: number — общее значение
- `showLabel`: boolean — показывать метку
- `showPercentage`: boolean — показывать проценты
- `height`: 'sm' | 'md' | 'lg' — высота
- `animated`: boolean — анимация

---

## 🏗️ Составные компоненты

### ActionScreen

Экран с паттерном Signal → Action → Feedback.

```tsx
import { ActionScreen } from '@/ui';

<ActionScreen
  signalText="Сканируйте товар"
  signalSubtext="Каждое сканирование добавляет +1"
  signalStatus="pending"
  actionLabel="Начать сканирование"
  onAction={async () => {
    // Выполнить действие
  }}
  feedbackMode="all"
  successMessage="Готово!"
>
  {/* Дополнительный контент */}
</ActionScreen>
```

---

### ScannerScreen

Универсальный экран сканирования.

```tsx
import { ScannerScreen, ScanResult } from '@/ui';

<ScannerScreen
  signalText="Сканируйте товар из документа"
  expectedType="Штрихкод товара"
  onScan={async (value: string): Promise<ScanResult> => {
    // Обработка сканирования
    return {
      success: true,
      message: 'Товар добавлен',
    };
  }}
  currentProgress={{ current: 5, total: 10 }}
  autoNavigateOnComplete={true}
  onComplete={() => navigate('/next')}
/>
```

**ScanResult:**
```typescript
interface ScanResult {
  success: boolean;
  message?: string;
  error?: string;
  guidance?: string;
  autoAdvance?: boolean;
}
```

---

### DocumentHeader

Заголовок документа с прогрессом.

```tsx
import { DocumentHeader } from '@/ui';

<DocumentHeader
  documentType="Приёмка"
  documentNumber="RCV-12345"
  completed={7}
  total={10}
  nextAction="Сканируйте следующий товар"
  date={new Date()}
  partner="Иван Иванов"
  onBack={() => navigate(-1)}
/>
```

---

### ChunkedList

Список с группировкой (Chunking).

```tsx
import { ChunkedList } from '@/ui';

<ChunkedList
  groups={[
    {
      title: 'Срочные',
      badge: 3,
      items: [
        { id: '1', content: <div>Item 1</div> },
        { id: '2', content: <div>Item 2</div> },
      ],
    },
  ]}
  onItemClick={(id) => console.log(id)}
/>
```

---

### DocumentChunkedList

Специализированный список документов.

```tsx
import { DocumentChunkedList } from '@/ui';

<DocumentChunkedList
  documents={[
    {
      id: 'DOC-1',
      number: 'RCV-12345',
      type: 'Приёмка',
      status: 'inProgress',
      date: new Date(),
      itemsCount: 10,
      completed: 7,
    },
  ]}
  onDocumentClick={(id) => navigate(`/doc/${id}`)}
/>
```

---

### ItemList

Список позиций с группировкой по статусу.

```tsx
import { ItemList } from '@/ui';

<ItemList
  items={[
    {
      id: '1',
      name: 'Товар 1',
      barcode: '1234567890',
      expected: 10,
      scanned: 7,
      cell: 'A-01',
    },
  ]}
  onItemClick={(id) => console.log(id)}
  onItemScan={(id) => handleScan(id)}
/>
```

---

## 🎣 Хуки и утилиты

### useUXTracking

Автоматический трекинг UX-метрик.

```tsx
import { useUXTracking } from '@/hooks/useUXTracking';

const ux = useUXTracking({
  userId: user.id,
  screen: 'receiving_document',
  operationType: 'receiving',
  documentId: docId,
});

// Трекинг событий
ux.trackEvent('scan_success');
ux.trackFirstScan();
ux.trackNavigation('/next', 'auto');
ux.trackHintShown('micro_hint', 'Сканируйте товар');
ux.trackError('product_not_found', true);
```

---

### useModernDocument

Универсальный хук для работы с документами.

```tsx
import { useModernDocument } from '@/hooks/useModernDocument';

const {
  document,
  lines,
  loading,
  handleScan,
  completeDocument,
  updateQuantity,
} = useModernDocument({
  docType: 'receiving',
  docId: id,
  onComplete: () => navigate('/next'),
});
```

---

### Microcopy

Готовые тексты для всех модулей.

```tsx
import { microcopy, getMicrocopy } from '@/ui/microcopy';

const hint = microcopy.receiving.scan; // "Сканируйте товар из документа"
const hint2 = getMicrocopy('receiving', 'almostDone', 3); // "Ещё 3 позиции"
```

---

## 📖 Примеры использования

### Создание страницы документа

```tsx
import {
  DocumentHeader,
  ScannerScreen,
  ItemList,
  MicroHintOverlay,
  ErrorHint,
} from '@/ui';
import { useModernDocument } from '@/hooks/useModernDocument';
import { microcopy } from '@/ui/microcopy';

export const MyDocumentPage = () => {
  const { id } = useParams();
  const { document, lines, handleScan } = useModernDocument({
    docType: 'receiving',
    docId: id,
  });

  return (
    <>
      <DocumentHeader
        documentType="Приёмка"
        documentNumber={document.id}
        completed={document.completedLines}
        total={document.totalLines}
        nextAction={microcopy.receiving.scan}
        onBack={() => navigate(-1)}
      />

      <ScannerScreen
        signalText={microcopy.receiving.scan}
        onScan={handleScan}
        currentProgress={{
          current: document.completedLines,
          total: document.totalLines,
        }}
      />

      <ItemList items={lines} />
    </>
  );
};
```

---

## 🎯 Лучшие практики

### 1. Всегда используйте систему статусов

❌ **Плохо:**
```tsx
<div className="bg-red-100 text-red-700">Ошибка</div>
```

✅ **Хорошо:**
```tsx
<div className={`${statusColors.error.bg} ${statusColors.error.text}`}>
  Ошибка
</div>
```

### 2. Предоставляйте контекстные подсказки

❌ **Плохо:**
```tsx
alert('Ошибка');
```

✅ **Хорошо:**
```tsx
<ErrorHint
  error="Товар не найден"
  guidance="Проверьте штрихкод и попробуйте снова"
/>
```

### 3. Трекайте UX-метрики

❌ **Плохо:**
```tsx
// Никакого трекинга
```

✅ **Хорошо:**
```tsx
const ux = useUXTracking({ ... });
ux.trackEvent('scan_success');
```

### 4. Используйте готовый микрокопирайтинг

❌ **Плохо:**
```tsx
<p>Scan item</p>
```

✅ **Хорошо:**
```tsx
<p>{microcopy.receiving.scan}</p>
```

---

## 🚀 Быстрый старт

1. Импортируйте компоненты:
```tsx
import { DocumentHeader, ScannerScreen, ItemList } from '@/ui';
```

2. Используйте хуки:
```tsx
const ux = useUXTracking({ ... });
const doc = useModernDocument({ ... });
```

3. Применяйте микрокопирайтинг:
```tsx
import { microcopy } from '@/ui/microcopy';
```

---

## 📚 Дополнительные ресурсы

- [Паттерны коммуникации — Джеки Рид](https://abookapart.com/products/design-for-cognitive-bias)
- [Fogg Behavior Model](https://behaviormodel.org/)
- [Проектная документация](../DOCS/README.md)

---

**Версия:** 2.0  
**Дата обновления:** ${new Date().toLocaleDateString('ru-RU')}

