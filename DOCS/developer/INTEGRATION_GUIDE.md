# 🚀 Инструкция по интеграции новых UX улучшений

**Дата:** 07.12.2024  
**Версия:** 2.1.0

---

## 📋 Сгруппированный список документов

### Использование в существующей странице Documents

Компонент `DocumentList` уже обновлён и по умолчанию использует группировку по датам:

```tsx
import { DocumentList } from '@/components/documents/DocumentList';

<DocumentList
  documents={documents}
  loading={loading}
  groupByDate={true}  // По умолчанию true
/>
```

### Закрепление документов

Функционал уже встроен в `DocumentCard`. При клике на звёздочку документ добавляется в группу "Фавориты":

```tsx
// Хук автоматически используется внутри DocumentList
import { usePinnedDocuments } from '@/hooks/usePinnedDocuments';

const { isPinned, togglePin } = usePinnedDocuments();
```

---

## 🎴 Карточки документов с CTA

Компонент `DocumentCard` уже обновлён. Изменения применяются автоматически:

- Крупный заголовок
- Тип операции беджем
- Статус с цветом
- Количество позиций (крупно)
- Кнопка "Начать/Продолжить"

Никаких дополнительных действий не требуется!

---

## 📦 Карточки товаров со свайпами

### Базовое использование

```tsx
import { ProductCard } from '@/components/common/ProductCard';

const product = {
  id: '1',
  name: 'Молоко 3.2%',
  sku: 'MILK-001',
  barcode: '4607012291234',
  imageUrl: '/images/milk.jpg', // опционально
  plannedQuantity: 10,
  actualQuantity: 7,
  status: 'in_progress',
  unit: 'шт',
};

<ProductCard
  product={product}
  onClick={() => console.log('Открыть детали')}
  onIncrement={() => console.log('+')}
  onDecrement={() => console.log('-')}
  onLongPress={() => console.log('Ручной ввод')}
  showImage={true}
  compact={false}
/>
```

### Компактный режим

Для списков с большим количеством товаров:

```tsx
<ProductCard
  product={product}
  compact={true}  // Уменьшенная версия
/>
```

### Интеграция в существующие модули

**Пример для Receiving:**

```tsx
// src/pages/Receiving.tsx
import { ProductCard } from '@/components/common/ProductCard';

// В рендере вместо таблицы:
{lines.map(line => (
  <ProductCard
    key={line.id}
    product={{
      id: line.productId,
      name: line.productName,
      sku: line.sku,
      barcode: line.barcode,
      plannedQuantity: line.plannedQuantity,
      actualQuantity: line.actualQuantity,
      status: line.status,
    }}
    onIncrement={() => handleIncrement(line.id)}
    onDecrement={() => handleDecrement(line.id)}
    onLongPress={() => handleManualInput(line.id)}
  />
))}
```

---

## 🎮 Экран сканирования

### Использование

```tsx
import { ScanningScreen } from '@/components/scanning/ScanningScreen';

const [lastScanResult, setLastScanResult] = useState();

<ScanningScreen
  documentType="receiving"
  documentNumber="RCV-1120"
  currentProduct={{
    name: 'Молоко 3.2%',
    sku: 'MILK-001',
  }}
  totalItems={100}
  completedItems={75}
  isOnline={navigator.onLine}
  hint="Сканируйте следующий товар"
  lastScanResult={lastScanResult}
  onManualInput={() => setShowManualInputModal(true)}
  onCameraInput={() => startCameraScanner()}
  onScan={(code) => handleScan(code)}
/>
```

### Интеграция в модуль Receiving

```tsx
// src/pages/Receiving.tsx
import { ScanningScreen } from '@/components/scanning/ScanningScreen';

const [scanMode, setScanMode] = useState<'list' | 'scan'>('list');

{scanMode === 'scan' ? (
  <ScanningScreen
    documentType="receiving"
    documentNumber={document.number}
    currentProduct={currentProduct}
    totalItems={lines.length}
    completedItems={completedLines}
    isOnline={isOnline}
    hint="Сканируйте товар для приёмки"
    lastScanResult={lastScanResult}
    onManualInput={handleManualInput}
    onCameraInput={handleCameraInput}
  />
) : (
  <DocumentList ... />
)}

// Кнопка переключения режима
<button onClick={() => setScanMode(scanMode === 'list' ? 'scan' : 'list')}>
  {scanMode === 'list' ? 'Режим сканирования' : 'Список товаров'}
</button>
```

