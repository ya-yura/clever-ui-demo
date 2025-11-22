# 📐 Руководство по использованию

**Версия:** 2.0.0

Правила и рекомендации по использованию дизайн-системы.

---

## 🎨 Цвета

### Семантика цветов

#### Surface (Поверхности)
- **Primary** — основной фон страницы
- **Secondary** — карточки, панели, модальные окна
- **Tertiary** — второстепенные элементы, hover состояния

```tsx
// ✅ Правильно
<div className="bg-surface-primary">
  <Card className="bg-surface-secondary" />
</div>

// ❌ Неправильно
<div className="bg-[#242424]">
  <Card className="bg-[#343436]" />
</div>
```

#### Content (Контент)
- **Primary** — заголовки, важный текст
- **Secondary** — основной текст
- **Tertiary** — второстепенный текст, метаданные

```tsx
<h1 className="text-content-primary">Заголовок</h1>
<p className="text-content-secondary">Основной текст документа</p>
<span className="text-content-tertiary">Метаданные</span>
```

#### Brand (Бренд)
Используйте для:
- Кнопок основных действий (CTA)
- Акцентных элементов
- Активных состояний
- Индикаторов прогресса

```tsx
<Button variant="primary" />  {/* brand-primary */}
<ProgressBar variant="primary" />
```

#### Status (Статусы)
- **Success** (зелёный) — успешные операции
- **Warning** (оранжевый) — предупреждения
- **Error** (красный) — ошибки
- **Info** (голубой) — информация

```tsx
<Badge variant="success" label="Выполнено" />
<Toast variant="error" message="Ошибка сохранения" />
```

### Цветовой контраст

Соблюдайте минимальный контраст **4.5:1** для текста.

```tsx
// ✅ Хороший контраст
<div className="bg-surface-secondary text-content-primary">
  Читаемый текст
</div>

// ❌ Плохой контраст
<div className="bg-surface-tertiary text-content-tertiary">
  Плохо читается
</div>
```

---

## 📝 Типографика

### Иерархия заголовков

```tsx
<h1 className="text-3xl font-bold">          {/* 36px, страница */}
<h2 className="text-2xl font-bold">          {/* 32px, раздел */}
<h3 className="text-xl font-bold">           {/* 24px, подраздел */}
<h4 className="text-lg font-semibold">       {/* 20px, карточка */}
<p className="text-base">                    {/* 16px, текст */}
<span className="text-sm text-content-tertiary">  {/* 12px, метаданные */}
```

### Правила
1. **Один H1 на страницу**
2. **Не пропускайте уровни** (H1 → H3 ❌)
3. **Используйте семантические теги** (`<h1>`, `<p>`, `<strong>`)
4. **Ограничьте длину строки** 60-80 символов для читаемости

---

## 📏 Отступы и сетка

### Spacing Scale

Используйте кратные 4px отступы:

```tsx
<div className="p-4">    {/* 16px — стандартный padding */}
<div className="p-6">    {/* 24px — комфортный padding */}
<div className="gap-2">  {/* 8px — между элементами */}
<div className="gap-4">  {/* 16px — между секциями */}
```

### Вертикальные отступы

```tsx
<div className="space-y-2">   {/* малый */}
<div className="space-y-4">   {/* стандартный */}
<div className="space-y-6">   {/* большой */}
```

### Правила
- **Внутренние отступы (padding)**: `p-4` (мобил), `p-6` (десктоп)
- **Между элементами (gap)**: `gap-2` (плотно), `gap-4` (стандарт)
- **Между секциями**: `space-y-6` или `space-y-8`

---

## 🎭 Состояния элементов

### Interactive Elements

Все интерактивные элементы должны иметь:

#### Hover
```tsx
className="hover:bg-surface-tertiary hover:text-content-primary"
```

#### Focus
```tsx
className="focus:outline-none focus:ring-2 focus:ring-border-focus"
```

#### Active
```tsx
className="active:scale-[0.98]"
```

#### Disabled
```tsx
className="disabled:opacity-50 disabled:cursor-not-allowed"
```

### Пример кнопки со всеми состояниями

```tsx
<button className="
  px-4 py-2 rounded-lg
  bg-brand-primary text-brand-primaryDark
  hover:brightness-110
  focus:outline-none focus:ring-2 focus:ring-brand-primary
  active:scale-[0.98]
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-all duration-200
">
  Кнопка
</button>
```

---

## 📱 Адаптивный дизайн

### Breakpoints

| Breakpoint | Размер | Устройство |
|------------|--------|------------|
| `sm:` | 640px | Телефоны |
| `md:` | 768px | Планшеты |
| `lg:` | 1024px | Десктоп |
| `xl:` | 1280px | Большой десктоп |

### Mobile-First подход

```tsx
// ✅ Правильно: от мобильного к десктопу
<div className="
  text-base          {/* мобил: 16px */}
  md:text-lg         {/* планшет: 20px */}
  lg:text-xl         {/* десктоп: 24px */}
" />

// ✅ Правильно: padding
<Card className="p-4 md:p-6" />

// ❌ Неправильно: desktop-first
<div className="text-xl md:text-base" />
```

### Touch Targets

Минимум **44×44px** для мобильных устройств:

```tsx
// ✅ Правильно
<Button className="min-h-[44px] min-w-[44px]" />

// ❌ Слишком маленькая
<button className="p-1">×</button>
```

---

## ✨ Анимации и переходы

### Длительность

```tsx
// Микро-взаимодействия (hover, focus)
className="transition-colors duration-100"

// Стандартные переходы (раскрытие, скрытие)
className="transition-all duration-200"

// Сложные анимации (модалы, страницы)
className="transition-transform duration-300"
```

### Easing

