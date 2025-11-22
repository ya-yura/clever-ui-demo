# 🧩 Типовые паттерны

**Версия:** 2.0.0

Готовые решения для частых UI задач.

---

## 📖 Содержание

1. [Формы](#формы)
2. [Списки и таблицы](#списки-и-таблицы)
3. [Карточки](#карточки)
4. [Модальные окна](#модальные-окна)
5. [Навигация](#навигация)
6. [Уведомления](#уведомления)
7. [Пустые состояния](#пустые-состояния)
8. [Загрузка данных](#загрузка-данных)
9. [Фильтры](#фильтры)

---

## Формы

### Простая форма входа

```tsx
<Card variant="elevated" className="max-w-md mx-auto p-6">
  <h2 className="text-2xl font-bold mb-6">Вход</h2>
  
  <form onSubmit={handleSubmit} className="space-y-4">
    <Input 
      label="Email"
      type="email"
      icon={<Mail />}
      placeholder="user@example.com"
      fullWidth
      required
    />
    
    <Input 
      label="Пароль"
      type="password"
      icon={<Lock />}
      placeholder="••••••••"
      fullWidth
      required
    />
    
    <div className="flex items-center justify-between">
      <Checkbox label="Запомнить меня" />
      <a href="/forgot" className="text-sm text-brand-primary">
        Забыли пароль?
      </a>
    </div>
    
    <Button variant="primary" fullWidth type="submit">
      Войти
    </Button>
  </form>
</Card>
```

### Форма с валидацией

```tsx
function RegistrationForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  return (
    <form className="space-y-6">
      <div className="space-y-4">
        <Input 
          label="Имя"
          error={errors.name}
          hint="Как к вам обращаться"
        />
        
        <Input 
          label="Email"
          type="email"
          error={errors.email}
        />
        
        <Input 
          label="Пароль"
          type="password"
          error={errors.password}
          hint="Минимум 8 символов"
        />
      </div>
      
      <Button variant="primary" fullWidth>
        Зарегистрироваться
      </Button>
    </form>
  );
}
```

### Многошаговая форма

```tsx
function MultiStepForm() {
  const [step, setStep] = useState(0);
  
  const steps = [
    { id: 'personal', label: 'Личные данные' },
    { id: 'contact', label: 'Контакты' },
    { id: 'confirm', label: 'Подтверждение' },
  ];
  
  return (
    <Card className="p-6">
      {/* Progress */}
      <ProgressBar 
        value={((step + 1) / steps.length) * 100} 
        className="mb-6"
      />
      
      {/* Steps */}
      <Tabs 
        tabs={steps} 
        activeTab={steps[step].id}
        variant="underline"
        className="mb-6"
      />
      
      {/* Form content */}
      <div className="space-y-4">
        {step === 0 && <PersonalDataForm />}
        {step === 1 && <ContactForm />}
        {step === 2 && <ConfirmationForm />}
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between mt-6 pt-6 border-t">
        <Button 
          variant="secondary" 
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          Назад
        </Button>
        
        <Button 
          variant="primary"
          onClick={() => setStep(step + 1)}
        >
          {step === steps.length - 1 ? 'Отправить' : 'Далее'}
        </Button>
      </div>
    </Card>
  );
}
```

---

## Списки и таблицы

### Список с действиями

```tsx
<Card>
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-bold">Документы</h3>
    <div className="flex gap-2">
      <IconButton icon={<Filter />} variant="ghost" />
      <Button variant="primary" size="sm" startIcon={<Plus />}>
        Создать
      </Button>
    </div>
  </div>
  
  <Divider spacing="sm" />
  
  <List divider>
    {documents.map(doc => (
      <ListItem 
        key={doc.id}
        title={doc.name}
        subtitle={`Создан: ${doc.createdAt}`}
        icon={<FileText size={20} />}
        endIcon={
          <div className="flex gap-1">
            <IconButton icon={<Edit2 />} size="sm" variant="ghost" />
            <IconButton icon={<Trash2 />} size="sm" variant="danger" />
          </div>
        }
        onClick={() => handleView(doc.id)}
      />
    ))}
  </List>
</Card>
```

### Список с выбором

```tsx
function SelectableList() {
  const [selected, setSelected] = useState<string[]>([]);
  
  return (
    <List>
      {items.map(item => (
        <ListItem 
          key={item.id}
          title={item.name}
          icon={
            <Checkbox 
              checked={selected.includes(item.id)}
              onChange={() => toggleSelect(item.id)}
            />
          }
          active={selected.includes(item.id)}
        />
      ))}
    </List>
  );
}
```

---

## Карточки

### Информационная карточка

```tsx
<Card variant="elevated">
  <div className="flex items-start gap-4">
    <Avatar size="lg" src={user.avatar} name={user.name} />
    
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-lg font-bold">{user.name}</h3>
        <Badge variant="success" label={user.status} />
      </div>
      
      <p className="text-sm text-content-tertiary mb-3">
        {user.role} • {user.department}
      </p>
      
      <div className="flex gap-2">
        <Button variant="primary" size="sm">
          Отправить сообщение
        </Button>
        <IconButton icon={<MoreVertical />} variant="ghost" size="sm" />
      </div>
    </div>
  </div>
</Card>
```

### Карточка со статистикой

```tsx
<Card variant="elevated">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm text-content-tertiary">Всего продаж</span>
    <Badge variant="success" label="+12%" />
  </div>
  
  <div className="text-3xl font-bold mb-4">1,234</div>
  
  <ProgressBar value={75} variant="success" />
  
  <div className="flex items-center justify-between mt-2">
    <span className="text-xs text-content-tertiary">Прогресс</span>
    <span className="text-xs font-medium">75%</span>
  </div>
</Card>
```

### Карточка товара

```tsx
<Card variant="interactive" noPadding>
  <img 
    src={product.image} 
    alt={product.name}
    className="w-full h-48 object-cover rounded-t-lg"
  />
  
  <div className="p-4">
    <h3 className="text-lg font-bold mb-1">{product.name}</h3>
    <p className="text-sm text-content-tertiary mb-3">
      {product.description}
    </p>
    
    <div className="flex items-center justify-between">
      <span className="text-xl font-bold text-brand-primary">
        {product.price} ₽
      </span>
      <Button variant="primary" size="sm" startIcon={<ShoppingCart />}>
        В корзину
      </Button>
    </div>
  </div>
</Card>
```

---

## Модальные окна

### Подтверждение действия

```tsx
function DeleteConfirmModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal 
      isOpen={isOpen}
      onClose={onClose}
      title="Удалить элемент?"
      size="sm"
    >
      <p className="text-content-secondary mb-4">
        Это действие нельзя отменить. Элемент будет удалён навсегда.
      </p>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Отмена
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Удалить
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```

### Форма в модальном окне

```tsx
function EditUserModal({ isOpen, onClose, user }) {
  return (
    <Modal 
      isOpen={isOpen}
      onClose={onClose}
      title="Редактировать пользователя"
      size="md"
    >
      <form className="space-y-4">
        <Input 
          label="Имя"
          defaultValue={user.name}
          fullWidth
        />
        
        <Input 
          label="Email"
          type="email"
          defaultValue={user.email}
          fullWidth
        />
        
        <Select 
          label="Роль"
          options={roleOptions}
          defaultValue={user.role}
          fullWidth
        />
      </form>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Отмена
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Сохранить
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```

---

## Навигация

### Меню с вкладками

```tsx
function Navigation() {
  const tabs = [
    { id: 'home', label: 'Главная', icon: <Home /> },
    { id: 'docs', label: 'Документы', icon: <FileText />, badge: 3 },
    { id: 'settings', label: 'Настройки', icon: <Settings /> },
  ];
  
  return (
    <Tabs 
      tabs={tabs}
      variant="pills"
      fullWidth
      onChange={handleTabChange}
    />
  );
}
```

### Боковое меню

```tsx
<Card noPadding>
  <div className="p-4 border-b border-border-default">
    <h3 className="font-bold">Меню</h3>
  </div>
  
  <List>
    <ListItem 
      title="Главная"
      icon={<Home size={20} />}
      active={currentPage === 'home'}
      onClick={() => navigate('/')}
    />
    <ListItem 
      title="Документы"
      icon={<FileText size={20} />}
      active={currentPage === 'docs'}
      onClick={() => navigate('/docs')}
    />
    
    <Divider spacing="sm" />
    
    <ListItem 
      title="Настройки"
      icon={<Settings size={20} />}
      onClick={() => navigate('/settings')}
    />
  </List>
</Card>
```

---

## Уведомления

### Toast система

```tsx
function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const showToast = (message: string, variant: ToastVariant) => {
    const id = Date.now().toString();
    setToasts([...toasts, { id, message, variant }]);
  };
  
  const removeToast = (id: string) => {
    setToasts(toasts.filter(t => t.id !== id));
  };
  
  return {
    toasts,
    success: (msg: string) => showToast(msg, 'success'),
    error: (msg: string) => showToast(msg, 'error'),
    warning: (msg: string) => showToast(msg, 'warning'),
    info: (msg: string) => showToast(msg, 'info'),
    removeToast,
  };
}

// Использование
function App() {
  const toast = useToasts();
  
  return (
    <>
      <YourApp onSuccess={() => toast.success('Сохранено!')} />
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </>
  );
}
```

---

## Пустые состояния

### Пустой список

```tsx
<Card className="text-center py-12">
  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-tertiary flex items-center justify-center">
    <FileText size={32} className="text-content-tertiary" />
  </div>
  
  <h3 className="text-lg font-bold mb-2">Нет документов</h3>
  <p className="text-sm text-content-tertiary mb-6">
    Создайте первый документ, чтобы начать работу
  </p>
  
  <Button variant="primary" startIcon={<Plus />}>
    Создать документ
  </Button>
</Card>
```

### Поиск без результатов

```tsx
<div className="text-center py-12">
  <Search size={48} className="mx-auto mb-4 text-content-tertiary" />
  <h3 className="text-lg font-bold mb-2">Ничего не найдено</h3>
  <p className="text-sm text-content-tertiary mb-6">
    Попробуйте изменить параметры поиска
  </p>
  <Button variant="secondary" onClick={clearFilters}>
    Очистить фильтры
  </Button>
</div>
```

---

## Загрузка данных

### Skeleton экраны

```tsx
// Список документов
function DocumentListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i}>
          <div className="flex items-center gap-4">
            <Skeleton variant="circle" size={40} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Карточка профиля
function ProfileSkeleton() {
  return (
    <Card>
      <div className="flex items-start gap-4">
        <Skeleton variant="circle" size={64} />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="rect" width={120} height={36} />
        </div>
      </div>
    </Card>
  );
}
```

### Индикатор загрузки

```tsx
{isLoading ? (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader2 className="animate-spin text-brand-primary mb-4" size={48} />
    <p className="text-sm text-content-tertiary">Загрузка...</p>
  </div>
) : (
  <DataContent />
)}
```

---

## Фильтры

### Панель фильтров

```tsx
function FilterPanel({ filters, onChange }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">Фильтры</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Сбросить
        </Button>
      </div>
      
      <div className="space-y-4">
        <Select 
          label="Статус"
          options={statusOptions}
          value={filters.status}
          onChange={e => onChange('status', e.target.value)}
          fullWidth
        />
        
        <Input 
          label="Поиск"
          icon={<Search />}
          value={filters.search}
          onChange={e => onChange('search', e.target.value)}
          fullWidth
        />
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Категория
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Chip 
                key={cat.id}
                label={cat.name}
                active={filters.category === cat.id}
                onClick={() => onChange('category', cat.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
```

---

**Используйте эти паттерны как основу для своих решений!** 🎨

