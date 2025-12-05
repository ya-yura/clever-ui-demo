import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/services/db';
import { useScanner } from '@/hooks/useScanner';
import { useDocumentLogic } from '@/hooks/useDocumentLogic';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';
import ScannerInput from '@/components/ScannerInput';
import { QuantityControl } from '@/components/QuantityControl';
import { LineCard } from '@/components/LineCard';
import { AutoCompletePrompt } from '@/components/AutoCompletePrompt';
import { DiscrepancyAlert } from '@/components/DiscrepancyAlert';
import { RouteVisualization } from '@/components/picking/RouteVisualization';
import { MapPin, Package, CheckCircle, SkipForward, AlertTriangle, Volume2, XCircle, Zap, Navigation } from 'lucide-react';
import { Button } from '@/design/components';
import { feedback } from '@/utils/feedback';
import { VoiceService, speakCell, speakCellCompleted, speakError } from '@/utils/voice';

/**
 * МОДУЛЬ ПОДБОРА
 * 
 * Маршрутизация:
 * - Оптимальный маршрут по ячейкам
 * - Пошаговая навигация
 * - Индикатор прогресса
 * 
 * Сценарии:
 * - Сканировать ячейку → показать товары
 * - Сканировать товар → подобрать
 * - Неправильный товар → ошибка
 * - Ручной ввод количества
 * - Автопереход к следующей ячейке
 * - Пропуск ячейки
 */
