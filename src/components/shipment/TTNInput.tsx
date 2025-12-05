import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/design/components';
import { Truck, FileText, Clock, Zap } from 'lucide-react';

interface TTNInputProps {
  onSubmit: (data: { ttnNumber: string; carrier: string }) => void;
  onCancel: () => void;
  initialCarrier?: string;
  initialTTN?: string;
}

interface TTNTemplate {
  ttnNumber: string;
  carrier: string;
  timestamp: number;
}

/**
 * US IV.2: Ввод ТТН/перевозчика
 * + Автозаполнение по последним шаблонам
 * Компонент для быстрого ввода данных перевозчика и номера ТТН
 */
export const TTNInput: React.FC<TTNInputProps> = ({ 
  onSubmit, 
  onCancel,
  initialCarrier,
  initialTTN 
}) => {
  const [ttnNumber, setTTNNumber] = useState(initialTTN || '');
  const [carrier, setCarrier] = useState(initialCarrier || '');
  const [recentTemplates, setRecentTemplates] = useState<TTNTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const ttnInputRef = useRef<HTMLInputElement>(null);

  const carriers = [
    'СДЭК',
    'Почта России',
    'DHL',
    'FedEx',
    'ПЭК',
    'Деловые Линии',
    'Другое',
  ];

  // Загрузка последних шаблонов из localStorage
  useEffect(() => {
    const loadTemplates = () => {
      try {
        const stored = localStorage.getItem('ttn_templates');
        if (stored) {
          const templates: TTNTemplate[] = JSON.parse(stored);
          // Сортируем по времени (новые первыми) и берем последние 3
          const sorted = templates.sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
          setRecentTemplates(sorted);
          
          // Автозаполнение последним, если поля пустые
          if (sorted.length > 0 && !initialCarrier && !initialTTN) {
            const latest = sorted[0];
            setCarrier(latest.carrier);
            setTTNNumber(''); // ТТН не заполняем автоматически, только перевозчика
          }
        }
      } catch (error) {
        console.error('Failed to load TTN templates:', error);
      }
    };
    
    loadTemplates();
  }, [initialCarrier, initialTTN]);

  // Автофокус на поле ввода ТТН
  useEffect(() => {
    if (ttnInputRef.current) {
      ttnInputRef.current.focus();
    }
  }, []);

  const handleSubmit = () => {
    if (!ttnNumber.trim() || !carrier.trim()) {
      alert('Заполните все поля');
      return;
    }

    // Сохраняем в историю шаблонов
    const newTemplate: TTNTemplate = {
      ttnNumber: ttnNumber.trim(),
      carrier: carrier.trim(),
      timestamp: Date.now(),
    };

    try {
      const stored = localStorage.getItem('ttn_templates');
      const existing: TTNTemplate[] = stored ? JSON.parse(stored) : [];
      
      // Добавляем новый шаблон в начало, ограничиваем до 10
      const updated = [newTemplate, ...existing].slice(0, 10);
      localStorage.setItem('ttn_templates', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save TTN template:', error);
    }

    onSubmit({ ttnNumber: ttnNumber.trim(), carrier: carrier.trim() });
  };

  const handleTemplateSelect = (template: TTNTemplate) => {
    setCarrier(template.carrier);
    setTTNNumber(''); // Не копируем старый номер ТТН
    setShowTemplates(false);
    ttnInputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface-primary rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <Truck className="text-brand-primary" size={32} />
          <h2 className="text-xl font-bold">Данные отгрузки</h2>
        </div>

        <div className="space-y-4">
          {/* Недавние шаблоны */}
          {recentTemplates.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Clock size={14} />
                  Последние использованные
                </label>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="text-xs text-brand-primary hover:underline"
                >
                  {showTemplates ? 'Скрыть' : 'Показать'}
                </button>
              </div>
              
              {showTemplates && (
                <div className="space-y-2 mb-4">
                  {recentTemplates.map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTemplateSelect(template)}
                      className="w-full p-3 bg-brand-primary/5 hover:bg-brand-primary/10 border border-brand-primary/20 rounded-lg text-left transition-all flex items-center gap-2"
                    >
                      <Zap size={16} className="text-brand-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{template.carrier}</div>
                        <div className="text-xs text-content-tertiary truncate">{template.ttnNumber}</div>
                      </div>
                      <div className="text-xs text-content-tertiary">
                        {new Date(template.timestamp).toLocaleDateString('ru-RU', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Перевозчик */}
          <div>
            <label className="block text-sm font-medium mb-2">Перевозчик</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full p-3 border border-borders-default rounded-lg bg-surface-secondary"
            >
              <option value="">Выберите...</option>
              {carriers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* ТТН */}
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <FileText size={16} />
              Номер ТТН
            </label>
            <input
              ref={ttnInputRef}
              type="text"
              value={ttnNumber}
              onChange={(e) => setTTNNumber(e.target.value)}
              placeholder="Введите номер накладной..."
              className="w-full p-3 border border-borders-default rounded-lg bg-surface-secondary"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && ttnNumber && carrier) {
                  handleSubmit();
                }
              }}
            />
            <p className="text-xs text-content-tertiary mt-1">
              Нажмите Enter для быстрого подтверждения
            </p>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={onCancel} className="flex-1">
              Отмена
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Готово
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};






