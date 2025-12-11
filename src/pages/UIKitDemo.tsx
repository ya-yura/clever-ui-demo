/**
 * 🎨 UI KIT DEMO
 * Визуальный каталог всех UI-компонентов
 * Демонстрация паттернов Джеки Рида в действии
 */

import React, { useState } from 'react';
import {
  StatusIcon,
  MicroHint,
  ErrorHint,
  ProgressBar,
  ProgressStats,
  ActionScreen,
  ScannerScreen,
  DocumentHeader,
  ChunkedList,
  ItemCard,
  SwipeableRow,
  Reveal,
  Breadcrumbs,
  statusColors,
  StatusType,
  ScanResult,
} from '@/ui';
import { microcopy } from '@/ui/microcopy';

export const UIKitDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basics' | 'composite' | 'patterns'>('basics');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-900">UI Kit — Склад-15</h1>
          <p className="text-gray-600 mt-1">
            Компоненты на основе паттернов коммуникации Джеки Рида
          </p>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 border-b">
            <TabButton
              active={activeTab === 'basics'}
              onClick={() => setActiveTab('basics')}
            >
              Базовые
            </TabButton>
            <TabButton
              active={activeTab === 'composite'}
              onClick={() => setActiveTab('composite')}
            >
              Составные
            </TabButton>
            <TabButton
              active={activeTab === 'patterns'}
              onClick={() => setActiveTab('patterns')}
            >
              Паттерны
            </TabButton>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'basics' && <BasicsSection />}
        {activeTab === 'composite' && <CompositeSection />}
        {activeTab === 'patterns' && <PatternsSection />}
      </div>
    </div>
  );
};

