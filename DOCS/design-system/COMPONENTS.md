# 🧩 Каталог компонентов

**Версия:** 2.0.0  
**Количество компонентов:** 18

Полный каталог всех компонентов дизайн-системы с примерами использования, вариантами и API.

---

## 📖 Содержание

### Base Components
1. [Button](#button)
2. [IconButton](#iconbutton)
3. [Card](#card)
4. [Badge](#badge)
5. [Avatar](#avatar)
6. [Chip](#chip)
7. [ProgressBar](#progressbar)
8. [Skeleton](#skeleton)

### Form Components
9. [Input](#input)
10. [Checkbox](#checkbox)
11. [Toggle](#toggle)
12. [Select](#select)

### Navigation Components
13. [Tabs](#tabs)
14. [List & ListItem](#list--listitem)

### Layout Components
15. [Divider](#divider)

### Overlay Components
16. [Modal](#modal)
17. [Toast](#toast)
18. [Tooltip](#tooltip)

---

## Base Components

### Button

Основная кнопка для действий.

#### Варианты

```tsx
import { Button } from '@/design/components';

// Primary - основной CTA
<Button variant="primary">Сохранить</Button>

// Secondary - второстепенное действие
<Button variant="secondary">Отмена</Button>

// Ghost - ненавязчивое действие
<Button variant="ghost">Закрыть</Button>

// Danger - опасное действие
<Button variant="danger">Удалить</Button>
```

#### Размеры

```tsx
<Button size="sm">Маленькая</Button>
<Button size="md">Средняя</Button>      {/* по умолчанию */}
<Button size="lg">Большая</Button>
<Button size="icon"><Plus /></Button>   {/* квадратная для иконки */}
```

#### С иконками

```tsx
import { Save, ArrowRight } from 'lucide-react';

<Button startIcon={<Save />}>Сохранить</Button>
<Button endIcon={<ArrowRight />}>Далее</Button>
```

#### Состояния

```tsx
<Button disabled>Недоступна</Button>
<Button isLoading>Загрузка...</Button>
<Button fullWidth>На всю ширину</Button>
```

#### Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Вариант кнопки |
| `size` | `'sm' \| 'md' \| 'lg' \| 'icon'` | `'md'` | Размер |
| `isLoading` | `boolean` | `false` | Состояние загрузки |
| `startIcon` | `ReactNode` | - | Иконка слева |
| `endIcon` | `ReactNode` | - | Иконка справа |
| `fullWidth` | `boolean` | `false` | На всю ширину |
| `disabled` | `boolean` | `false` | Отключена |

---

### IconButton

Кнопка только с иконкой, без текста.

#### Варианты

```tsx
import { IconButton } from '@/design/components';
import { Settings, Bell, Search, Trash } from 'lucide-react';

<IconButton icon={<Settings />} variant="default" />
<IconButton icon={<Bell />} variant="primary" />
<IconButton icon={<Search />} variant="ghost" />
<IconButton icon={<Trash />} variant="danger" />
```

#### Размеры

```tsx
<IconButton icon={<Settings />} size="sm" />   {/* 32px */}
<IconButton icon={<Settings />} size="md" />   {/* 40px */}
<IconButton icon={<Settings />} size="lg" />   {/* 48px */}
```

#### С бейджем

```tsx
<IconButton 
  icon={<Bell />} 
  badge={5}                     // Число непрочитанных
  aria-label="Уведомления"
/>
```

#### Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `icon` | `ReactNode` | **required** | Иконка |
| `variant` | `'default' \| 'primary' \| 'ghost' \| 'danger'` | `'default'` | Вариант |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Размер |
| `badge` | `string \| number` | - | Бейдж с числом |
| `isLoading` | `boolean` | `false` | Загрузка |

---

### Card

Контейнер для контента.

#### Варианты

```tsx
import { Card } from '@/design/components';

// Base - базовая карточка
<Card variant="base">
  <h3>Заголовок</h3>
  <p>Содержимое карточки</p>
</Card>

// Elevated - с тенью
<Card variant="elevated">
  <h3>Карточка с тенью</h3>
</Card>

// Interactive - кликабельная
<Card variant="interactive" onClick={() => console.log('Clicked')}>
  <h3>Кликните меня</h3>
</Card>
```

#### Опции

```tsx
// Без внутренних отступов
<Card noPadding>
  <img src="..." alt="..." className="w-full" />
  <div className="p-4">
    <h3>Заголовок</h3>
  </div>
</Card>
```

#### Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `variant` | `'base' \| 'elevated' \| 'interactive'` | `'base'` | Вариант |
| `noPadding` | `boolean` | `false` | Убрать padding |

---

### Badge

Небольшая метка для статуса или категории.

#### Варианты

```tsx
import { Badge } from '@/design/components';

<Badge variant="success" label="Активен" />
<Badge variant="warning" label="Ожидание" />
<Badge variant="error" label="Ошибка" />
<Badge variant="info" label="Новое" />
<Badge variant="neutral" label="Архив" />
```

#### С иконкой

```tsx
import { Check, AlertCircle } from 'lucide-react';

<Badge 
  variant="success" 
  label="Завершено" 
  icon={<Check size={14} />} 
/>
```

#### Размеры

```tsx
<Badge size="sm" label="Малый" />
<Badge size="md" label="Средний" />     {/* по умолчанию */}
<Badge size="lg" label="Большой" />
```

#### Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `label` | `string` | **required** | Текст |
| `variant` | `'success' \| 'warning' \| 'error' \| 'info' \| 'neutral'` | `'neutral'` | Вариант |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Размер |
| `icon` | `ReactNode` | - | Иконка |

---

### Avatar

Аватар пользователя.

#### С изображением

```tsx
import { Avatar } from '@/design/components';

<Avatar 
  src="/path/to/image.jpg" 
  alt="Иван Иванов"
  size="md"
/>
```

#### С инициалами

```tsx
<Avatar 
  name="Иван Иванов"      // Автоматически ИИ
  size="lg"
/>

<Avatar initials="АБ" />   // Явное указание
```

#### Размеры

```tsx
<Avatar size="xs" name="User" />   {/* 24px */}
<Avatar size="sm" name="User" />   {/* 32px */}
<Avatar size="md" name="User" />   {/* 40px */}
<Avatar size="lg" name="User" />   {/* 48px */}
<Avatar size="xl" name="User" />   {/* 64px */}
```

#### С индикатором статуса

```tsx
<Avatar 
  src="/user.jpg" 
  status="online"          // online, offline, busy
/>
```

#### Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `src` | `string` | - | URL изображения |
| `name` | `string` | - | Имя (для инициалов) |
| `initials` | `string` | - | Явные инициалы |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Размер |
| `status` | `'online' \| 'offline' \| 'busy'` | - | Статус |

---

### Chip

Интерактивная таблетка для фильтров и тегов.

#### Варианты

```tsx
import { Chip } from '@/design/components';

<Chip label="Активные" variant="primary" />
<Chip label="Архив" variant="neutral" />
<Chip label="Ошибки" variant="error" />
```

#### Активное состояние

```tsx
const [active, setActive] = useState(false);

<Chip 
  label="Фильтр" 
  active={active}
  onClick={() => setActive(!active)}
/>
```

#### С иконкой

```tsx
import { Filter } from 'lucide-react';

<Chip 
  label="Фильтровать" 
  icon={<Filter size={16} />}
/>
```

#### Удаляемый

```tsx
<Chip 
  label="Тег" 
  onClose={() => console.log('Removed')}
/>
```

#### Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `label` | `string` | **required** | Текст |
| `variant` | `'primary' \| 'neutral' \| 'success' \| 'error'` | `'neutral'` | Вариант |
| `active` | `boolean` | `false` | Активен |
| `icon` | `ReactNode` | - | Иконка |
| `onClose` | `() => void` | - | Callback удаления |
| `onClick` | `() => void` | - | Callback клика |

---

### ProgressBar

Индикатор прогресса.

#### Базовое использование

```tsx
import { ProgressBar } from '@/design/components';

<ProgressBar value={45} max={100} />
```

#### С лейблом

```tsx
<ProgressBar 
  value={75} 
  max={100}
  showLabel
  label="75%"
/>
```

#### Варианты

```tsx
<ProgressBar value={30} variant="success" />
<ProgressBar value={60} variant="warning" />
<ProgressBar value={90} variant="error" />
```

#### Размеры

```tsx
<ProgressBar value={50} size="sm" />   {/* 4px */}
<ProgressBar value={50} size="md" />   {/* 8px */}
<ProgressBar value={50} size="lg" />   {/* 12px */}
```

#### Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `value` | `number` | **required** | Текущее значение |
| `max` | `number` | `100` | Максимум |
| `variant` | `'primary' \| 'success' \| 'warning' \| 'error'` | `'primary'` | Вариант |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Размер |
| `showLabel` | `boolean` | `false` | Показать лейбл |
| `label` | `string` | - | Текст лейбла |

---

### Skeleton

Заглушка для загрузки контента.

#### Типы

```tsx
import { Skeleton } from '@/design/components';

// Текст
<Skeleton variant="text" width="60%" />

// Прямоугольник
<Skeleton variant="rect" width={200} height={100} />

// Круг (аватар)
<Skeleton variant="circle" size={48} />
```

#### Готовые композиции

```tsx
// Строка текста
<SkeletonText />

// Несколько строк
<SkeletonText lines={3} />

// Карточка
<SkeletonCard />

// Карточка с аватаром
<SkeletonCard hasAvatar />
```

#### Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `variant` | `'text' \| 'rect' \| 'circle'` | `'text'` | Тип |
| `width` | `string \| number` | `'100%'` | Ширина |
| `height` | `string \| number` | - | Высота |
| `size` | `number` | - | Размер (для circle) |

---

## Form Components

### Input

Поле ввода текста.

#### Базовое использование

```tsx
import { Input } from '@/design/components';

<Input 
  type="text"
  placeholder="Введите текст"
/>
```

#### С лейблом

```tsx
<Input 
  label="Email"
  type="email"
  placeholder="user@example.com"
/>
```

#### С иконкой

```tsx
import { Mail, Search } from 'lucide-react';

<Input 
  icon={<Mail />}
  placeholder="Email"
/>

<Input 
  icon={<Search />}
  placeholder="Поиск..."
/>
```

#### С валидацией

```tsx
<Input 
  label="Пароль"
  type="password"
  error="Пароль слишком короткий"
/>

<Input 
  label="Email"
  type="email"
  hint="Используйте рабочий email"
/>
```

#### Размеры

```tsx
<Input size="sm" placeholder="Малое" />
<Input size="md" placeholder="Среднее" />
<Input size="lg" placeholder="Большое" />
```

#### Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `label` | `string` | - | Лейбл |
| `error` | `string` | - | Сообщение об ошибке |
| `hint` | `string` | - | Подсказка |
| `icon` | `ReactNode` | - | Иконка |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Размер |
| `fullWidth` | `boolean` | `false` | На всю ширину |

---

### Checkbox

Флажок для выбора.

#### Базовое использование

```tsx
import { Checkbox } from '@/design/components';

const [checked, setChecked] = useState(false);

<Checkbox 
  label="Согласен с условиями"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>
```

#### Без лейбла

```tsx
<Checkbox checked={value} onChange={handler} />
```

#### Отключенный

```tsx
<Checkbox 
  label="Недоступно"
  checked={false}
  disabled
/>
```

#### Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `label` | `string` | - | Лейбл |
| `checked` | `boolean` | **required** | Состояние |
| `onChange` | `(e) => void` | **required** | Обработчик |
| `disabled` | `boolean` | `false` | Отключен |

---

### Toggle

Переключатель (switch).

#### Базовое использование

```tsx
import { Toggle } from '@/design/components';

const [enabled, setEnabled] = useState(false);

<Toggle 
  label="Уведомления"
  checked={enabled}
  onChange={(e) => setEnabled(e.target.checked)}
/>
```

#### Без лейбла

```tsx
<Toggle checked={value} onChange={handler} />
```

#### Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `label` | `string` | - | Лейбл |
| `checked` | `boolean` | **required** | Состояние |
| `onChange` | `(e) => void` | **required** | Обработчик |
| `disabled` | `boolean` | `false` | Отключен |

---

### Select

Выпадающий список.

#### Базовое использование

```tsx
import { Select } from '@/design/components';

const options = [
  { value: 'apple', label: 'Яблоко' },
  { value: 'banana', label: 'Банан' },
  { value: 'orange', label: 'Апельсин', disabled: true },
];

<Select 
  options={options}
  value={selected}
  onChange={(e) => setSelected(e.target.value)}
/>
```

#### С лейблом

```tsx
<Select 
  label="Выберите фрукт"
  options={options}
/>
```

#### С валидацией

```tsx
<Select 
  label="Категория"
  options={options}
  error="Обязательное поле"
/>
```

#### Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `options` | `SelectOption[]` | **required** | Опции |
| `label` | `string` | - | Лейбл |
| `error` | `string` | - | Ошибка |
| `hint` | `string` | - | Подсказка |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Размер |
| `fullWidth` | `boolean` | `false` | На всю ширину |

---

## Navigation Components

### Tabs

Вкладки для навигации.

#### Базовое использование

```tsx
import { Tabs } from '@/design/components';
import { Home, Settings, User } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Главная', icon: <Home size={16} /> },
  { id: 'settings', label: 'Настройки', icon: <Settings size={16} /> },
  { id: 'profile', label: 'Профиль', icon: <User size={16} /> },
];

<Tabs 
  tabs={tabs}
  defaultTab="home"
  onChange={(tabId) => console.log(tabId)}
/>
```

#### Варианты

```tsx
// Стандартный (по умолчанию)
<Tabs tabs={tabs} variant="default" />

// Pills (таблетки)
<Tabs tabs={tabs} variant="pills" />

// Underline (подчёркнутые)
<Tabs tabs={tabs} variant="underline" />
```

#### С бейджами

```tsx
const tabs = [
  { id: 'inbox', label: 'Входящие', badge: 5 },
  { id: 'sent', label: 'Отправленные' },
];
```

#### На всю ширину

```tsx
<Tabs tabs={tabs} fullWidth />
```

#### Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `tabs` | `Tab[]` | **required** | Вкладки |
| `defaultTab` | `string` | - | Активная по умолчанию |
| `activeTab` | `string` | - | Контролируемое состояние |
| `onChange` | `(tabId) => void` | - | Обработчик смены |
| `variant` | `'default' \| 'pills' \| 'underline'` | `'default'` | Вариант |
| `fullWidth` | `boolean` | `false` | На всю ширину |

---

### List & ListItem

Список элементов.

#### Базовое использование

```tsx
import { List, ListItem } from '@/design/components';

<List>
  <ListItem title="Пункт 1" />
  <ListItem title="Пункт 2" subtitle="С описанием" />
  <ListItem title="Пункт 3" />
</List>
```

#### С иконками

```tsx
import { Home, Settings, User } from 'lucide-react';

<List>
  <ListItem 
    title="Главная"
    icon={<Home size={20} />}
    onClick={() => navigate('/')}
    showChevron
  />
  <ListItem 
    title="Настройки"
    icon={<Settings size={20} />}
  />
</List>
```

#### С разделителями

```tsx
<List divider>
  <ListItem title="Пункт 1" />
  <ListItem title="Пункт 2" />
  <ListItem title="Пункт 3" />
</List>
```

#### Активный элемент

```tsx
<ListItem 
  title="Выбранный пункт"
  active
/>
```

#### Props (ListItem)

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `title` | `string` | **required** | Заголовок |
| `subtitle` | `string` | - | Подзаголовок |
| `icon` | `ReactNode` | - | Иконка слева |
| `endIcon` | `ReactNode` | - | Иконка справа |
| `showChevron` | `boolean` | `false` | Показать шеврон |
| `active` | `boolean` | `false` | Активен |
| `disabled` | `boolean` | `false` | Отключен |
| `onClick` | `() => void` | - | Обработчик клика |

---

## Layout Components

### Divider

Разделитель контента.

#### Горизонтальный

```tsx
import { Divider } from '@/design/components';

<Divider />
```

#### Вертикальный

```tsx
<div className="flex items-center gap-4">
  <span>Левая часть</span>
  <Divider orientation="vertical" />
  <span>Правая часть</span>
</div>
```

#### С лейблом

```tsx
<Divider label="ИЛИ" />
```

#### Варианты

```tsx
<Divider variant="solid" />   {/* сплошная */}
<Divider variant="dashed" />  {/* пунктирная */}
<Divider variant="dotted" />  {/* точечная */}
```

#### Отступы

```tsx
<Divider spacing="none" />    {/* без отступов */}
<Divider spacing="sm" />      {/* малые */}
<Divider spacing="md" />      {/* средние (по умолчанию) */}
<Divider spacing="lg" />      {/* большие */}
```

#### Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Ориентация |
| `variant` | `'solid' \| 'dashed' \| 'dotted'` | `'solid'` | Вариант |
| `spacing` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Отступы |
| `label` | `string` | - | Лейбл |

---

## Overlay Components

### Modal

Модальное окно.

#### Базовое использование

```tsx
import { Modal } from '@/design/components';

const [isOpen, setIsOpen] = useState(false);

<Modal 
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Подтверждение"
>
  <p>Вы уверены, что хотите удалить?</p>
</Modal>
```

#### С футером

```tsx
<Modal 
  isOpen={isOpen}
  onClose={onClose}
  title="Удаление"
  footer={
    <>
      <Button variant="secondary" onClick={onClose}>
        Отмена
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        Удалить
      </Button>
    </>
  }
>
  <p>Это действие нельзя отменить.</p>
</Modal>
```

#### Размеры

```tsx
<Modal size="sm" ... />     {/* малый */}
<Modal size="md" ... />     {/* средний (по умолчанию) */}
<Modal size="lg" ... />     {/* большой */}
<Modal size="xl" ... />     {/* очень большой */}
<Modal size="full" ... />   {/* на весь экран */}
```

#### Опции

```tsx
<Modal 
  isOpen={isOpen}
  onClose={onClose}
  closeOnOverlayClick={false}    // не закрывать по клику вне
  closeOnEscape={false}           // не закрывать по ESC
  showCloseButton={false}         // скрыть кнопку закрытия
/>
```

#### Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `isOpen` | `boolean` | **required** | Открыт |
| `onClose` | `() => void` | **required** | Закрыть |
| `title` | `string` | - | Заголовок |
| `footer` | `ReactNode` | - | Футер |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Размер |
| `closeOnOverlayClick` | `boolean` | `true` | Закрыть по клику вне |
| `closeOnEscape` | `boolean` | `true` | Закрыть по ESC |
| `showCloseButton` | `boolean` | `true` | Показать кнопку × |

---

### Toast

Временное уведомление.

#### Использование

```tsx
import { Toast } from '@/design/components';

<Toast 
  message="Сохранено успешно!"
  variant="success"
  duration={3000}
  onClose={() => setShow(false)}
/>
```

#### Варианты

```tsx
<Toast message="Успешно!" variant="success" />
<Toast message="Внимание!" variant="warning" />
<Toast message="Ошибка!" variant="error" />
<Toast message="Информация" variant="info" />
```

#### Позиционирование

```tsx
<Toast 
  message="Уведомление"
  position="top-right"     // по умолчанию
/>

// Доступно:
// 'top-right', 'top-left', 'bottom-right', 
// 'bottom-left', 'top-center', 'bottom-center'
```

#### Управление несколькими Toast

```tsx
import { ToastContainer } from '@/design/components';

// В корне приложения
function App() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const addToast = (message: string, variant: ToastVariant) => {
    setToasts([...toasts, { 
      id: Date.now().toString(), 
      message, 
      variant 
    }]);
  };
  
  const removeToast = (id: string) => {
    setToasts(toasts.filter(t => t.id !== id));
  };
  
  return (
    <>
      <YourApp onShowToast={addToast} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
```

#### Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `message` | `string` | **required** | Текст |
| `variant` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | Тип |
| `duration` | `number` | `3000` | Длительность (ms) |
| `position` | `ToastPosition` | `'top-right'` | Позиция |
| `onClose` | `() => void` | - | Закрыть |
| `showIcon` | `boolean` | `true` | Показать иконку |
| `closable` | `boolean` | `true` | Кнопка закрытия |

---

### Tooltip

Подсказка при наведении.

#### Базовое использование

```tsx
import { Tooltip } from '@/design/components';

<Tooltip content="Подсказка">
  <Button>Наведите</Button>
</Tooltip>
```

#### Позиционирование

```tsx
<Tooltip content="Сверху" position="top">
  <span>Элемент</span>
</Tooltip>

<Tooltip content="Справа" position="right">
  <IconButton icon={<Info />} />
</Tooltip>

// Доступно: 'top', 'bottom', 'left', 'right'
```

#### С задержкой

```tsx
<Tooltip 
  content="Появляется через секунду"
  delay={1000}
>
  <span>Элемент</span>
</Tooltip>
```

#### Отключённый

```tsx
<Tooltip content="Не появится" disabled>
  <span>Без подсказки</span>
</Tooltip>
```

#### Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `content` | `string \| ReactNode` | **required** | Содержимое |
| `children` | `ReactElement` | **required** | Элемент-триггер |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Позиция |
| `delay` | `number` | `200` | Задержка (ms) |
| `disabled` | `boolean` | `false` | Отключён |

---

## Примеры композиций

### Форма входа

```tsx
<Card variant="elevated" className="max-w-md mx-auto p-6">
  <h2 className="text-2xl font-bold text-content-primary mb-6">
    Вход
  </h2>
  
  <form className="space-y-4">
    <Input 
      label="Email"
      type="email"
      icon={<Mail />}
      placeholder="user@example.com"
      fullWidth
    />
    
    <Input 
      label="Пароль"
      type="password"
      icon={<Lock />}
      placeholder="••••••••"
      fullWidth
    />
    
    <Checkbox label="Запомнить меня" />
    
    <Button variant="primary" fullWidth>
      Войти
    </Button>
  </form>
</Card>
```

### Список с действиями

```tsx
<Card>
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-bold">Документы</h3>
    <Button variant="primary" size="sm">
      Создать
    </Button>
  </div>
  
  <Divider spacing="sm" />
  
  <List divider>
    <ListItem 
      title="Документ 1"
      subtitle="Создан: 22.11.2025"
      icon={<FileText size={20} />}
      showChevron
      onClick={() => {}}
    />
    <ListItem 
      title="Документ 2"
      subtitle="Создан: 21.11.2025"
      icon={<FileText size={20} />}
      showChevron
      onClick={() => {}}
    />
  </List>
</Card>
```

---

**18 компонентов готовы к использованию!** 🎉

