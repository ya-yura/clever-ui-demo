import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '@/services/db';
import { useScanner } from '@/hooks/useScanner';
import { useDocumentLogic } from '@/hooks/useDocumentLogic';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';
import ScannerInput from '@/components/ScannerInput';
import { QuantityControl } from '@/components/QuantityControl';
import { LineCard } from '@/components/LineCard';
import { AutoCompletePrompt } from '@/components/AutoCompletePrompt';
import { DiscrepancyAlert } from '@/components/DiscrepancyAlert';
import { ArrowLeft, Package, MapPin, CheckCircle, X, Undo2, Scan, QrCode } from 'lucide-react';
import { Button } from '@/design/components';
import { feedback } from '@/utils/feedback';

/**
 * МОДУЛЬ РАЗМЕЩЕНИЯ
 * 
 * Двухшаговое сканирование:
 * 1. Сканировать ячейку → запомнить
 * 2. Сканировать товар → разместить в ячейку
 * 
 * Сценарии:
 * - Правильная ячейка + товар = размещение
 * - Неправильная ячейка = ошибка
 * - Частичное размещение
 * - Отмена действия
 */
const Placement: React.FC = () => {
  const { id, docId } = useParams();
  const [searchParams] = useSearchParams();
  const documentId = docId || id;
  const sourceDocId = searchParams.get('source');
  const navigate = useNavigate();
  const { setDocumentInfo, setListInfo } = useDocumentHeader();

  // Состояние двухшагового сканирования
  const [currentStep, setCurrentStep] = useState<'cell' | 'product'>('cell');
  const [scannedCell, setScannedCell] = useState<string | null>(null);
  const [cellInfo, setCellInfo] = useState<any | null>(null);

  // Определение текущей зоны оператора
  const [operatorZone, setOperatorZone] = useState<string | null>(null);
  const [lastScannedCells, setLastScannedCells] = useState<string[]>([]);

  // UI состояния
  const [showLineCard, setShowLineCard] = useState(false);
  const [selectedLine, setSelectedLine] = useState<any | null>(null);
  const [showAutoComplete, setShowAutoComplete] = useState(false);

  // История действий для отмены
  const [actionHistory, setActionHistory] = useState<Array<{
    lineId: string;
    cellId: string;
    quantity: number;
    timestamp: number;
  }>>([]);

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
    docType: 'placement',
    docId: documentId,
    onComplete: () => {
      feedback.success('✅ Размещение завершено');
      navigate('/docs/RazmeshhenieVYachejki');
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
      setListInfo({ title: 'Размещение', count: 0 });
    }
    return () => {
      setDocumentInfo(null);
      setListInfo(null);
    };
  }, [documentId, document, setDocumentInfo, setListInfo]);

  // Определение зоны из кода ячейки (формат: A1-01 → зона A)
  const getCellZone = (cellCode: string): string => {
    const match = cellCode.match(/^([A-Z]+)/i);
    return match ? match[1].toUpperCase() : 'UNKNOWN';
  };

  // Вычисление "расстояния" между ячейками (упрощённо)
  const getCellDistance = (cellA: string, cellB: string): number => {
    const zoneA = getCellZone(cellA);
    const zoneB = getCellZone(cellB);
    
    // Разные зоны - большое расстояние
    if (zoneA !== zoneB) {
      return 100;
    }
    
    // Одна зона - извлекаем номера
    const numA = parseInt(cellA.match(/\d+/)?.[0] || '0');
    const numB = parseInt(cellB.match(/\d+/)?.[0] || '0');
    
    return Math.abs(numA - numB);
  };

  // US II.1: Загрузка ячейки из справочника
  const loadCellInfo = async (cellCode: string) => {
    try {
      // Поиск в справочнике ячеек
      const cell = await db.cells?.get(cellCode);
      if (cell) {
        return cell;
      }
      
      // Если не найдено, создаём временную запись
      const zone = getCellZone(cellCode);
      return {
        id: cellCode,
        name: cellCode,
        zone: `Зона ${zone}`,
        type: 'storage',
      };
    } catch (err) {
      console.error('Failed to load cell:', err);
      return null;
    }
  };

  // Автоопределение зоны оператора по истории сканирований
  useEffect(() => {
    if (lastScannedCells.length >= 3) {
      // Определяем зону по большинству последних сканирований
      const zones = lastScannedCells.slice(-5).map(getCellZone);
      const zoneCounts = zones.reduce((acc, zone) => {
        acc[zone] = (acc[zone] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const dominantZone = Object.entries(zoneCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0];
      
      if (dominantZone && dominantZone !== operatorZone) {
        setOperatorZone(dominantZone);
        feedback.info(`📍 Автоопределение: Зона ${dominantZone}`);
      }
    }
  }, [lastScannedCells]);

  // US II.2: Обработка сканирования ячейки
  const handleCellScan = async (code: string) => {
    const cell = await loadCellInfo(code);
    
    if (cell) {
      setScannedCell(code);
      setCellInfo(cell);
      setCurrentStep('product');
      
      // Добавляем в историю для автоопределения зоны
      setLastScannedCells(prev => [...prev, code].slice(-10));
      
      feedback.success(`Ячейка: ${cell.name}${cell.zone ? ` (${cell.zone})` : ''}`);
    } else {
      feedback.error('Ячейка не найдена');
    }
  };

  // US II.3: Обработка сканирования товара
  const handleProductScan = async (code: string) => {
    if (!scannedCell) {
      feedback.error('Сначала отсканируйте ячейку');
      setCurrentStep('cell');
      return;
    }

    // Ищем товар в строках документа
    const line = safeLines.find(l => l.barcode === code || l.productSku === code);
    
    if (!line) {
      feedback.error('Товар не найден в документе');
      return;
    }

    // US II.3.1: Проверка правильности ячейки
    if (line.cellId && line.cellId !== scannedCell) {
      const wrongCell = await loadCellInfo(line.cellId);
      feedback.error(`⚠️ Неправильная ячейка!\nТребуется: ${wrongCell?.name || line.cellId}\nОтсканирована: ${cellInfo?.name}`);
      return;
    }

    // US II.3.2: Размещение товара
    // Обновляем ячейку для строки если ещё не задана
    if (!line.cellId) {
      const linesTable = db.placementLines;
      await linesTable.update(line.id, { cellId: scannedCell });
    }

    // Увеличиваем количество
    const newQuantity = line.quantityFact + 1;
    await updateQuantity(line.id, 1);

    // Сохраняем в историю для отмены
    setActionHistory(prev => [...prev, {
      lineId: line.id,
      cellId: scannedCell,
      quantity: 1,
      timestamp: Date.now(),
    }]);

    // Обратная связь
    feedback.success(`${line.productName} размещён в ${cellInfo?.name} (+1)`);

    // Если строка выполнена, переходим к следующей
    if (newQuantity >= line.quantityPlan) {
      feedback.success(`✅ ${line.productName} полностью размещён`);
      
      // Сбрасываем ячейку для следующего товара
      setScannedCell(null);
      setCellInfo(null);
      setCurrentStep('cell');

      // Проверка автозавершения
      const allCompleted = safeLines.every(l => 
        l.id === line.id ? newQuantity >= line.quantityPlan : l.status === 'completed'
      );
      
      if (allCompleted) {
        setTimeout(() => setShowAutoComplete(true), 500);
      }
    }
  };

  // US II.5: Отмена последнего действия
  const handleUndo = async () => {
    if (actionHistory.length === 0) {
      feedback.error('Нет действий для отмены');
      return;
    }

    const lastAction = actionHistory[actionHistory.length - 1];
    const line = safeLines.find(l => l.id === lastAction.lineId);
    
    if (line && line.quantityFact > 0) {
      await updateQuantity(line.id, -lastAction.quantity);
      setActionHistory(prev => prev.slice(0, -1));
      feedback.success(`↶ Отменено размещение ${line.productName}`);
    }
  };

  // US II.2: Обработчик сканера
  const { handleScan: onScanWithFeedback } = useScanner({
    mode: 'keyboard',
    onScan: async (code) => {
      if (currentStep === 'cell') {
        await handleCellScan(code);
      } else {
        await handleProductScan(code);
      }
    },
  });

  // US II.6: Завершение документа
  const handleFinish = async () => {
    const discrepancies = getDiscrepancies();
    
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

  // ВСЕ ХУКИ ДО РАННЕГО ВОЗВРАТА!
  const safeLines = lines || [];

  // Интеллектуальная сортировка строк
  const sortedLines = useMemo(() => {
    if (!operatorZone && !scannedCell) {
      return safeLines;
    }

    return [...safeLines].sort((a, b) => {
      // Сначала незавершённые
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;

      // Если есть текущая ячейка, приоритет товарам для этой ячейки
      if (scannedCell) {
        const aMatchesCell = a.cellId === scannedCell;
        const bMatchesCell = b.cellId === scannedCell;
        if (aMatchesCell && !bMatchesCell) return -1;
        if (!aMatchesCell && bMatchesCell) return 1;
      }

      // Сортировка по близости к текущей зоне оператора
      if (operatorZone && lastScannedCells.length > 0) {
        const lastCell = lastScannedCells[lastScannedCells.length - 1];
        
        const distanceA = a.cellId ? getCellDistance(lastCell, a.cellId) : 999;
        const distanceB = b.cellId ? getCellDistance(lastCell, b.cellId) : 999;
        
        if (distanceA !== distanceB) {
          return distanceA - distanceB;
        }
      }

      return 0;
    });
  }, [safeLines, operatorZone, scannedCell, lastScannedCells]);

  // Фильтрация строк по зоне (если включено автоопределение)
  const visibleLines = useMemo(() => {
    if (!operatorZone) {
      return sortedLines;
    }

    // Показываем только строки из текущей зоны оператора
    return sortedLines.filter(line => {
      if (!line.cellId) return true; // Показываем неразмещённые
      const lineZone = getCellZone(line.cellId);
      return lineZone === operatorZone;
    });
  }, [sortedLines, operatorZone]);

  // Определение цвета по расстоянию
  const getProximityColor = (cellId: string | undefined): string => {
    if (!cellId || !lastScannedCells.length) return 'gray';
    
    const lastCell = lastScannedCells[lastScannedCells.length - 1];
    const distance = getCellDistance(lastCell, cellId);
    
    if (distance === 0) return 'green'; // Та же ячейка
    if (distance <= 3) return 'green'; // Близко (1-3 ячейки)
    if (distance <= 10) return 'yellow'; // Средне (4-10 ячеек)
    return 'gray'; // Далеко
  };

  // Ранний возврат только после ВСЕХ хуков
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
        <Button onClick={() => navigate('/docs/RazmeshhenieVYachejki')}>
          Вернуться к списку
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-var(--header-height))]">
        {/* Главный экран */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          {/* Автоопределение зоны */}
          {operatorZone && (
            <div className="bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-lg p-4 border-2 border-brand-primary/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-brand-primary" />
                  <div>
                    <div className="text-xs text-brand-primary/80">Вы находитесь</div>
                    <div className="font-bold text-brand-primary">Зона {operatorZone}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOperatorZone(null);
                    setLastScannedCells([]);
                    feedback.info('Автоопределение зоны отключено');
                  }}
                  className="text-xs text-brand-primary hover:underline"
                >
                  Сбросить
                </button>
              </div>
              <p className="text-xs text-brand-primary/70 mt-2">
                Показываются только ячейки зоны {operatorZone}
              </p>
            </div>
          )}

          {/* КРУПНЫЕ КНОПКИ сканирования */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setCurrentStep('cell');
                feedback.info('Готов к сканированию ячейки');
              }}
              className={`p-6 rounded-xl border-3 transition-all ${
                currentStep === 'cell'
                  ? 'border-brand-primary bg-brand-primary/10 shadow-lg'
                  : 'border-separator bg-surface-secondary'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`p-4 rounded-full ${
                  currentStep === 'cell' ? 'bg-brand-primary' : 'bg-surface-tertiary'
                }`}>
                  <QrCode size={32} className={currentStep === 'cell' ? 'text-white' : 'text-content-tertiary'} />
                </div>
                <div className="text-center">
                  <div className={`font-bold ${currentStep === 'cell' ? 'text-brand-primary' : 'text-content-secondary'}`}>
                    Сканировать ячейку
                  </div>
                  {scannedCell && (
                    <div className="text-xs text-success mt-1">{cellInfo?.name}</div>
                  )}
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                if (!scannedCell) {
                  feedback.error('Сначала отсканируйте ячейку');
                } else {
                  setCurrentStep('product');
                  feedback.info('Готов к сканированию товара');
                }
              }}
              disabled={!scannedCell}
              className={`p-6 rounded-xl border-3 transition-all ${
                currentStep === 'product' && scannedCell
                  ? 'border-brand-primary bg-brand-primary/10 shadow-lg'
                  : scannedCell
                  ? 'border-separator bg-surface-secondary'
                  : 'border-separator bg-surface-tertiary opacity-50'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`p-4 rounded-full ${
                  currentStep === 'product' && scannedCell ? 'bg-brand-primary' : 'bg-surface-tertiary'
                }`}>
                  <Scan size={32} className={currentStep === 'product' && scannedCell ? 'text-white' : 'text-content-tertiary'} />
                </div>
                <div className="text-center">
                  <div className={`font-bold ${currentStep === 'product' && scannedCell ? 'text-brand-primary' : 'text-content-secondary'}`}>
                    Сканировать товар
                  </div>
                  {scannedCell && (
                    <div className="text-xs text-content-tertiary mt-1">в {cellInfo?.name}</div>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Кнопка отмены + сброс */}
          <div className="flex gap-2">
            {actionHistory.length > 0 && (
              <button
                onClick={handleUndo}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-warning-light hover:bg-warning text-warning-dark rounded-lg font-medium transition-colors"
              >
                <Undo2 size={18} />
                Отменить последнее
              </button>
            )}
            {scannedCell && (
              <button
                onClick={() => {
                  setScannedCell(null);
                  setCellInfo(null);
                  setCurrentStep('cell');
                  feedback.info('Ячейка сброшена');
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-surface-tertiary hover:bg-surface-primary rounded-lg font-medium transition-colors"
              >
                <X size={18} />
                Сбросить ячейку
              </button>
            )}
          </div>

          {/* Поле сканирования */}
          <ScannerInput
            onScan={onScanWithFeedback}
            placeholder={
              currentStep === 'cell'
                ? 'Скан ячейки (например: A1-01)...'
                : `Скан товара в ${cellInfo?.name || 'ячейку'}...`
            }
            autoFocus
          />

          {/* Статус и прогресс */}
          <div className="bg-surface-secondary rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Прогресс размещения</h3>
              <span className={`status-badge ${
                document.status === 'completed'
                  ? 'status-badge-completed'
                  : document.status === 'in_progress'
                  ? 'status-badge-warning'
                  : 'bg-surface-tertiary text-content-secondary'
              }`}>
                {document.status === 'completed' ? 'ЗАВЕРШЁН' : document.status === 'in_progress' ? 'В РАБОТЕ' : 'НОВЫЙ'}
              </span>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Размещено позиций</span>
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

          {/* Список строк с интеллектуальной сортировкой */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-content-tertiary uppercase">
                Товары к размещению
                {operatorZone && visibleLines.length !== safeLines.length && (
                  <span className="ml-2 text-brand-primary">
                    ({visibleLines.length} в зоне {operatorZone})
                  </span>
                )}
              </h3>
              {operatorZone && visibleLines.length !== safeLines.length && (
                <button
                  onClick={() => setOperatorZone(null)}
                  className="text-xs text-brand-primary hover:underline"
                >
                  Показать все
                </button>
              )}
            </div>

            {visibleLines.map((line) => {
              const proximityColor = getProximityColor(line.cellId);
              
              return (
                <div
                  key={line.id}
                  onClick={() => handleLineClick(line)}
                  className={`card p-4 cursor-pointer hover:border-brand-primary transition-all border-l-4 ${
                    proximityColor === 'green' 
                      ? 'border-l-success bg-success/5' 
                      : proximityColor === 'yellow'
                      ? 'border-l-warning bg-warning/5'
                      : 'border-l-separator'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold">{line.productName}</h4>
                        {proximityColor === 'green' && (
                          <span className="text-xs bg-success/20 text-success-dark px-2 py-0.5 rounded-full font-bold">
                            РЯДОМ
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-content-tertiary font-mono">{line.barcode}</p>
                    </div>
                    <div className={`status-badge ${
                      line.status === 'completed'
                        ? 'status-badge-completed'
                        : line.status === 'partial'
                        ? 'status-badge-warning'
                        : 'bg-surface-tertiary text-content-secondary'
                    }`}>
                      {line.quantityFact} / {line.quantityPlan}
                    </div>
                  </div>

                  {line.cellId && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={14} className={
                        proximityColor === 'green' ? 'text-success' :
                        proximityColor === 'yellow' ? 'text-warning' :
                        'text-content-tertiary'
                      } />
                      <span className={
                        proximityColor === 'green' ? 'text-success-dark font-medium' :
                        proximityColor === 'yellow' ? 'text-warning-dark' :
                        'text-content-secondary'
                      }>
                        {line.cellId}
                      </span>
                    </div>
                  )}

                  <div className="mt-2 h-1 bg-surface-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        line.status === 'completed' ? 'bg-success' : 'bg-warning'
                      }`}
                      style={{ width: `${line.quantityPlan > 0 ? (line.quantityFact / line.quantityPlan) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {visibleLines.length === 0 && operatorZone && (
              <div className="text-center py-10">
                <MapPin className="mx-auto mb-4 text-content-tertiary" size={48} />
                <p className="text-content-tertiary">
                  Нет товаров для размещения в зоне {operatorZone}
                </p>
                <button
                  onClick={() => setOperatorZone(null)}
                  className="mt-3 text-brand-primary hover:underline"
                >
                  Показать все зоны
                </button>
              </div>
            )}
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
            {document.status === 'completed' ? '✅ Документ завершён' : 'Завершить размещение'}
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
            const updatedLine = safeLines.find(l => l.id === lineId);
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

export default Placement;