// === БАЗОВЫЕ КОМПОНЕНТЫ ===
const BasicsSection: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Status Colors */}
      <Section title="Система статусов" subtitle="Цвет = Статус">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(statusColors).map(([key, colors]) => (
            <div
              key={key}
              className={`p-4 rounded-lg border-l-4 ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <StatusIcon status={key as StatusType} size="sm" />
                <span className={`font-bold ${colors.text}`}>
                  {getStatusName(key as StatusType)}
                </span>
              </div>
              <p className="text-xs text-gray-600">{key}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Status Icons */}
      <Section title="StatusIcon" subtitle="Визуальные индикаторы">
        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-center gap-2">
            <StatusIcon status="success" size="lg" />
            <span className="text-sm">Large</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <StatusIcon status="error" size="md" />
            <span className="text-sm">Medium</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <StatusIcon status="inProgress" size="sm" showPulse={true} />
            <span className="text-sm">Pulse</span>
          </div>
        </div>
      </Section>

      {/* MicroHint */}
      <Section title="MicroHint" subtitle="Контекстные подсказки">
        <div className="space-y-3">
          <MicroHint message="Сканируйте следующий товар" status="pending" />
          <MicroHint message="Отлично! Продолжайте" status="success" />
          <MicroHint message="Проверьте количество" status="warning" />
        </div>
      </Section>

      {/* ErrorHint */}
      <Section title="ErrorHint" subtitle="Error-as-Guidance">
        <ErrorHint
          error="Товар не найден в документе"
          guidance="Проверьте штрихкод или выберите из списка"
        />
      </Section>

      {/* ProgressBar */}
      <Section title="ProgressBar" subtitle="Визуализация прогресса">
        <div className="space-y-4">
          <ProgressBar current={3} total={10} />
          <ProgressBar current={7} total={10} height="lg" />
          <ProgressBar current={10} total={10} />
        </div>
      </Section>

      {/* ProgressStats */}
      <Section title="ProgressStats" subtitle="Детальная статистика">
        <ProgressStats
          completed={7}
          total={10}
          inProgress={2}
          errors={1}
        />
      </Section>
    </div>
  );
};

// === СОСТАВНЫЕ КОМПОНЕНТЫ ===
const CompositeSection: React.FC = () => {
  const [showScanner, setShowScanner] = useState(false);

  const handleScan = async (code: string): Promise<ScanResult> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      message: `Товар "${code}" добавлен`,
    };
  };

  return (
    <div className="space-y-12">
      {/* DocumentHeader */}
      <Section title="DocumentHeader" subtitle="First Glance Understanding">
        <DocumentHeader
          documentType="Приёмка"
          documentNumber="RCV-12345"
          completed={7}
          total={10}
          nextAction="Сканируйте следующий товар"
          date={new Date()}
          partner="Иван Иванов"
        />
      </Section>

      {/* ItemCard */}
      <Section title="ItemCard" subtitle="Карточка товара">
        <div className="space-y-3">
          <ItemCard
            name="Телевизор Samsung 55"
            barcode="1234567890123"
            article="TV-SAM-55"
            expected={10}
            scanned={7}
            cell="A-01-05"
            showProgress={true}
          />
          <ItemCard
            name="Клавиатура Logitech"
            barcode="9876543210987"
            expected={5}
            scanned={5}
            status="success"
          />
        </div>
      </Section>

      {/* SwipeableRow */}
      <Section title="SwipeableRow" subtitle="Свайп-действия">
        <SwipeableRow
          onSwipeLeft={() => alert('Уменьшено')}
          onSwipeRight={() => alert('Увеличено')}
          leftAction={{
            icon: '−',
            label: 'Уменьшить',
            color: 'bg-red-500',
          }}
          rightAction={{
            icon: '+',
            label: 'Увеличить',
            color: 'bg-green-500',
          }}
        >
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="font-medium">Свайпните влево или вправо</p>
            <p className="text-sm text-gray-600">Попробуйте перетащить эту карточку</p>
          </div>
        </SwipeableRow>
      </Section>

      {/* Reveal */}
      <Section title="Reveal" subtitle="Progressive Disclosure">
        <Reveal
          trigger={
            <div className="font-medium text-gray-900">
              Показать дополнительную информацию
            </div>
          }
        >
          <div className="text-gray-600 space-y-2">
            <p>Эта информация скрыта по умолчанию</p>
            <p>Показывается только при необходимости</p>
            <p>Снижает когнитивную нагрузку</p>
          </div>
        </Reveal>
      </Section>

      {/* Breadcrumbs */}
      <Section title="Breadcrumbs" subtitle="Контекстная навигация">
        <Breadcrumbs
          items={[
            { label: 'Приёмка', path: '/receiving' },
            { label: 'RCV-12345', path: '/receiving/RCV-12345' },
            { label: 'Сканирование' },
          ]}
        />
      </Section>

      {/* ActionScreen Demo */}
      <Section title="ActionScreen" subtitle="Signal → Action → Feedback">
        <button
          onClick={() => alert('ActionScreen demo')}
          className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition"
        >
          Открыть ActionScreen Demo
        </button>
      </Section>

      {/* ScannerScreen Demo */}
      <Section title="ScannerScreen" subtitle="Универсальное сканирование">
        {!showScanner ? (
          <button
            onClick={() => setShowScanner(true)}
            className="w-full bg-green-500 text-white py-4 rounded-xl font-bold hover:bg-green-600 transition"
          >
            Открыть ScannerScreen Demo
          </button>
        ) : (
          <div className="relative h-96 bg-white rounded-xl overflow-hidden">
            <ScannerScreen
              signalText="Демо сканирования"
              signalSubtext="Введите любой код"
              onScan={handleScan}
            />
            <button
              onClick={() => setShowScanner(false)}
              className="absolute top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg"
            >
              Закрыть
            </button>
          </div>
        )}
      </Section>
    </div>
  );
};

// === ПАТТЕРНЫ ===
const PatternsSection: React.FC = () => {
  return (
    <div className="space-y-12">
      <Section
        title="Signal → Action → Feedback"
        subtitle="Джеки Рид: Паттерн коммуникации #1"
      >
        <div className="bg-white rounded-xl p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 text-blue-700 w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Signal (Сигнал)</h4>
              <p className="text-gray-600">Что нужно сделать сейчас</p>
              <div className="mt-2 p-3 bg-gray-50 rounded">
                "Сканируйте товар из документа"
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-green-100 text-green-700 w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Action (Действие)</h4>
              <p className="text-gray-600">Явная зона взаимодействия</p>
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Отсканируйте штрихкод..."
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-purple-100 text-purple-700 w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Feedback (Обратная связь)</h4>
              <p className="text-gray-600">Мгновенная реакция системы</p>
              <div className="mt-2">
                <MicroHint message="✅ Товар добавлен!" status="success" />
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Chunking"
        subtitle="Группировка информации"
      >
        <div className="bg-white rounded-xl p-6">
          <p className="text-gray-600 mb-4">
            Разбивка больших списков на управляемые блоки
          </p>
          <ChunkedList
            groups={[
              {
                title: 'Требуют внимания',
                badge: 2,
                items: [
                  { id: '1', content: <div className="p-3 bg-red-50 rounded">Документ 1</div> },
                  { id: '2', content: <div className="p-3 bg-red-50 rounded">Документ 2</div> },
                ],
              },
              {
                title: 'В работе',
                badge: 3,
                items: [
                  { id: '3', content: <div className="p-3 bg-yellow-50 rounded">Документ 3</div> },
                  { id: '4', content: <div className="p-3 bg-yellow-50 rounded">Документ 4</div> },
                  { id: '5', content: <div className="p-3 bg-yellow-50 rounded">Документ 5</div> },
                ],
              },
            ]}
          />
        </div>
      </Section>

      <Section
        title="Microcopy"
        subtitle="Направляющий текст"
      >
        <div className="bg-white rounded-xl p-6 space-y-4">
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Приёмка</h4>
            <div className="space-y-2 text-sm">
              <p className="p-2 bg-gray-50 rounded">{microcopy.receiving.scan}</p>
              <p className="p-2 bg-gray-50 rounded">{microcopy.receiving.scanNext}</p>
              <p className="p-2 bg-gray-50 rounded">{microcopy.receiving.completed}</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">Подбор</h4>
            <div className="space-y-2 text-sm">
              <p className="p-2 bg-gray-50 rounded">{microcopy.picking.scan}</p>
              <p className="p-2 bg-gray-50 rounded">{microcopy.picking.scanCell}</p>
              <p className="p-2 bg-gray-50 rounded">{microcopy.picking.completed}</p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

// === ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ===
const Section: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-6 py-3 font-medium transition-all
        ${active
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-600 hover:text-gray-900'
        }
      `}
    >
      {children}
    </button>
  );
};

function getStatusName(status: StatusType): string {
  const names: Record<StatusType, string> = {
    success: 'Успешно',
    error: 'Ошибка',
    warning: 'Предупреждение',
    pending: 'Ожидает',
    inProgress: 'В работе',
    neutral: 'Нейтральный',
  };
  return names[status];
}

export default UIKitDemo;