---

## 🍞 Хлебные крошки

### Автоматическая генерация

```tsx
import { Breadcrumbs, useBreadcrumbs } from '@/components/common/Breadcrumbs';

// В компоненте страницы
const breadcrumbs = useBreadcrumbs([
  { label: 'Приёмка', path: '/receiving' },
  { label: document.number, path: `/receiving/${document.id}` },
  { label: 'Сканирование' }, // Текущая страница (без path)
]);

<Breadcrumbs items={breadcrumbs} />
```

### Ручная настройка

```tsx
<Breadcrumbs
  items={[
    { label: 'Главная', path: '/', icon: <Home size={16} /> },
    { label: 'Документы', path: '/documents' },
    { label: 'RCV-1120' },
  ]}
/>
```

### Добавление в Layout

```tsx
// src/components/Layout.tsx
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

<Header />
<Breadcrumbs items={breadcrumbs} className="sticky top-14 z-20 bg-surface-primary px-4" />
<main>{children}</main>
```

---

## 🛡️ Предотвращение ошибок

### Валидация при сканировании

```tsx
import {
  validateProductScan,
  validateCellScan,
  showError,
} from '@/utils/errorPrevention';

const handleScan = (code: string) => {
  // Валидация товара
  const validation = validateProductScan(code, documentProducts);
  
  if (!validation.valid) {
    // Показать ошибку с мультимодальной обратной связью
    const error = showError('PRODUCT_NOT_IN_DOCUMENT', {
      enableVibration: true,
      enableSound: true,
      enableVoice: true,
    });
    
    // Показать UI с ошибкой
    setLastScanResult({
      success: false,
      message: error.message,
      timestamp: Date.now(),
    });
    
    return;
  }
  
  // Обработать успешное сканирование
  handleSuccessfulScan(code);
};
```

### Валидация ячейки

```tsx
const handleCellScan = (cellId: string) => {
  const validation = validateCellScan(
    cellId,
    expectedCell, // Ячейка по маршруту
    allCells // Список всех существующих ячеек
  );
  
  if (!validation.valid) {
    showError('WRONG_CELL');
    return;
  }
  
  // Продолжить
};
```

### Автосохранение

```tsx
import { AutoSaveManager } from '@/utils/errorPrevention';

const saveDocument = async () => {
  await documentService.save(document);
};

// Создать менеджер автосохранения
const autoSave = new AutoSaveManager(saveDocument, 30000); // 30 сек

// Запустить при монтировании
useEffect(() => {
  autoSave.start();
  return () => autoSave.stop();
}, []);

// Сохранить вручную при необходимости
const handleExit = async () => {
  const saved = await autoSave.saveNow();
  if (saved) {
    navigate('/documents');
  }
};
```

### Проверка перед завершением

```tsx
import { validateDocumentCompletion, showError } from '@/utils/errorPrevention';

const handleComplete = () => {
  const validation = validateDocumentCompletion(lines);
  
  if (!validation.valid) {
    showError('INCOMPLETE_DOCUMENT');
    alert(validation.error + '\n' + validation.suggestion);
    return;
  }
  
  // Завершить документ
  completeDocument();
};
```

---

## 👥 Выбор напарника со статистикой

### Использование компонента

```tsx
import { PartnerSelection, Partner } from '@/components/team/PartnerSelection';
import { teamStats } from '@/utils/teamStats';

const [selectedPartnerId, setSelectedPartnerId] = useState<string>();

// Загрузить список напарников с статистикой
const partners: Partner[] = employees.map(emp => ({
  id: emp.id,
  name: emp.name,
  role: emp.role,
  department: emp.department,
  isOnline: emp.isActive,
  lastActiveAt: emp.lastActiveAt,
  avatar: emp.avatarUrl,
  stats: teamStats.getUserStats(emp.id) || undefined,
}));

<PartnerSelection
  partners={partners}
  selectedPartnerId={selectedPartnerId}
  lastPartnerId={localStorage.getItem('lastPartnerId') || undefined}
  onSelect={(id) => {
    setSelectedPartnerId(id);
    localStorage.setItem('lastPartnerId', id);
  }}
  showStats={true}
/>
```

