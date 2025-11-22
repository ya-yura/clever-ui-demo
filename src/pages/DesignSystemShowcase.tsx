import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Bell, 
  Check, 
  ChevronRight, 
  MoreHorizontal,
  Settings,
  Home,
  Sun,
  Moon,
  Mail,
  User,
  FileText,
  Edit2,
  Trash2,
  Plus,
  X,
  AlertCircle,
  Info as InfoIcon,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// Import ALL components from Design System
import {
  Button,
  IconButton,
  Card,
  Badge,
  Chip,
  Avatar,
  ProgressBar,
  Input,
  Checkbox,
  Toggle,
  Select,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  Tabs,
  List,
  ListItem,
  Divider,
  Modal,
  Toast,
  Tooltip,
} from '@/design/components';

const DesignSystemShowcase: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [toggleState, setToggleState] = useState(false);
  const [checkboxState, setCheckboxState] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [selectValue, setSelectValue] = useState('option1');

  const tabs = [
    { id: 'home', label: 'Главная', icon: <Home size={16} /> },
    { id: 'docs', label: 'Документы', icon: <FileText size={16} />, badge: 3 },
    { id: 'settings', label: 'Настройки', icon: <Settings size={16} /> },
  ];

  const selectOptions = [
    { value: 'option1', label: 'Опция 1' },
    { value: 'option2', label: 'Опция 2' },
    { value: 'option3', label: 'Опция 3' },
  ];

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary p-8 pb-32 font-sans transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-surface-tertiary gap-4">
          <div>
            <h1 className="text-4xl font-bold text-content-primary mb-2 tracking-tight">Design System v2.0</h1>
            <p className="text-content-secondary text-lg">Cleverence Warehouse Mobile • 19 компонентов</p>
          </div>
          <div className="flex gap-3">
            <Tooltip content={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}>
              <IconButton 
                icon={theme === 'dark' ? <Sun /> : <Moon />}
                variant="ghost"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              />
            </Tooltip>
            <Button variant="secondary" onClick={() => navigate('/')} startIcon={<Home size={18} />}>
              На главную
            </Button>
          </div>
        </header>

        {/* 1. Buttons & IconButtons */}
        <section className="space-y-6">
          <SectionHeader title="01. Buttons & IconButtons" description="Кнопки и иконочные кнопки" />

          <Card className="space-y-8">
            {/* Standard Buttons */}
            <div className="space-y-4">
              <h4 className="text-sm text-content-tertiary font-bold uppercase">Стандартные кнопки</h4>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="primary" disabled>Disabled</Button>
                <Button variant="primary" isLoading>Loading</Button>
              </div>
            </div>

            {/* With Icons */}
            <div className="space-y-4">
              <h4 className="text-sm text-content-tertiary font-bold uppercase">С иконками</h4>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary" startIcon={<Check size={18} />}>Подтвердить</Button>
                <Button variant="secondary" startIcon={<Settings size={18} />}>Настройки</Button>
                <Button variant="ghost" endIcon={<ChevronRight size={18} />}>Далее</Button>
              </div>
            </div>

            {/* Icon Buttons */}
            <div className="space-y-4">
              <h4 className="text-sm text-content-tertiary font-bold uppercase">IconButtons</h4>
              <div className="flex flex-wrap gap-4 items-center">
                <IconButton icon={<Search />} variant="default" />
                <IconButton icon={<Bell />} variant="primary" badge={5} />
                <IconButton icon={<Settings />} variant="ghost" />
                <IconButton icon={<Trash2 />} variant="danger" />
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-4">
              <h4 className="text-sm text-content-tertiary font-bold uppercase">Размеры</h4>
              <div className="flex flex-wrap gap-4 items-center">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <IconButton icon={<Search />} size="sm" />
                <IconButton icon={<Search />} size="md" />
                <IconButton icon={<Search />} size="lg" />
              </div>
            </div>
          </Card>
        </section>

        {/* 2. Cards & Divider */}
        <section className="space-y-6">
          <SectionHeader title="02. Cards & Dividers" description="Контейнеры и разделители" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <h4 className="text-lg font-bold mb-2">Base Card</h4>
              <p className="text-content-secondary text-sm">Базовая карточка</p>
            </Card>

            <Card variant="elevated">
              <h4 className="text-lg font-bold mb-2 text-brand-primary">Elevated</h4>
              <p className="text-content-secondary text-sm">С тенью</p>
            </Card>

            <Card variant="interactive">
              <h4 className="text-lg font-bold mb-2">Interactive</h4>
              <Badge label="Кликабельная" variant="success" />
            </Card>
          </div>

          <Card>
            <h4 className="font-bold mb-4">Divider примеры</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-2">Горизонтальный:</p>
                <Divider />
              </div>
              
              <div>
                <p className="text-sm mb-2">С лейблом:</p>
                <Divider label="ИЛИ" />
              </div>

              <div>
                <p className="text-sm mb-2">Вертикальный:</p>
                <div className="flex items-center gap-4">
                  <span>Левая часть</span>
                  <Divider orientation="vertical" />
                  <span>Правая часть</span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* 3. Tabs */}
        <section className="space-y-6">
          <SectionHeader title="03. Tabs" description="Навигация по вкладкам" />

          <Card className="space-y-6">
            <div>
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-4">Default</h4>
              <Tabs 
                tabs={tabs}
                activeTab={activeTab}
                onChange={setActiveTab}
                variant="default"
              />
            </div>

            <div>
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-4">Pills</h4>
              <Tabs 
                tabs={tabs}
                activeTab={activeTab}
                onChange={setActiveTab}
                variant="pills"
              />
            </div>

            <div>
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-4">Underline</h4>
              <Tabs 
                tabs={tabs}
                activeTab={activeTab}
                onChange={setActiveTab}
                variant="underline"
              />
            </div>
          </Card>
        </section>

        {/* 4. Lists */}
        <section className="space-y-6">
          <SectionHeader title="04. Lists" description="Списки элементов" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h4 className="font-bold mb-4">Базовый список</h4>
              <List>
                <ListItem title="Элемент 1" />
                <ListItem title="Элемент 2" subtitle="С описанием" />
                <ListItem title="Элемент 3" />
              </List>
            </Card>

            <Card>
              <h4 className="font-bold mb-4">С иконками</h4>
              <List>
                <ListItem 
                  title="Главная"
                  icon={<Home size={20} />}
                  showChevron
                />
                <ListItem 
                  title="Настройки"
                  subtitle="Конфигурация приложения"
                  icon={<Settings size={20} />}
                  showChevron
                />
                <ListItem 
                  title="Профиль"
                  icon={<User size={20} />}
                  active
                />
              </List>
            </Card>
          </div>
        </section>

        {/* 5. Form Elements */}
        <section className="space-y-6">
          <SectionHeader title="05. Form Elements" description="Элементы форм" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Inputs & Select */}
            <Card className="space-y-6">
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-4">Input & Select</h4>
              
              <Input 
                label="Email"
                type="email" 
                placeholder="user@example.com"
                icon={<Mail size={18} />}
                fullWidth
              />

              <Input 
                label="Поиск"
                type="text" 
                placeholder="Найти..."
                icon={<Search size={18} />}
                fullWidth
              />

              <Select 
                label="Выберите опцию"
                options={selectOptions}
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                fullWidth
              />

              <Input 
                label="Disabled"
                type="text" 
                disabled
                value="Нельзя редактировать" 
                fullWidth
              />
            </Card>

            {/* Controls */}
            <Card className="space-y-6">
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-4">Checkbox & Toggle</h4>
              
              <div className="space-y-4">
                <Checkbox 
                  label="Согласен с условиями"
                  checked={checkboxState}
                  onChange={(e) => setCheckboxState(e.target.checked)}
                />

                <Checkbox 
                  label="Получать уведомления"
                  checked={false}
                  onChange={() => {}}
                />

                <Checkbox 
                  label="Отключено"
                  checked={false}
                  disabled
                  onChange={() => {}}
                />
              </div>

              <Divider spacing="sm" />

              <div className="space-y-4">
                <Toggle 
                  label="Уведомления"
                  checked={toggleState}
                  onChange={(e) => setToggleState(e.target.checked)}
                />

                <Toggle 
                  label="Тёмная тема"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                />

                <Toggle 
                  label="Отключено"
                  checked={false}
                  disabled
                  onChange={() => {}}
                />
              </div>
            </Card>
          </div>
        </section>

        {/* 6. Overlays (Modal, Toast, Tooltip) */}
        <section className="space-y-6">
          <SectionHeader title="06. Overlays" description="Modal, Toast, Tooltip" />

          <Card className="space-y-6">
            <div>
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-4">Modal</h4>
              <Button onClick={() => setIsModalOpen(true)}>
                Открыть модальное окно
              </Button>
            </div>

            <Divider />

            <div>
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-4">Toast</h4>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="primary"
                  size="sm"
                  onClick={() => setShowToast(true)}
                >
                  Показать Toast
                </Button>
              </div>
            </div>

            <Divider />

            <div>
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-4">Tooltip</h4>
              <div className="flex flex-wrap gap-4">
                <Tooltip content="Подсказка сверху" position="top">
                  <Button variant="secondary">Наведите (top)</Button>
                </Tooltip>
                
                <Tooltip content="Подсказка справа" position="right">
                  <Button variant="secondary">Наведите (right)</Button>
                </Tooltip>
                
                <Tooltip content="Подсказка снизу" position="bottom">
                  <Button variant="secondary">Наведите (bottom)</Button>
                </Tooltip>
                
                <Tooltip content="Подсказка слева" position="left">
                  <Button variant="secondary">Наведите (left)</Button>
                </Tooltip>
              </div>
            </div>
          </Card>
        </section>

        {/* 7. UI Elements */}
        <section className="space-y-6">
          <SectionHeader title="07. UI Elements" description="Badge, Avatar, Chip, Progress" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <Card className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-sm text-content-tertiary font-bold uppercase">Avatars</h4>
                <div className="flex items-center gap-4">
                  <Avatar size="xs" name="User" />
                  <Avatar size="sm" name="AB" />
                  <Avatar size="md" name="CD" status="online" />
                  <Avatar size="lg" name="EF" />
                  <Avatar size="xl" name="GH" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm text-content-tertiary font-bold uppercase">Badges</h4>
                <div className="flex flex-wrap gap-3">
                  <Badge label="Success" variant="success" />
                  <Badge label="Warning" variant="warning" />
                  <Badge label="Error" variant="error" />
                  <Badge label="Info" variant="info" />
                  <Badge label="Neutral" variant="neutral" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm text-content-tertiary font-bold uppercase">Chips</h4>
                <div className="flex flex-wrap gap-2">
                  <Chip label="Inactive" />
                  <Chip label="Active" active />
                  <Chip label="Primary" variant="primary" active />
                  <Chip label="Success" variant="success" active />
                  <Chip label="Error" variant="error" active />
                </div>
              </div>
            </Card>

            <Card className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-sm text-content-tertiary font-bold uppercase">Progress Bar</h4>
                
                <div className="space-y-4">
                  <ProgressBar value={25} showLabel />
                  <ProgressBar value={50} variant="primary" showLabel />
                  <ProgressBar value={75} variant="warning" showLabel />
                  <ProgressBar value={100} variant="success" showLabel />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm text-content-tertiary font-bold uppercase">Skeleton</h4>
                <div className="space-y-3">
                  <Skeleton variant="text" width="60%" />
                  <SkeletonText lines={3} />
                  <Skeleton variant="circle" size={48} />
                  <Skeleton variant="rect" width="100%" height={100} />
                </div>
              </div>
            </Card>

          </div>
        </section>

        {/* 8. Typography */}
        <section className="space-y-6">
          <SectionHeader title="08. Typography" description="Типографическая шкала" />
          
          <Card noPadding className="overflow-hidden">
            <div className="p-8 space-y-6">
              <TypeSpecimen size="text-4xl" label="4XL" weight="font-bold" sizeLabel="48px" />
              <TypeSpecimen size="text-3xl" label="3XL" weight="font-bold" sizeLabel="36px" />
              <TypeSpecimen size="text-2xl" label="2XL" weight="font-bold" sizeLabel="32px" />
              <TypeSpecimen size="text-xl" label="XL" weight="font-bold" sizeLabel="24px" />
              <TypeSpecimen size="text-lg" label="LG" weight="font-semibold" sizeLabel="20px" />
              <TypeSpecimen size="text-base" label="Base" weight="font-normal" sizeLabel="16px" />
              <TypeSpecimen size="text-sm" label="SM" weight="font-normal" sizeLabel="12px" />
              <TypeSpecimen size="text-xs" label="XS" weight="font-normal" sizeLabel="10px" />
            </div>
          </Card>
        </section>

        {/* 9. Colors */}
        <section className="space-y-6">
          <SectionHeader title="09. Colors" description="Цветовая палитра" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase text-content-tertiary">Brand</h4>
              <ColorCard name="Primary" hex="#daa420" bg="bg-brand-primary" text="text-brand-primaryDark" />
              <ColorCard name="Secondary" hex="#86e0cb" bg="bg-brand-secondary" text="text-brand-secondaryDark" />
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase text-content-tertiary">Status</h4>
              <ColorCard name="Success" hex="#91ed91" bg="bg-status-success" text="text-status-successDark" />
              <ColorCard name="Warning" hex="#f3a361" bg="bg-status-warning" text="text-status-warningDark" />
              <ColorCard name="Error" hex="#ba8f8e" bg="bg-status-error" text="text-status-errorDark" />
              <ColorCard name="Info" hex="#86e0cb" bg="bg-status-info" text="text-status-infoDark" />
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase text-content-tertiary">Surface</h4>
              <ColorCard name="Primary" hex="#242424" bg="bg-surface-primary" />
              <ColorCard name="Secondary" hex="#343436" bg="bg-surface-secondary" />
              <ColorCard name="Tertiary" hex="#474747" bg="bg-surface-tertiary" />
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase text-content-tertiary">Content</h4>
              <ColorCard name="Primary" hex="#ffffff" bg="bg-content-primary" text="text-content-inverse" />
              <ColorCard name="Secondary" hex="#e3e3dd" bg="bg-content-secondary" text="text-content-inverse" />
              <ColorCard name="Tertiary" hex="#a7a7a7" bg="bg-content-tertiary" text="text-content-inverse" />
            </div>
          </div>
        </section>

      </div>

      {/* Modal Demo */}
      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Пример модального окна"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-content-secondary">
            Это демонстрация модального окна. Здесь может быть любой контент.
          </p>
          
          <Input 
            label="Введите текст"
            placeholder="Пример поля ввода в модальном окне"
            fullWidth
          />
        </div>
        
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(false)}>
            Подтвердить
          </Button>
        </div>
      </Modal>

      {/* Toast Demo */}
      {showToast && (
        <Toast 
          message="Это уведомление Toast!"
          variant="success"
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

/* --- Helper Components --- */

const SectionHeader = ({ title, description }: { title: string, description: string }) => (
  <div className="border-l-4 border-brand-primary pl-4">
    <h2 className="text-2xl font-bold text-content-primary">{title}</h2>
    <p className="text-content-secondary">{description}</p>
  </div>
);

const ColorCard = ({ name, hex, bg, text = "text-content-primary" }: { name: string, hex: string, bg: string, text?: string }) => (
  <div className={`${bg} ${text} p-4 rounded-lg flex flex-col justify-between h-20 shadow-sm`}>
    <span className="font-bold text-sm">{name}</span>
    <span className="font-mono text-xs opacity-80 uppercase">{hex}</span>
  </div>
);

const TypeSpecimen = ({ size, label, weight, sizeLabel }: any) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-surface-tertiary pb-4 last:border-0 last:pb-0">
    <div className={`${size} ${weight} text-content-primary mb-2 md:mb-0`}>
      The quick brown fox
    </div>
    <div className="text-xs font-mono text-content-tertiary flex gap-4">
      <span>{label}</span>
      <span>{sizeLabel}</span>
      <span className="opacity-50">{weight}</span>
    </div>
  </div>
);

export default DesignSystemShowcase;