const Picking: React.FC = () => {
  const { id, docId } = useParams();
  const documentId = docId || id;
  const navigate = useNavigate();
  const { setDocumentInfo, setListInfo } = useDocumentHeader();

  // Состояние маршрута
  const [currentCellIndex, setCurrentCellIndex] = useState(0);
  const [route, setRoute] = useState<Array<{
    cellId: string;
    cellName: string;
    products: Array<{ id: string; name: string; quantity: number; picked: number }>;
    status: 'pending' | 'current' | 'completed' | 'skipped';
  }>>([]);

  // Состояние сканирования
  const [scannedCell, setScannedCell] = useState<string | null>(null);
  const [awaitingProduct, setAwaitingProduct] = useState(false);

  // Настройки
  const [voiceMode, setVoiceMode] = useState(false);
  const [autoNextMode, setAutoNextMode] = useState(true); // По умолчанию включен

  // UI состояния
  const [showLineCard, setShowLineCard] = useState(false);
  const [selectedLine, setSelectedLine] = useState<any | null>(null);
  const [showAutoComplete, setShowAutoComplete] = useState(false);

  // Логика документа
  const {
    document,
    lines,
    activeLine,
    loading,
    handleScan,
    updateQuantity,
    finishDocument,
    getDiscrepancies,
    showDiscrepancyAlert,
    setShowDiscrepancyAlert,
    setActiveLine,
  } = useDocumentLogic({
    docType: 'picking',
    docId: documentId,
    onComplete: () => {
      feedback.success('✅ Подбор завершён');
      navigate('/docs/PodborZakaza');
    },
  });

  // US III.1: Построение маршрута из строк документа
  useEffect(() => {
    if (lines.length === 0) return;

    // Группируем товары по ячейкам
    const cellMap = new Map<string, typeof lines>();
    
    lines.forEach(line => {
      if (!line.cellId) return;
      
      if (!cellMap.has(line.cellId)) {
        cellMap.set(line.cellId, []);
      }
      cellMap.get(line.cellId)!.push(line);
    });

    // Создаём маршрут
    const routeSteps = Array.from(cellMap.entries()).map(([cellId, products], index) => ({
      cellId,
      cellName: cellId, // TODO: Загрузить имя из справочника ячеек
      products: products.map(p => ({
        id: p.id,
        name: p.productName,
        quantity: p.quantityPlan,
        picked: p.quantityFact,
      })),
      status: (index === 0 ? 'current' : 'pending') as 'pending' | 'current' | 'completed' | 'skipped',
    }));

    setRoute(routeSteps);
  }, [lines]);

  // Обновление статуса текущей ячейки
  useEffect(() => {
    if (route.length === 0) return;

    const updatedRoute = route.map((step, index) => {
      if (index === currentCellIndex) {
        // Проверяем, все ли товары в этой ячейке подобраны
        const allPicked = step.products.every(p => {
          const line = lines.find(l => l.id === p.id);
          return line && line.quantityFact >= line.quantityPlan;
        });

        return {
          ...step,
          status: allPicked ? 'completed' as const : 'current' as const,
          products: step.products.map(p => {
            const line = lines.find(l => l.id === p.id);
            return {
              ...p,
              picked: line?.quantityFact || 0,
            };
          }),
        };
      } else if (index < currentCellIndex) {
        return { ...step, status: step.status === 'skipped' ? 'skipped' as const : 'completed' as const };
      }
      return { ...step, status: 'pending' as const };
    });

    setRoute(updatedRoute);
  }, [lines, currentCellIndex]);

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
      setListInfo({ title: 'Подбор', count: 0 });
    }
    return () => {
      setDocumentInfo(null);
      setListInfo(null);
    };
  }, [documentId, document, setDocumentInfo, setListInfo]);

  // Загрузка голосовых настроек
  useEffect(() => {
    const settings = VoiceService.loadSettings();
    setVoiceMode(settings.enabled);
  }, []);

  // Голосовая подсказка при смене ячейки
  useEffect(() => {
    if (voiceMode && currentCell && !scannedCell) {
      speakCell(currentCell.cellName);
    }
  }, [currentCellIndex, voiceMode, scannedCell]);

  // US III.2: Обработка сканирования ячейки
  const handleCellScan = async (code: string) => {
    const currentCell = route[currentCellIndex];
    
    if (!currentCell) {
      feedback.error('Маршрут не построен');
      if (voiceMode) speakError('Маршрут не построен');
      return;
    }

    // Проверяем, правильная ли ячейка
    if (code !== currentCell.cellId) {
      feedback.error(`⚠️ Неправильная ячейка!\nТребуется: ${currentCell.cellName}\nОтсканирована: ${code}`);
      if (voiceMode) speakError(`Неправильная ячейка. Требуется ${currentCell.cellName}`);
      return;
    }

    // Ячейка правильная
    setScannedCell(code);
    setAwaitingProduct(true);
    feedback.success(`✅ Ячейка ${currentCell.cellName}\nТоваров: ${currentCell.products.length}`);
  };

  // US III.3: Обработка сканирования товара
  const handleProductScan = async (code: string) => {
    if (!scannedCell) {
      feedback.error('Сначала отсканируйте ячейку');
      return;
    }

    const currentCell = route[currentCellIndex];
    
    // Ищем товар в текущей ячейке
    const productInCell = currentCell.products.find(p => {
      const line = lines.find(l => l.id === p.id);
      return line && (line.barcode === code || line.productSku === code);
    });

    if (!productInCell) {
      // Товар не из этой ячейки
      feedback.error('⚠️ Товар не из текущей ячейки!');
      return;
    }

    // Товар правильный, увеличиваем количество
    const line = lines.find(l => l.id === productInCell.id);
    if (!line) return;

    const newQuantity = line.quantityFact + 1;
    await updateQuantity(line.id, 1);

    feedback.success(`${line.productName} (+1)`);

    // Проверяем, все ли товары в ячейке подобраны
    const allPickedInCell = currentCell.products.every(p => {
      const l = lines.find(l => l.id === p.id);
      if (l?.id === line.id) {
        return newQuantity >= l.quantityPlan;
      }
      return l && l.quantityFact >= l.quantityPlan;
    });

    // US III.6: Автопереход к следующей ячейке
    if (allPickedInCell) {
      feedback.success(`✅ Ячейка ${currentCell.cellName} завершена`);
      if (voiceMode) speakCellCompleted(currentCell.cellName);
      
      if (autoNextMode) {
        setTimeout(() => {
          if (currentCellIndex < route.length - 1) {
            handleNextCell();
          } else {
            // Последняя ячейка
            setShowAutoComplete(true);
          }
        }, 800);
      }
    }
  };

  // Быстрое логирование "Нет в ячейке"
  const handleNotInCell = async () => {
    if (!currentCell || !scannedCell) {
      feedback.error('Сначала отсканируйте ячейку');
      return;
    }

    if (!confirm(`Подтвердить отсутствие товаров в ячейке ${currentCell.cellName}?`)) {
      return;
    }

    // Логируем проблему для всех товаров в ячейке
    const problems: any[] = [];
    for (const product of currentCell.products) {
      const line = lines.find(l => l.id === product.id);
      if (line && line.quantityFact < line.quantityPlan) {
        problems.push({
          lineId: line.id,
          productName: line.productName,
          cellName: currentCell.cellName,
          type: 'missing',
          timestamp: Date.now(),
        });
      }
    }

    // Сохраняем в БД проблемы
    try {
      if (problems.length > 0) {
        await db.pickingProblems?.bulkAdd(problems);
      }
      
      feedback.warning(`Зафиксировано отсутствие ${problems.length} позиций`);
      if (voiceMode) speakError(`Товары отсутствуют. Ячейка пропущена.`);
      
      // Пропускаем ячейку
      setRoute(prev => prev.map((step, index) => 
        index === currentCellIndex ? { ...step, status: 'skipped' as const } : step
      ));

      if (currentCellIndex < route.length - 1) {
        handleNextCell();
      }
    } catch (error) {
      console.error('Failed to log problem:', error);
      feedback.error('Ошибка сохранения проблемы');
    }
  };

  // US III.6: Переход к следующей ячейке
  const handleNextCell = () => {
    if (currentCellIndex < route.length - 1) {
      setCurrentCellIndex(prev => prev + 1);
      setScannedCell(null);
      setAwaitingProduct(false);
      const nextCell = route[currentCellIndex + 1];
      feedback.info(`Следующая ячейка: ${nextCell?.cellName}`);
      if (voiceMode && nextCell) {
        speakCell(nextCell.cellName);
      }
    }
  };

  // Переключение голосового режима
  const toggleVoiceMode = () => {
    const newValue = !voiceMode;
    setVoiceMode(newValue);
    VoiceService.updateSettings({ enabled: newValue, volume: 1.0, rate: 1.0 });
    
    if (newValue && currentCell && !scannedCell) {
      speakCell(currentCell.cellName);
    }
  };

  // US III.7: Пропуск ячейки
  const handleSkipCell = () => {
    if (!confirm(`Пропустить ячейку ${route[currentCellIndex]?.cellName}?`)) {
      return;
    }

    // Помечаем ячейку как пропущенную
    setRoute(prev => prev.map((step, index) => 
      index === currentCellIndex ? { ...step, status: 'skipped' as const } : step
    ));

    if (currentCellIndex < route.length - 1) {
      handleNextCell();
    } else {
      feedback.warning('Последняя ячейка пропущена');
    }
  };

  // Обработчик сканера
  const { handleScan: onScanWithFeedback } = useScanner({
    mode: 'keyboard',
    onScan: async (code) => {
      if (!awaitingProduct) {
        // Ожидаем ячейку
        await handleCellScan(code);
      } else {
        // Ожидаем товар
        await handleProductScan(code);
      }
    },
  });

  // Завершение
  const handleFinish = async () => {
    const discrepancies = getDiscrepancies();
    
    // Проверяем пропущенные ячейки
    const skippedCells = route.filter(r => r.status === 'skipped');
    if (skippedCells.length > 0) {
      const skippedList = skippedCells.map(c => c.cellName).join(', ');
      if (!confirm(`Пропущены ячейки: ${skippedList}\n\nЗавершить всё равно?`)) {
        return;
      }
    }
    
    if (discrepancies.length > 0) {
      setShowDiscrepancyAlert(true);
    } else {
      await finishDocument(true);
    }
  };

  const handleConfirmWithDiscrepancies = async () => {
    setShowDiscrepancyAlert(false);
    await finishDocument(true);
  };

  const handleLineClick = (line: any) => {
    setSelectedLine(line);
    setShowLineCard(true);
  };

  const handleAutoComplete = () => {
    setShowAutoComplete(false);
    handleFinish();
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
        <Button onClick={() => navigate('/docs/PodborZakaza')}>
          Вернуться к списку
        </Button>
      </div>
    );
  }

  const currentCell = route[currentCellIndex];
  const currentCellProducts = currentCell?.products.map(p => lines.find(l => l.id === p.id)).filter(Boolean) || [];

  const nextCell = route[currentCellIndex + 1];

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-var(--header-height))]">
        {/* STICKY ПЛАШКА: Сейчас + Следующая ячейка */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-brand-primary to-brand-secondary text-white p-4 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            {/* Текущая ячейка */}
            <div className="flex-1">
              <div className="text-xs opacity-80 mb-1">СЕЙЧАС</div>
              <div className="flex items-center gap-2">
                <MapPin size={20} />
                <span className="text-2xl font-bold">
                  {currentCell?.cellName || '—'}
                </span>
              </div>
              {scannedCell && (
                <div className="text-xs opacity-90 mt-1">Отсканирована</div>
              )}
            </div>

            {/* Стрелка */}
            {nextCell && (
              <>
                <Navigation size={24} className="opacity-60" />
                
                {/* Следующая ячейка */}
                <div className="flex-1">
                  <div className="text-xs opacity-80 mb-1">СЛЕДУЮЩАЯ</div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="opacity-80" />
                    <span className="text-lg font-bold opacity-90">
                      {nextCell.cellName}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Прогресс */}
          <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${route.length > 0 ? ((currentCellIndex + 1) / route.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Главный экран */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          {/* Настройки режима */}
          <div className="bg-surface-secondary rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-sm">Режимы работы</h3>
            
            <label className="flex items-center justify-between cursor-pointer p-2 bg-surface-primary rounded-lg">
              <div className="flex items-center gap-2">
                <Zap size={18} className={autoNextMode ? 'text-warning' : 'text-content-tertiary'} />
                <span className="text-sm font-medium">Автоматический переход</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={autoNextMode}
                  onChange={(e) => setAutoNextMode(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  autoNextMode ? 'bg-warning' : 'bg-surface-tertiary'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    autoNextMode ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer p-2 bg-surface-primary rounded-lg">
              <div className="flex items-center gap-2">
                <Volume2 size={18} className={voiceMode ? 'text-brand-primary' : 'text-content-tertiary'} />
                <span className="text-sm font-medium">Голосовые подсказки</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={voiceMode}
                  onChange={toggleVoiceMode}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  voiceMode ? 'bg-brand-primary' : 'bg-surface-tertiary'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    voiceMode ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            </label>
          </div>

          {/* US III.1: Визуализация маршрута */}
          <RouteVisualization
            route={route}
            currentStepIndex={currentCellIndex}
            onStepClick={(index) => {
              if (index <= currentCellIndex) {
                setCurrentCellIndex(index);
                setScannedCell(null);
                setAwaitingProduct(false);
              }
            }}
          />

          {/* Поле сканирования */}
          <ScannerInput
            onScan={onScanWithFeedback}
            placeholder={
              !awaitingProduct
                ? `Скан ячейки: ${currentCell?.cellName || '—'}`
                : `Скан товара из ячейки ${currentCell?.cellName}`
            }
            autoFocus
          />

          {/* Текущая ячейка и инструкции */}
          {currentCell && (
            <div className={`rounded-lg p-4 border-2 transition-all ${
              scannedCell
                ? 'border-success bg-success/10'
                : 'border-brand-primary bg-brand-primary/10'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={20} className="text-brand-primary" />
                    <h3 className="font-bold text-lg">{currentCell.cellName}</h3>
                  </div>
                  <p className="text-sm text-content-secondary">
                    {!scannedCell
                      ? '1️⃣ Отсканируйте ячейку'
                      : '2️⃣ Отсканируйте товары из списка ниже'}
                  </p>
                </div>
                {scannedCell && (
                  <CheckCircle size={24} className="text-success" />
                )}
              </div>

              {/* Действия с ячейкой */}
              <div className="grid grid-cols-2 gap-2">
                {/* СУПЕР-КНОПКА: Нет в ячейке */}
                {scannedCell && (
                  <button
                    onClick={handleNotInCell}
                    className="col-span-2 py-3 bg-error hover:brightness-110 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-base shadow-md"
                  >
                    <XCircle size={20} />
                    НЕТ В ЯЧЕЙКЕ
                  </button>
                )}
                
                {/* Кнопка пропуска */}
                <button
                  onClick={handleSkipCell}
                  className={`py-2 bg-warning-light hover:bg-warning text-warning-dark rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    scannedCell ? 'col-span-1' : 'col-span-2'
                  }`}
                >
                  <SkipForward size={16} />
                  Пропустить
                </button>

                {/* Следующая ячейка */}
                {scannedCell && nextCell && (
                  <button
                    onClick={handleNextCell}
                    className="col-span-1 py-2 bg-brand-primary hover:brightness-110 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    Далее →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Товары текущей ячейки */}
          {scannedCell && currentCellProducts.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-content-tertiary uppercase flex items-center gap-2">
                <Package size={16} />
                Товары к подбору ({currentCellProducts.length})
              </h3>
              {currentCellProducts.map((line: any) => (
                <div
                  key={line.id}
                  onClick={() => handleLineClick(line)}
                  className="card p-4 cursor-pointer hover:border-brand-primary transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-bold">{line.productName}</h4>
                      <p className="text-xs text-content-tertiary font-mono">{line.barcode}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      line.quantityFact >= line.quantityPlan
                        ? 'bg-success-light text-success-dark'
                        : line.quantityFact > 0
                        ? 'bg-warning-light text-warning-dark'
                        : 'bg-surface-tertiary text-content-secondary'
                    }`}>
                      {line.quantityFact} / {line.quantityPlan}
                    </div>
                  </div>

                  <div className="mt-2 h-1 bg-surface-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        line.quantityFact >= line.quantityPlan ? 'bg-success' : 'bg-warning'
                      }`}
                      style={{ width: `${(line.quantityFact / line.quantityPlan) * 100}%` }}
                    />
                  </div>

                  {/* Быстрые действия */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(line.id, 1);
                      }}
                      className="flex-1 py-2 bg-brand-primary hover:brightness-110 text-white rounded text-sm font-medium transition-all"
                    >
                      +1
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const remaining = line.quantityPlan - line.quantityFact;
                        if (remaining > 0) {
                          updateQuantity(line.id, remaining, true);
                        }
                      }}
                      disabled={line.quantityFact >= line.quantityPlan}
                      className="flex-1 py-2 bg-success hover:brightness-110 text-white rounded text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Всё ({line.quantityPlan - line.quantityFact})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Статус документа */}
          <div className="bg-surface-secondary rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Общий прогресс</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                document.status === 'completed'
                  ? 'bg-success-light text-success-dark'
                  : document.status === 'in_progress'
                  ? 'bg-warning-light text-warning-dark'
                  : 'bg-surface-tertiary text-content-secondary'
              }`}>
                {document.status === 'completed' ? 'ЗАВЕРШЁН' : document.status === 'in_progress' ? 'В РАБОТЕ' : 'НОВЫЙ'}
              </span>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Подобрано строк</span>
                <span className="font-mono">{document.completedLines} / {document.totalLines}</span>
              </div>
              <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-primary transition-all duration-300"
                  style={{ width: `${document.totalLines > 0 ? (document.completedLines / document.totalLines) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Кнопка завершения */}
        <div className="p-4 border-t border-separator bg-surface-primary fixed bottom-0 w-full max-w-3xl">
          <Button
            variant={document.status === 'completed' ? 'secondary' : 'primary'}
            className="w-full"
            onClick={handleFinish}
            disabled={document.status === 'completed'}
          >
            {document.status === 'completed' ? '✅ Документ завершён' : 'Завершить подбор'}
          </Button>
        </div>
      </div>

      {/* Диалоги */}
      {showDiscrepancyAlert && (
        <DiscrepancyAlert
          discrepancies={getDiscrepancies()}
          onConfirm={handleConfirmWithDiscrepancies}
          onCancel={() => setShowDiscrepancyAlert(false)}
        />
      )}

      {showLineCard && selectedLine && (
        <LineCard
          line={selectedLine}
          onClose={() => {
            setShowLineCard(false);
            setSelectedLine(null);
          }}
          onQuantityChange={(lineId, delta) => {
            updateQuantity(lineId, delta);
            const updatedLine = lines.find(l => l.id === lineId);
            if (updatedLine) setSelectedLine(updatedLine);
          }}
        />
      )}

      {showAutoComplete && document && (
        <AutoCompletePrompt
          totalLines={document.totalLines}
          completedLines={document.completedLines}
          onComplete={handleAutoComplete}
          onContinue={() => setShowAutoComplete(false)}
        />
      )}
    </>
  );
};

export default Picking;