### Запись статистики операции

```tsx
import { teamStats } from '@/utils/teamStats';

const handleDocumentComplete = async () => {
  // Записать статистику
  await teamStats.recordOperation({
    userId: currentUser.id,
    partnerId: selectedPartner?.id,
    operationType: 'receiving',
    documentId: document.id,
    startTime: document.startTime,
    endTime: Date.now(),
    duration: Date.now() - document.startTime,
    itemsProcessed: document.totalLines,
    errorsCount: document.errorsCount || 0,
  });
  
  // Завершить документ
  await completeDocument();
};
```

### Отображение сравнения команды

```tsx
import { teamStats } from '@/utils/teamStats';

const TeamDashboard = () => {
  const comparison = teamStats.getTeamComparison();
  
  return (
    <div>
      <h2>Топ-5 исполнителей</h2>
      {comparison.topPerformers.map(stat => (
        <div key={stat.userId}>
          {stat.userId}: {stat.errorRate}% ошибок
        </div>
      ))}
      
      <h2>Средние показатели</h2>
      <div>Время: {comparison.averageTime} мин</div>
      <div>Ошибки: {comparison.averageErrorRate}%</div>
    </div>
  );
};
```

---

## 🔧 Утилиты и хелперы

### Группировка документов по датам

```tsx
import { groupDocumentsByDate } from '@/utils/documentGrouping';

const grouped = groupDocumentsByDate(documents);
// Результат: [{ group: 'today', label: '📅 Сегодня', documents: [...] }, ...]
```

### Закреплённые документы

```tsx
import { usePinnedDocuments } from '@/hooks/usePinnedDocuments';

const { isPinned, togglePin, pinDocument, unpinDocument } = usePinnedDocuments();

// Проверить
if (isPinned(docId)) { ... }

// Переключить
togglePin(docId);

// Закрепить
pinDocument(docId);

// Открепить
unpinDocument(docId);
```

---

## 📱 Responsive и адаптивность

Все компоненты адаптивны и работают на:
- 📱 Мобильных устройствах
- 📱 Планшетах
- 💻 Десктопах

Свайпы работают только на touch-устройствах. На десктопе используются кнопки.

---

## ✅ Чек-лист интеграции

- [ ] Обновить `DocumentList` для использования группировки
- [ ] Добавить `Breadcrumbs` в Layout или страницы
- [ ] Заменить таблицы товаров на `ProductCard`
- [ ] Добавить режим сканирования с `ScanningScreen`
- [ ] Интегрировать валидацию из `errorPrevention`
- [ ] Добавить автосохранение в модули
- [ ] Использовать `PartnerSelection` на странице выбора напарника
- [ ] Записывать статистику при завершении операций
- [ ] Тестировать на мобильных устройствах
- [ ] Проверить работу свайпов
- [ ] Протестировать вибрацию и звуки

---

## 🐛 Troubleshooting

### Свайпы не работают

Проверьте:
1. Используется ли touch-устройство
2. Импортирован ли `useSwipe` hook
3. Привязаны ли обработчики `onTouchStart`, `onTouchMove`, `onTouchEnd`

### Статистика не сохраняется

Проверьте:
1. Доступен ли `localStorage`
2. Вызывается ли `teamStats.recordOperation()`
3. Корректны ли передаваемые данные

### Группировка документов не работает

Проверьте:
1. Есть ли у документов поле `updatedAt` (timestamp)
2. Передан ли `groupByDate={true}` в `DocumentList`
3. Корректен ли формат даты (число, а не строка)

---

## 📚 Дополнительная документация

- `UX_IMPROVEMENTS.md` - полное описание всех улучшений
- `CHANGELOG.md` - история изменений
- JSDoc комментарии в коде компонентов

---

**Готово к использованию!** 🎉

Если возникнут вопросы, обращайтесь к комментариям в коде или документации.