```css
/* В Tailwind используется ease-in-out по умолчанию */
transition: all 200ms ease-in-out;

/* Для входящих элементов */
transition: all 200ms cubic-bezier(0.0, 0.0, 0.2, 1);

/* Для выходящих элементов */
transition: all 200ms cubic-bezier(0.4, 0.0, 1, 1);
```

### Правила
1. **Не анимируйте всё** — только важные взаимодействия
2. **Быстрые анимации** — 100-300ms для UI
3. **Используйте `transform`** вместо `top/left` (производительность)
4. **Уважайте `prefers-reduced-motion`**

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🎯 Иконки

### Размеры

```tsx
import { Icon } from 'lucide-react';

<Icon size={16} />  {/* small */}
<Icon size={20} />  {/* medium (по умолчанию) */}
<Icon size={24} />  {/* large */}
```

### С текстом

```tsx
<Button startIcon={<Save size={20} />}>
  Сохранить
</Button>

<div className="flex items-center gap-2">
  <User size={16} />
  <span className="text-sm">Имя пользователя</span>
</div>
```

### Цвета

```tsx
// Наследуют цвет текста
<Home className="text-content-primary" size={20} />
<Settings className="text-content-tertiary" size={20} />
```

---

## 🔤 Формы

### Структура полей

```tsx
<div className="space-y-2">
  {/* Лейбл */}
  <label className="block text-sm font-medium text-content-secondary">
    Email
  </label>
  
  {/* Поле ввода */}
  <Input 
    type="email" 
    placeholder="user@example.com"
    fullWidth
  />
  
  {/* Подсказка или ошибка */}
  <p className="text-xs text-content-tertiary">
    Используйте рабочий email
  </p>
</div>
```

### Валидация

```tsx
// Успешное состояние
<Input 
  value={email}
  className="border-status-success"
/>

// Ошибка
<Input 
  value={email}
  error="Неверный формат email"
  className="border-error"
/>
```

### Группы полей

```tsx
<form className="space-y-6">
  {/* Группа 1 */}
  <div className="space-y-4">
    <Input label="Имя" />
    <Input label="Фамилия" />
  </div>
  
  <Divider />
  
  {/* Группа 2 */}
  <div className="space-y-4">
    <Input label="Email" type="email" />
    <Input label="Телефон" type="tel" />
  </div>
  
  {/* Действия */}
  <div className="flex gap-3 justify-end">
    <Button variant="secondary">Отмена</Button>
    <Button variant="primary">Сохранить</Button>
  </div>
</form>
```

---

## 📦 Композиция компонентов

### Карточки

```tsx
<Card variant="elevated" className="p-6">
  {/* Заголовок */}
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-bold text-content-primary">
      Заголовок
    </h3>
    <Badge variant="success" label="Активно" />
  </div>
  
  {/* Контент */}
  <p className="text-sm text-content-secondary mb-4">
    Описание карточки с подробной информацией.
  </p>
  
  {/* Футер */}
  <div className="flex gap-2 pt-4 border-t border-border-default">
    <Button variant="primary" size="sm">Действие</Button>
    <Button variant="ghost" size="sm">Отмена</Button>
  </div>
</Card>
```

### Списки с действиями

```tsx
<List divider>
  <ListItem 
    title="Элемент списка"
    subtitle="Дополнительная информация"
    icon={<FileText size={20} />}
    endIcon={
      <IconButton 
        icon={<MoreVertical />} 
        variant="ghost"
        size="sm"
      />
    }
  />
</List>
```

---

## ⚡ Производительность

### Рендеринг

1. **Используйте `React.memo`** для тяжёлых компонентов
2. **Избегайте inline функций** в props
3. **Мемоизируйте колбэки** с `useCallback`

```tsx
// ❌ Плохо: создаёт новую функцию при каждом рендере
<Button onClick={() => handleClick(id)}>Click</Button>

// ✅ Хорошо: мемоизированный callback
const handleClick = useCallback(() => {
  handleAction(id);
}, [id]);

<Button onClick={handleClick}>Click</Button>
```

### CSS

1. **Используйте Tailwind** вместо inline стилей
2. **Группируйте классы** логически
3. **Избегайте чрезмерных переопределений**

---

## 🚫 Частые ошибки

### ❌ Хардкод цветов

```tsx
// ❌ Плохо
<div className="bg-[#1a1a1a] text-[#ffffff]" />

// ✅ Хорошо
<div className="bg-surface-secondary text-content-primary" />
```

### ❌ Магические числа

```tsx
// ❌ Плохо
<div className="p-[13px]" />

// ✅ Хорошо
<div className="p-4" />  {/* 16px из spacing scale */}
```

### ❌ Игнорирование семантики

```tsx
// ❌ Плохо
<div onClick={handleClick}>Кнопка</div>

// ✅ Хорошо
<Button onClick={handleClick}>Кнопка</Button>
```

### ❌ Несоответствующие состояния

```tsx
// ❌ Плохо: hover без transition
<button className="hover:bg-blue-500">Click</button>

// ✅ Хорошо
<button className="hover:bg-blue-500 transition-colors duration-200">
  Click
</button>
```

---

## ✅ Checklist разработчика

Перед отправкой кода проверьте:

- [ ] Используются компоненты из дизайн-системы
- [ ] Цвета берутся из токенов (не хардкод)
- [ ] Отступы кратны 4px
- [ ] Touch targets минимум 44×44px
- [ ] Есть состояния hover/focus/active
- [ ] Контраст текста достаточный (4.5:1)
- [ ] Анимации плавные (200-300ms)
- [ ] Адаптивность проверена (мобил → десктоп)
- [ ] Accessibility атрибуты на месте
- [ ] Семантические HTML теги используются

---

**Следуйте этим правилам для консистентного UI!** ✨

