import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/services/db';
import { useDocumentLogic } from '@/hooks/useDocumentLogic';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';
import { LineCard } from '@/components/LineCard';
import { CompletenessCheck } from '@/components/shipment/CompletenessCheck';
import { TTNInput } from '@/components/shipment/TTNInput';
import { Package, Truck, FileText, CheckCircle, AlertTriangle, Printer } from 'lucide-react';
import { Button } from '@/design/components';
import { feedback } from '@/utils/feedback';

/**
 * МОДУЛЬ ОТГРУЗКИ
 * 
 * Процесс:
 * 1. Открытие документа отгрузки
 * 2. Проверка позиций (все ли подобрано)
 * 3. Ввод данных ТТН и перевозчика
 * 4. Финальная проверка комплектности
 * 5. Предложение печати документов
 * 6. Завершение отгрузки
 */
const Shipment: React.FC = () => {
  const { id, docId } = useParams();
  const documentId = docId || id;
  const navigate = useNavigate();
  const { setDocumentInfo, setListInfo } = useDocumentHeader();

  // Состояния UI
  const [showCompletenessCheck, setShowCompletenessCheck] = useState(false);
  const [showTTNInput, setShowTTNInput] = useState(false);
  const [showLineCard, setShowLineCard] = useState(false);
  const [selectedLine, setSelectedLine] = useState<any | null>(null);
  const [showPrintPrompt, setShowPrintPrompt] = useState(false);

  // Данные отгрузки
  const [ttnNumber, setTTNNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [readyToShip, setReadyToShip] = useState(false);

  // Логика документа
  const {
    document,
    lines,
    loading,
    finishDocument,
    setActiveLine,
  } = useDocumentLogic({
    docType: 'shipment',
    docId: documentId,
    onComplete: () => {
      feedback.success('✅ Отгрузка завершена');
      navigate('/docs/Otgruzka');
    },
  });

  // Заголовок
  useEffect(() => {
    if (documentId && document) {
      setDocumentInfo({
        documentId: document.id,
        completed: document.completedLines || 0,
        total: document.totalLines || 0,
      });
    } else {
      setDocumentInfo(null);
      setListInfo({ title: 'Отгрузка', count: 0 });
    }
    return () => {
      setDocumentInfo(null);
      setListInfo(null);
    };
  }, [documentId, document, setDocumentInfo, setListInfo]);

  // Загрузка сохранённых данных ТТН
  useEffect(() => {
    if (document) {
      setTTNNumber(document.ttnNumber || '');
      setCarrier(document.carrier || '');
    }
  }, [document]);

  // Автоматическая проверка комплектности при открытии
  useEffect(() => {
    if (document && lines.length > 0 && document.status !== 'completed') {
      // Проверяем, есть ли недостающие позиции
      const incomplete = lines.filter(l => l.quantityFact < l.quantityPlan);
      
      // Если есть недостающие позиции и документ только открыт, показываем подсказку
      if (incomplete.length > 0) {
        const timer = setTimeout(() => {
          feedback.warning(`⚠️ Не хватает ${incomplete.length} позиций`);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [document, lines]);

  // US IV.1: Проверка комплектности
  const checkCompleteness = () => {
    setShowCompletenessCheck(true);
  };

  // US IV.2: Подтверждение комплектности → запрос ТТН
  const handleCompletenessConfirm = () => {
    setShowCompletenessCheck(false);
    
    // Если данные уже введены, пропускаем ввод
    if (ttnNumber && carrier) {
      setReadyToShip(true);
      feedback.success('Готово к отгрузке');
    } else {
      setShowTTNInput(true);
    }
  };

  // US IV.3: Сохранение ТТН и перевозчика
  const handleTTNSubmit = async (data: { ttnNumber: string; carrier: string }) => {
    setTTNNumber(data.ttnNumber);
    setCarrier(data.carrier);
    setShowTTNInput(false);

    // Сохраняем в документ
    if (document) {
      await db.shipmentDocuments.update(document.id, {
        ttnNumber: data.ttnNumber,
        carrier: data.carrier,
        updatedAt: Date.now(),
      });
    }

    setReadyToShip(true);
    feedback.success(`ТТН ${data.ttnNumber} (${data.carrier})`);
  };

  // US IV.4: Завершение отгрузки
  const handleShip = async () => {
    if (!ttnNumber || !carrier) {
      feedback.error('Сначала введите данные ТТН');
      setShowTTNInput(true);
      return;
    }

    // Финальная проверка
    const incompleteLines = lines.filter(l => l.quantityFact < l.quantityPlan);
    if (incompleteLines.length > 0) {
      if (!confirm(`Неполная комплектность (${incompleteLines.length} позиций).\n\nОтгрузить всё равно?`)) {
        return;
      }
    }

    // US IV.5: Предложение печати
    setShowPrintPrompt(true);
  };

  // US IV.6: Печать и завершение
  const handlePrintAndFinish = async (print: boolean) => {
    setShowPrintPrompt(false);

    if (print) {
      // Симуляция печати
      feedback.info('Отправка на печать...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      feedback.success('Документы распечатаны');
    }

    // Завершаем документ
    await finishDocument(true);
  };

  const handleLineClick = (line: any) => {
    setSelectedLine(line);
    setShowLineCard(true);
  };

  // Рендер загрузки
  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-primary rounded-full border-t-transparent mx-auto"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-10 text-center">
        <div className="text-error mb-4">Документ не найден</div>
        <Button onClick={() => navigate('/docs/Otgruzka')}>
          Вернуться к списку
        </Button>
      </div>
    );
  }

  const completedLines = lines.filter(l => l.quantityFact >= l.quantityPlan);
  const incompleteLines = lines.filter(l => l.quantityFact < l.quantityPlan);
  const isComplete = incompleteLines.length === 0;

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-var(--header-height))]">
        {/* Главный экран */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 pb-12">
          {/* Заголовок документа */}
          <div className="doc-header">
            <div className="flex items-center gap-2 mb-1.5">
              <Truck size={20} className="text-brand-primary" />
              <div>
                <h2 className="text-sm font-bold leading-tight">{document.id}</h2>
                {document.customer && (
                  <p className="text-[11px] text-content-secondary leading-tight">
                    Клиент: {document.customer}
                  </p>
                )}
              </div>
            </div>

            {/* Статус */}
            <div className={`status-badge ${
              document.status === 'completed'
                ? 'status-badge-completed'
                : document.status === 'in_progress'
                ? 'status-badge-warning'
                : 'bg-surface-tertiary text-content-secondary'
            }`}>
              {document.status === 'completed' ? 'ОТГРУЖЕНО' : 
               document.status === 'in_progress' ? 'В РАБОТЕ' : 'НОВЫЙ'}
            </div>
          </div>

          {/* US IV.1: Проверка комплектности */}
          <div className="bg-surface-secondary rounded-lg p-2.5 space-y-1.5">
            <div className="text-[10px] text-brand-primary font-semibold uppercase">Next action</div>
            <h3 className="font-bold text-sm">Комплектность заказа</h3>
            
            <div className="grid grid-cols-2 gap-1.5">
              <div className="stat-chip stat-chip-success">
                <div className="text-[11px] mb-0.5">Готово</div>
                <div className="text-lg font-bold leading-tight">{completedLines.length}</div>
              </div>
              <div className="stat-chip stat-chip-warning">
                <div className="text-[11px] mb-0.5">Не хватает</div>
                <div className="text-lg font-bold leading-tight">{incompleteLines.length}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {isComplete ? (
                <>
                  <CheckCircle size={14} className="text-success" />
                  <span className="text-success font-semibold">Заказ полностью укомплектован</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={14} className="text-warning" />
                  <span className="text-warning font-semibold">
                    Не хватает {incompleteLines.length} {incompleteLines.length === 1 ? 'позиции' : 'позиций'}
                  </span>
                </>
              )}
            </div>

            {/* Подсказка - список недостающих товаров */}
            {incompleteLines.length > 0 && incompleteLines.length <= 3 && (
              <div className="bg-warning/10 border border-warning rounded-lg p-2 space-y-0.5">
                <div className="text-[11px] font-bold text-warning-dark mb-0.5">Забыли:</div>
                {incompleteLines.map((line) => (
                  <div key={line.id} className="text-[11px] text-warning-dark flex items-center gap-1.5">
                    <span className="flex-1 truncate">• {line.productName}</span>
                    <span className="font-bold text-xs">-{line.quantityPlan - line.quantityFact}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={checkCompleteness}
              className="w-full py-2 bg-brand-primary hover:brightness-110 text-white rounded-lg font-semibold text-sm transition-all shadow-sm"
            >
              Проверить подробно
            </button>
          </div>

          {/* US IV.2: Данные отгрузки */}
          <div className="bg-surface-secondary rounded-lg p-2.5 space-y-2">
            <h3 className="font-bold text-sm">Данные отгрузки</h3>

            {ttnNumber && carrier ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 p-2 stat-chip-success rounded-lg">
                  <Truck size={16} className="text-success" />
                  <div className="flex-1">
                    <div className="text-[11px]">Перевозчик</div>
                    <div className="text-sm font-bold truncate">{carrier}</div>
                  </div>
                  <CheckCircle size={16} className="text-success" />
                </div>

                <div className="flex items-center gap-1.5 p-2 stat-chip-success rounded-lg">
                  <FileText size={16} className="text-success" />
                  <div className="flex-1">
                    <div className="text-[11px]">ТТН</div>
                    <div className="text-sm font-bold truncate">{ttnNumber}</div>
                  </div>
                  <CheckCircle size={16} className="text-success" />
                </div>

                <button
                  onClick={() => setShowTTNInput(true)}
                  className="w-full py-2 bg-surface-tertiary hover:bg-surface-primary rounded-lg text-sm font-semibold text-brand-primary border border-borders-default transition-colors"
                >
                  Изменить данные
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTTNInput(true)}
                className="w-full py-2.5 bg-brand-primary text-white hover:brightness-110 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <FileText size={16} />
                Ввести ТТН и перевозчика
              </button>
            )}
          </div>

          {/* Список позиций */}
          <div className="space-y-1">
            <h3 className="font-bold text-xs text-content-tertiary uppercase flex items-center gap-1.5">
              <Package size={14} />
              Позиции к отгрузке ({lines.length})
            </h3>
            {lines.map((line) => {
              const isLineComplete = line.quantityFact >= line.quantityPlan;
              
              return (
                <div
                  key={line.id}
                  onClick={() => handleLineClick(line)}
                  className={`card p-2 cursor-pointer hover:border-brand-primary transition-colors border ${
                    isLineComplete ? 'border-success/70 bg-success/5' : 'border-warning/70 bg-warning/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-sm leading-tight truncate">{line.productName}</h4>
                      <p className="text-[11px] text-content-tertiary font-mono leading-tight truncate">{line.barcode}</p>
                    </div>
                    <div className={`status-badge text-[11px] flex items-center gap-1 ${
                      isLineComplete
                        ? 'status-badge-completed'
                        : 'status-badge-warning'
                    }`}>
                      {isLineComplete && <CheckCircle size={12} />}
                      {!isLineComplete && <AlertTriangle size={12} />}
                      {line.quantityFact} / {line.quantityPlan}
                    </div>
                  </div>

                  <div className="mt-1 h-0.5 bg-surface-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isLineComplete ? 'bg-success' : 'bg-warning'
                      }`}
                      style={{ width: `${(line.quantityFact / line.quantityPlan) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Кнопка отгрузки */}
        <div className="bottom-action-bar">
          <Button
            variant={document.status === 'completed' ? 'secondary' : 'primary'}
            className="w-full py-2 text-sm"
            onClick={handleShip}
            disabled={document.status === 'completed'}
          >
            {document.status === 'completed' ? 'Отгружено' : 'Отгрузить'}
          </Button>
        </div>
      </div>

      {/* Диалоги */}
      {showCompletenessCheck && (
        <CompletenessCheck
          lines={lines}
          onClose={() => setShowCompletenessCheck(false)}
          onConfirm={handleCompletenessConfirm}
        />
      )}

      {showTTNInput && (
        <TTNInput
          onSubmit={handleTTNSubmit}
          onCancel={() => setShowTTNInput(false)}
          initialCarrier={carrier}
          initialTTN={ttnNumber}
        />
      )}

      {showLineCard && selectedLine && (
        <LineCard
          line={selectedLine}
          onClose={() => {
            setShowLineCard(false);
            setSelectedLine(null);
          }}
        />
      )}

      {/* US IV.5: Предложение печати */}
      {showPrintPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-primary rounded-2xl max-w-md w-full shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-brand-primary/10 rounded-xl">
                <Printer className="text-brand-primary" size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Печать документов</h2>
                <p className="text-sm text-content-secondary">
                  Распечатать накладную и ТТН?
                </p>
              </div>
            </div>

            <div className="bg-surface-secondary rounded-lg p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-content-secondary">Документ:</span>
                <span className="font-medium">{document.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-secondary">ТТН:</span>
                <span className="font-medium">{ttnNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-secondary">Перевозчик:</span>
                <span className="font-medium">{carrier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-secondary">Позиций:</span>
                <span className="font-medium">{lines.length}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handlePrintAndFinish(true)}
                className="w-full py-3 bg-brand-primary hover:brightness-110 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <Printer size={20} />
                Печать и завершение
              </button>
              <button
                onClick={() => handlePrintAndFinish(false)}
                className="w-full py-3 bg-surface-secondary hover:bg-surface-tertiary rounded-lg font-medium transition-colors"
              >
                Пропустить печать
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Shipment;
