# ♿ Доступность (Accessibility)

**Версия:** 2.0.0  
**Стандарт:** WCAG 2.1 Level AA

Дизайн-система Cleverence Mobile разработана с учётом требований доступности для всех пользователей.

---

## 📖 Содержание

1. [Принципы](#принципы)
2. [Клавиатурная навигация](#клавиатурная-навигация)
3. [Screen Readers](#screen-readers)
4. [Цветовой контраст](#цветовой-контраст)
5. [Touch Targets](#touch-targets)
6. [ARIA атрибуты](#aria-атрибуты)
7. [Формы](#формы)
8. [Модальные окна](#модальные-окна)
9. [Тестирование](#тестирование)

---

## Принципы

Следуем четырём принципам WCAG (POUR):

### 1. **Perceivable** (Воспринимаемость)
Информация должна быть воспринимаема всеми пользователями.

- ✅ Текстовые альтернативы для изображений
- ✅ Достаточный цветовой контраст
- ✅ Читаемая типографика

### 2. **Operable** (Управляемость)
Все элементы доступны через разные устройства ввода.

- ✅ Клавиатурная навигация
- ✅ Достаточные touch targets (44×44px)
- ✅ Достаточное время для взаимодействия

### 3. **Understandable** (Понятность)
Интерфейс понятен и предсказуем.

- ✅ Последовательная навигация
- ✅ Понятные сообщения об ошибках
- ✅ Предсказуемое поведение

### 4. **Robust** (Надёжность)
Совместимость с вспомогательными технологиями.

- ✅ Семантический HTML
- ✅ Корректные ARIA атрибуты
- ✅ Поддержка screen readers

---

## Клавиатурная навигация

### Основные клавиши

| Клавиша | Действие |
|---------|----------|
| `Tab` | Переход к следующему элементу |
| `Shift + Tab` | Переход к предыдущему элементу |
| `Enter` / `Space` | Активация элемента |
| `Esc` | Закрытие модалов, меню |
| `Arrow Keys` | Навигация по спискам, табам |

### Порядок фокуса

```tsx
// ✅ Правильно: логичный порядок
<form>
  <Input label="Имя" tabIndex={1} />
  <Input label="Email" tabIndex={2} />
  <Button type="submit" tabIndex={3}>Отправить</Button>
</form>

// ❌ Неправильно: произвольный tabIndex
<div tabIndex={999}>...</div>
```

### Индикатор фокуса

Все интерактивные элементы имеют видимый focus state:

```tsx
<Button className="
  focus:outline-none 
  focus:ring-2 
  focus:ring-border-focus 
  focus:ring-offset-2
">
  Кнопка
</Button>
```

### Skip Links

Добавляйте ссылки для быстрого перехода:

```tsx
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only"
>
  Перейти к основному содержимому
</a>
```

---

## Screen Readers

### Семантический HTML

```tsx
// ✅ Правильно: семантические теги
<nav>
  <ul>
    <li><a href="/">Главная</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Заголовок</h1>
    <p>Содержимое</p>
  </article>
</main>

// ❌ Неправильно: div soup
<div className="nav">
  <div className="link">Главная</div>
</div>
```

### Alt текст для изображений

```tsx
// ✅ Правильно: описательный alt
<img src="user.jpg" alt="Иван Иванов, менеджер отдела продаж" />

// ✅ Декоративное изображение
<img src="decoration.png" alt="" role="presentation" />

// ❌ Неправильно: отсутствует alt
<img src="user.jpg" />
```

### Кнопки-иконки

```tsx
// ✅ Правильно: aria-label
<IconButton 
  icon={<Settings />}
  aria-label="Открыть настройки"
/>

// ❌ Неправильно: без описания
<button><Settings /></button>
```

### Скрытие от screen readers

```tsx
// Декоративные элементы
<span aria-hidden="true">👍</span>

// Визуальный текст есть, дублировать не нужно
<Button>
  <Save aria-hidden="true" />
  Сохранить
</Button>
```

---

## Цветовой контраст

### Минимальные требования

**WCAG AA:**
- Обычный текст: **4.5:1**
- Крупный текст (18px+): **3:1**
- UI компоненты: **3:1**

**Наша палитра:**

| Комбинация | Контраст | Результат |
|------------|----------|-----------|
| `content-primary` на `surface-primary` | 14.2:1 | ✅ AAA |
| `content-secondary` на `surface-primary` | 12.8:1 | ✅ AAA |
| `content-tertiary` на `surface-primary` | 5.2:1 | ✅ AA |
| `brand-primaryDark` на `brand-primary` | 4.7:1 | ✅ AA |

### Проверка контраста

```tsx
// ✅ Хороший контраст
<div className="bg-surface-secondary text-content-primary">
  Читаемый текст
</div>

// ⚠️ Проверьте: может быть недостаточно
<div className="bg-brand-primary text-brand-primaryLight">
  Проверить контраст
</div>

// ❌ Плохой контраст
<div className="bg-surface-tertiary text-content-tertiary">
  Плохо читается
</div>
```

### Инструменты проверки

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)
- Chrome DevTools: Lighthouse Accessibility Audit

### Не полагайтесь только на цвет

```tsx
// ❌ Плохо: только цвет
<Badge className="bg-red-500" />

// ✅ Хорошо: цвет + иконка + текст
<Badge 
  variant="error" 
  label="Ошибка"
  icon={<XCircle />}
/>
```

---

## Touch Targets

### Минимальный размер

**Apple HIG:** 44×44px  
**Material Design:** 48×48px  
**Cleverence:** **44×44px минимум**

```tsx
// ✅ Правильно
<Button className="min-h-[44px] min-w-[44px]" />

// ❌ Слишком маленькая
<button className="p-1">×</button>
```

### Расстояние между целями

Минимум **8px** между соседними touch targets:

```tsx
<div className="flex gap-2">  {/* 8px между */}
  <IconButton icon={<Edit />} />
  <IconButton icon={<Delete />} />
</div>
```

### На мобильных устройствах

```tsx
// Desktop: компактно
<div className="hidden md:flex gap-1">
  <IconButton size="sm" />
  <IconButton size="sm" />
</div>

// Mobile: просторно
<div className="flex md:hidden gap-2">
  <IconButton size="md" />
  <IconButton size="md" />
</div>
```

---

## ARIA атрибуты

### Роли

```tsx
// Навигация
<nav role="navigation">
  <ul role="list">
    <li role="listitem">...</li>
  </ul>
</nav>

// Кнопка (если не <button>)
<div 
  role="button" 
  tabIndex={0}
  onClick={handleClick}
  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
>
  Кликните
</div>

// Диалог
<Modal role="dialog" aria-modal="true" />
```

### Labels и Descriptions

```tsx
// aria-label
<button aria-label="Закрыть">
  <X />
</button>

// aria-labelledby
<div role="dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Подтверждение</h2>
</div>

// aria-describedby
<Input 
  aria-describedby="email-hint"
/>
<span id="email-hint">Используйте рабочий email</span>
```

### Состояния

```tsx
// Расширяемый элемент
<button aria-expanded={isOpen}>
  Меню
</button>

// Выбранный элемент
<Tab aria-selected={isActive} />

// Отключенный элемент
<Button disabled aria-disabled="true" />

// Скрытый элемент
<div aria-hidden="true">Скрыто от screen readers</div>
```

### Live Regions

Для динамических обновлений:

```tsx
// Уведомления
<div 
  role="status" 
  aria-live="polite"
  aria-atomic="true"
>
  {notification}
</div>

// Критичные обновления
<div 
  role="alert" 
  aria-live="assertive"
>
  {errorMessage}
</div>
```

---

## Формы

### Labels

```tsx
// ✅ Правильно: явный label
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ Правильно: aria-label
<input type="email" aria-label="Email" />

// ❌ Неправильно: без label
<input type="email" placeholder="Email" />
```

### Ошибки валидации

```tsx
<div>
  <Input 
    id="password"
    type="password"
    aria-invalid={hasError}
    aria-describedby="password-error"
  />
  
  {hasError && (
    <p 
      id="password-error" 
      role="alert"
      className="text-error"
    >
      Пароль слишком короткий
    </p>
  )}
</div>
```

### Обязательные поля

```tsx
<Input 
  label="Email"
  required
  aria-required="true"
/>

// Или индикатор
<label>
  Email <span aria-label="обязательное поле">*</span>
</label>
```

### Группы полей

```tsx
<fieldset>
  <legend>Персональная информация</legend>
  <Input label="Имя" />
  <Input label="Фамилия" />
</fieldset>
```

---

## Модальные окна

### Focus Management

```tsx
function Modal({ isOpen, onClose }) {
  const firstFocusRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Фокус на первый элемент
      firstFocusRef.current?.focus();
      
      // Сохранить предыдущий фокус
      const previousFocus = document.activeElement;
      
      return () => {
        // Вернуть фокус при закрытии
        previousFocus?.focus();
      };
    }
  }, [isOpen]);
  
  return (
    <div role="dialog" aria-modal="true">
      <button ref={firstFocusRef}>Первая кнопка</button>
      ...
    </div>
  );
}
```

### Focus Trap

Удерживайте фокус внутри модала:

```tsx
// Используйте библиотеку react-focus-lock
import FocusLock from 'react-focus-lock';

<FocusLock>
  <Modal>
    {/* Фокус останется внутри */}
  </Modal>
</FocusLock>
```

### Escape для закрытия

```tsx
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [onClose]);
```

---

## Тестирование

### Автоматическое

```bash
# axe-core для React
npm install --save-dev @axe-core/react

# В main.tsx (только dev)
if (process.env.NODE_ENV === 'development') {
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

### Ручное тестирование

#### Checklist

- [ ] **Клавиатура:** можно ли всё сделать без мыши?
  - [ ] Tab/Shift+Tab работает логично
  - [ ] Enter/Space активирует элементы
  - [ ] Escape закрывает модалы
  - [ ] Стрелки работают в списках/табах

- [ ] **Screen Reader:** попробуйте NVDA (Windows) или VoiceOver (Mac)
  - [ ] Все элементы озвучены
  - [ ] Порядок чтения логичный
  - [ ] Альтернативный текст адекватный

- [ ] **Контраст:** проверьте все цветовые комбинации
  - [ ] Текст читаем
  - [ ] UI элементы различимы
  - [ ] Не полагаетесь только на цвет

- [ ] **Масштабирование:** увеличьте до 200%
  - [ ] Контент не обрезается
  - [ ] Горизонтальной прокрутки нет
  - [ ] Всё остаётся функциональным

- [ ] **Touch:** на реальном устройстве
  - [ ] Кнопки минимум 44×44px
  - [ ] Достаточное расстояние между целями
  - [ ] Нет случайных нажатий

### Инструменты

- **Browser Extensions:**
  - [axe DevTools](https://www.deque.com/axe/devtools/)
  - [WAVE](https://wave.webaim.org/extension/)
  - [Lighthouse](https://developers.google.com/web/tools/lighthouse) (встроен в Chrome)

- **Screen Readers:**
  - NVDA (Windows, бесплатно)
  - JAWS (Windows, платно)
  - VoiceOver (macOS/iOS, встроен)
  - TalkBack (Android, встроен)

- **Контраст:**
  - Chrome DevTools: Lighthouse
  - [Contrast Ratio](https://contrast-ratio.com/)

---

## Примеры доступных компонентов

### Доступная кнопка

```tsx
<button
  type="button"
  className="btn-primary"
  aria-label={iconOnly ? 'Сохранить' : undefined}
  disabled={isLoading}
  aria-disabled={isLoading}
>
  {isLoading ? (
    <>
      <Loader2 aria-hidden="true" />
      <span className="sr-only">Загрузка...</span>
    </>
  ) : (
    <>
      {icon && <Save aria-hidden="true" />}
      {!iconOnly && 'Сохранить'}
    </>
  )}
</button>
```

### Доступный Input

```tsx
<div>
  <label htmlFor="email" className="label">
    Email
    {required && <span aria-label="обязательное поле">*</span>}
  </label>
  
  <input
    id="email"
    type="email"
    required={required}
    aria-required={required}
    aria-invalid={hasError}
    aria-describedby={hasError ? 'email-error' : 'email-hint'}
  />
  
  {!hasError && hint && (
    <p id="email-hint" className="hint">{hint}</p>
  )}
  
  {hasError && (
    <p id="email-error" role="alert" className="error">
      {error}
    </p>
  )}
</div>
```

### Доступные табы

```tsx
<div role="tablist">
  {tabs.map(tab => (
    <button
      key={tab.id}
      role="tab"
      aria-selected={tab.id === activeTab}
      aria-controls={`panel-${tab.id}`}
      id={`tab-${tab.id}`}
      onClick={() => setActiveTab(tab.id)}
    >
      {tab.label}
    </button>
  ))}
</div>

{tabs.map(tab => (
  <div
    key={tab.id}
    role="tabpanel"
    id={`panel-${tab.id}`}
    aria-labelledby={`tab-${tab.id}`}
    hidden={tab.id !== activeTab}
  >
    {tab.content}
  </div>
))}
```

---

## Ресурсы

### Официальные стандарты
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)

### Руководства
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)

### Курсы
- [Web Accessibility by Google](https://www.udacity.com/course/web-accessibility--ud891)
- [Accessibility in JavaScript Applications](https://frontendmasters.com/courses/javascript-accessibility/)

---

**Доступность — это не опция, а обязательное требование!** ♿

