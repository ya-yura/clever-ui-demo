import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/services/db';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';
import { useScanner } from '@/hooks/useScanner';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useSwipe } from '@/hooks/useSwipe';
import { demoDataService } from '@/services/demoDataService';
import { odataAPI } from '@/services/odata-api';
import ScannerInput from '@/components/ScannerInput';
import { InventoryTypeSelector } from '@/components/inventory/InventoryTypeSelector';
import { DiscrepancyCard } from '@/components/inventory/DiscrepancyCard';
import { Button } from '@/design/components';
import {
  ClipboardCheck,
  Warehouse,
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  RefreshCcw,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { feedback } from '@/utils/feedback';
import analytics, { EventType } from '@/lib/analytics';
import { playScanSound } from '@/utils/soundEffects';

/**
 * МОДУЛЬ ИНВЕНТАРИЗАЦИИ
 * 
 * Процесс:
 * 1. Выбор типа (полная/частичная/ячейка)
 * 2. Сканирование ячейки
 * 3. Сканирование товаров в ячейке
 * 4. Повторное сканирование для проверки
 * 5. Автоматический расчёт расхождений
 * 6. Просмотр карточки расхождений
 * 7. Подтверждение завершения
 */

interface InventoryLine {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  cell: string;
  quantityExpected: number; // План (из учёта)
  quantityActual: number; // Факт (отсканировано)
  difference: number; // Расхождение
  scans: number; // Количество сканирований (для повторной проверки)
  lastScanAt: number;
}

const Inventory: React.FC = () => {
  const { id, docId } = useParams();
  const documentId = docId || id;
  const navigate = useNavigate();
  const { setDocumentInfo, setListInfo } = useDocumentHeader();
  const { addSyncAction } = useOfflineStorage('inventory');
  const containerRef = useRef<HTMLDivElement>(null);

  // Документ
  const [document, setDocument] = useState<any | null>(null);
  const [lines, setLines] = useState<InventoryLine[]>([]);
  const [loading, setLoading] = useState(false);

  // US VI.1: Тип инвентаризации
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  // US VI.2: Текущая ячейка
  const [currentCell, setCurrentCell] = useState<string | null>(null);
  const [scannedCells, setScannedCells] = useState<string[]>([]);

  // US VI.5: Расхождения
  const [showDiscrepancyCard, setShowDiscrepancyCard] = useState(false);

  // Режим потокового сканирования
  const [streamMode, setStreamMode] = useState(false);
  const [expectedProducts, setExpectedProducts] = useState<any[]>([]);

  // US VI.2: Сканирование ячейки
  const handleCellScan = useCallback((cellCode: string) => {
    if (!document) return;
    
    // Проверка: входит ли ячейка в область инвентаризации
    if (document.inventoryType === 'cell' || document.inventoryType === 'partial') {
      if (
        document.targetCells &&
        document.targetCells.length > 0 &&
        !document.targetCells.includes(cellCode)
      ) {
        feedback.error(`Ячейка ${cellCode} не входит в область инвентаризации`);
        return;
      }
    }

    setCurrentCell(cellCode);
    setScannedCells((prev) => {
      if (!prev.includes(cellCode)) {
        return [...prev, cellCode];
      }
      return prev;
    });
    feedback.success(`Ячейка: ${cellCode}`);
    analytics.track(EventType.SCAN_SUCCESS, { cell: cellCode, module: 'inventory' });
  }, [document]);

  // US VI.3: Сканирование товара в ячейке
  const handleProductScan = useCallback(async (barcode: string) => {
    if (!currentCell) {
      feedback.error('Сначала отсканируйте ячейку');
      playScanSound('extra');
      return;
    }

    analytics.track(EventType.SCAN_SUCCESS, { barcode, cell: currentCell, module: 'inventory' });

    // Поиск товара в справочнике
    const products = await db.products.where('barcode').equals(barcode).toArray();
    const product = products[0];

    // Проверка: есть ли товар в ожидаемом списке (для звука)
    const isExpected = expectedProducts.some(p => p.barcode === barcode);
    
    setLines(prev => {
      const existingLine = prev.find(l => l.barcode === barcode && l.cell === currentCell);
      
      if (!product) {
        // Неизвестный товар
        playScanSound('notListed');
        if (!streamMode) {
          feedback.warning(`Товар не найден в справочнике: ${barcode}`);
        }
        
        const unknownProduct = {
          id: `UNKNOWN-${barcode}`,
          name: `Неизвестный товар (${barcode})`,
          barcode,
          sku: barcode,
        };
        db.products.add(unknownProduct).catch(() => {});
        
        if (existingLine) {
          return prev.map(l => 
            l.id === existingLine.id 
              ? { ...l, quantityActual: l.quantityActual + 1, scans: l.scans + 1, lastScanAt: Date.now() }
              : l
          );
        }
        return [...prev, {
          id: `line-${Date.now()}`,
          productId: unknownProduct.id,
          productName: unknownProduct.name,
          barcode: unknownProduct.barcode,
          cell: currentCell,
          quantityExpected: 0,
          quantityActual: 1,
          difference: 1,
          scans: 1,
          lastScanAt: Date.now(),
        }];
      }

      // Определяем тип звука
      if (isExpected || existingLine) {
        playScanSound('found');
      } else if (expectedProducts.length > 0) {
        playScanSound('extra');
      } else {
        playScanSound('found');
      }

      if (existingLine) {
        return prev.map(l => 
          l.id === existingLine.id 
            ? { ...l, quantityActual: l.quantityActual + 1, scans: l.scans + 1, lastScanAt: Date.now() }
            : l
        );
      }
      return [...prev, {
        id: `line-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        barcode: product.barcode,
        cell: currentCell,
        quantityExpected: 0,
        quantityActual: 1,
        difference: 1,
        scans: 1,
        lastScanAt: Date.now(),
      }];
    });
  }, [currentCell, expectedProducts, streamMode]);

  // US VI.2 + VI.3: Общая обработка сканирования
  const handleScan = useCallback(async (code: string) => {
    if (!document) {
      feedback.error('Сначала создайте документ инвентаризации');
      setShowTypeSelector(true);
      return;
    }

    // Проверяем, это ячейка или товар
    const isCell = /^[A-Z]\d+-\d+$/i.test(code); // Формат: A1-01

    if (isCell) {
      handleCellScan(code.toUpperCase());
    } else {
      await handleProductScan(code);
    }
  }, [document, handleCellScan, handleProductScan]);

  // Сканер
  const { handleScan: onScan } = useScanner({
    mode: 'keyboard',
    continuous: true,
    onScan: handleScan,
  });

  // Swipe для смены ячейки
  useSwipe(containerRef, {
    onSwipeLeft: () => {
      if (streamMode && scannedCells.length > 0) {
        const currentIndex = scannedCells.indexOf(currentCell || '');
        const nextIndex = (currentIndex + 1) % scannedCells.length;
        const nextCell = scannedCells[nextIndex];
        if (nextCell) {
          setCurrentCell(nextCell);
          feedback.info(`Ячейка: ${nextCell}`);
        }
      }
    },
    onSwipeRight: () => {
      if (streamMode && scannedCells.length > 0) {
        const currentIndex = scannedCells.indexOf(currentCell || '');
        const prevIndex = currentIndex <= 0 ? scannedCells.length - 1 : currentIndex - 1;
        const prevCell = scannedCells[prevIndex];
        if (prevCell) {
          setCurrentCell(prevCell);
          feedback.info(`Ячейка: ${prevCell}`);
        }
      }
    },
    minSwipeDistance: 80,
  });

  // Заголовок
  useEffect(() => {
    if (documentId && document) {
      const totalLines = lines.length;
      const completedCells = scannedCells.length;
      
      setDocumentInfo({
        documentId: document.id,
        completed: completedCells,
        total: document.inventoryType === 'full' ? 0 : scannedCells.length, // Dynamic for full
      });
    } else if (!documentId) {
      setListInfo({ title: 'Инвентаризация', count: 0 });
    }
    return () => {
      setDocumentInfo(null);
      setListInfo(null);
    };
  }, [documentId, document, lines, scannedCells, setDocumentInfo, setListInfo]);

  // Загрузка документа
  const loadDocument = useCallback(async () => {
    if (!documentId) return;
    
    setLoading(true);
    try {
      // Сначала пробуем из IndexedDB
      let doc = await db.inventoryDocuments.get(documentId);
      let docLines: any[] = [];
      
      if (doc) {
        docLines = await db.inventoryLines.where('documentId').equals(documentId).toArray();
      } else {
        // Пробуем загрузить из OData API или демо-данных
        try {
          const odataDoc = await odataAPI.getDocument('Inventarizaciya', documentId);
          if (odataDoc && odataDoc.declaredItems) {
            // Конвертируем OData документ в формат инвентаризации
            doc = {
              id: odataDoc.id,
              inventoryType: (odataDoc as any).inventoryType || 'cell',
              status: odataDoc.finished ? 'completed' : odataDoc.inProcess ? 'in_progress' : 'new',
              createdAt: new Date(odataDoc.createDate).getTime(),
              updatedAt: new Date(odataDoc.lastChangeDate).getTime(),
              currentCellId: undefined,
              totalLines: 0,
              completedLines: 0,
              discrepanciesCount: 0,
            } as any;
            
            // Конвертируем строки
            docLines = odataDoc.declaredItems.map((item: any) => ({
              id: item.uid,
              documentId: documentId,
              productId: item.productId,
              productName: item.productName || item.productId,
              barcode: item.productBarcode || item.productId,
              cell: item.firstCellId || item.firstStorageId || '',
              quantityExpected: item.declaredQuantity,
              quantityActual: item.currentQuantity,
              difference: item.currentQuantity - item.declaredQuantity,
              scans: 0,
              lastScanAt: Date.now(),
            }));
            
            // Сохраняем в IndexedDB
            await db.inventoryDocuments.put(doc as any);
            // @ts-ignore - type mismatch with bulkPut
            await db.inventoryLines.bulkPut(docLines as any);
          } else {
            // Пробуем демо-данные
            const demoDoc = demoDataService.getDocumentWithItems('Inventarizaciya', documentId!);
            if (demoDoc && demoDoc.declaredItems) {
              doc = {
                id: demoDoc.id,
                inventoryType: (demoDoc as any).inventoryType || 'cell',
                status: demoDoc.finished ? 'completed' : demoDoc.inProcess ? 'in_progress' : 'new',
                createdAt: new Date(demoDoc.createDate).getTime(),
                updatedAt: new Date(demoDoc.lastChangeDate).getTime(),
                currentCellId: undefined,
                totalLines: 0,
                completedLines: 0,
                discrepanciesCount: 0,
              } as any;
              
              docLines = demoDoc.declaredItems.map((item: any) => ({
                id: item.uid,
                documentId: documentId,
                productId: item.productId,
                productName: item.productName || item.productId,
                barcode: item.productBarcode || item.productId,
                cell: item.firstCellId || item.firstStorageId || '',
                quantityExpected: item.declaredQuantity,
                quantityActual: item.currentQuantity,
                difference: item.currentQuantity - item.declaredQuantity,
                scans: 0,
                lastScanAt: Date.now(),
              }));
              
              // @ts-ignore - type mismatch with bulkPut
              await db.inventoryDocuments.put(doc as any);
              // @ts-ignore - type mismatch with bulkPut
              await db.inventoryLines.bulkPut(docLines as any);
            }
          }
        } catch (apiError) {
          console.warn('Failed to load from API/demo:', apiError);
        }
      }

      if (doc) {
        setDocument(doc);
        setLines(docLines);
        setCurrentCell((doc as any).currentCellId || (doc as any).currentCell || null);
        
        // Восстанавливаем список ячеек
        const cells = [...new Set(docLines.map((l: any) => l.cell).filter(Boolean))];
        setScannedCells(cells);
      } else {
        // Не нашли документ — показываем старт
        setDocument(null);
        setLines([]);
        setCurrentCell(null);
        setScannedCells([]);
      }
    } catch (err: any) {
      console.error(err);
      feedback.error(`Ошибка загрузки: ${err.message}`);
      setDocument(null);
      setLines([]);
      setCurrentCell(null);
      setScannedCells([]);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (documentId) {
      loadDocument();
    } else {
      // Если нет id — показываем стартовый экран
      setDocument(null);
      setLines([]);
      setCurrentCell(null);
      setScannedCells([]);
    }
  }, [documentId, loadDocument]);

  // US VI.1: Создание документа после выбора типа
  const handleTypeSelect = async (
    type: 'full' | 'partial' | 'cell',
    zones?: string[],
    cells?: string[]
  ) => {
    setShowTypeSelector(false);

    const newDocId = `INV-${crypto.randomUUID().substring(0, 8)}`;
    const newDoc = {
      id: newDocId,
      inventoryType: type,
      zones: zones || [],
      targetCells: cells || [],
      status: 'new' as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      totalLines: 0,
      completedLines: 0,
      discrepanciesCount: 0,
    };

    try {
      // @ts-ignore - type mismatch
      await db.inventoryDocuments.add(newDoc as any);
      setDocument(newDoc);
      feedback.success(`Начата ${type === 'full' ? 'полная' : type === 'partial' ? 'частичная' : 'по ячейке'} инвентаризация`);

      // Обновляем URL
      navigate(`/docs/Inventarizaciya/${newDocId}`, { replace: true });
    } catch (err: any) {
      feedback.error(`Ошибка создания документа: ${err.message}`);
      setDocument(null);
      setLines([]);
      setCurrentCell(null);
      setScannedCells([]);
    }
  };


  // Добавление или обновление строки
  const addOrUpdateLine = async (product: any, cell: string) => {
    // Ищем существующую строку
    const existingLine = lines.find(
      (l) => l.productId === product.id && l.cell === cell
    );

    if (existingLine) {
      // US VI.4: Повторное сканирование
      const updatedLine = {
        ...existingLine,
        quantityActual: existingLine.quantityActual + 1,
        scans: existingLine.scans + 1,
        lastScanAt: Date.now(),
      };

      await db.inventoryLines
        .where('id')
        .equals(existingLine.id)
        .modify({
          quantityActual: updatedLine.quantityActual,
          scans: updatedLine.scans,
          lastScanAt: updatedLine.lastScanAt,
        });

      setLines((prev) =>
        prev.map((l) => (l.id === existingLine.id ? updatedLine : l))
      );

      // В режиме потокового сканирования минимальный вывод
      if (!streamMode) {
        feedback.info(`${product.name}: ${updatedLine.quantityActual} шт (сканирование #${updatedLine.scans})`);
      }
    } else {
      // Создаём новую строку
      // В реальной системе quantityExpected загружается из учёта
      // Здесь ставим 0 для демо (слепая инвентаризация)
      const newLine: InventoryLine = {
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        barcode: product.barcode,
        cell,
        quantityExpected: 0, // TODO: загрузить из системы учёта
        quantityActual: 1,
        difference: 0, // Рассчитается позже
        scans: 1,
        lastScanAt: Date.now(),
      };

      // @ts-ignore - local type differs from global
      await db.inventoryLines.add({
        ...newLine,
        documentId: document.id,
      } as any);

      setLines((prev) => [...prev, newLine]);
      
      // В режиме потокового сканирования минимальный вывод
      if (!streamMode) {
        feedback.success(`Добавлен: ${product.name}`);
      }
    }

    // Обновляем документ
    await db.inventoryDocuments.update(document.id, {
      totalLines: lines.length + 1,
      currentCell: cell,
      updatedAt: Date.now(),
    });
  };

  // Изменение количества вручную
  const handleQuantityChange = async (lineId: string, delta: number) => {
    const line = lines.find((l) => l.id === lineId);
    if (!line) return;

    const newQuantity = Math.max(0, line.quantityActual + delta);

    try {
      await db.inventoryLines
        .where('id')
        .equals(lineId)
        .modify({ quantityActual: newQuantity });

      setLines((prev) =>
        prev.map((l) => (l.id === lineId ? { ...l, quantityActual: newQuantity } : l))
      );

      feedback.info(`Количество: ${newQuantity}`);
    } catch (err: any) {
      feedback.error(`Ошибка обновления: ${err.message}`);
    }
  };

  // US VI.5: Расчёт расхождений
  const discrepancies = useMemo(() => {
    return lines
      .map((line) => ({
        ...line,
        difference: line.quantityActual - line.quantityExpected,
      }))
      .filter((line) => line.difference !== 0 || line.quantityExpected > 0);
  }, [lines]);

  const discrepancyItems = discrepancies.map((line) => ({
    productName: line.productName,
    barcode: line.barcode,
    cell: line.cell,
    expected: line.quantityExpected,
    actual: line.quantityActual,
    difference: line.difference,
  }));

  // Группировка по ячейкам (ВСЕ ХУКИ ДО РАННЕГО ВОЗВРАТА!)
  const linesByCell = useMemo(() => {
    const grouped: Record<string, InventoryLine[]> = {};
    lines.forEach((line) => {
      if (!grouped[line.cell]) {
        grouped[line.cell] = [];
      }
      grouped[line.cell].push(line);
    });
    return grouped;
  }, [lines]);

  // Подсчет оставшихся товаров (если есть ожидаемый список)
  const remainingProducts = useMemo(() => {
    if (expectedProducts.length === 0) return 0;
    const scannedBarcodes = lines.map(l => l.barcode);
    return expectedProducts.filter(p => !scannedBarcodes.includes(p.barcode)).length;
  }, [expectedProducts, lines]);

  // US VI.7: Завершение инвентаризации
  const handleFinish = async () => {
    if (lines.length === 0) {
      feedback.error('Отсканируйте хотя бы один товар');
      return;
    }

    // Показываем карточку расхождений
    setShowDiscrepancyCard(true);
  };

  const handleConfirmDiscrepancies = async () => {
    setShowDiscrepancyCard(false);

    if (!confirm(`Подтвердить завершение инвентаризации?\n\nПозиций: ${lines.length}\nРасхождений: ${discrepancies.length}`)) {
      return;
    }

    try {
      await db.inventoryDocuments.update(document.id, {
        status: 'completed',
        updatedAt: Date.now(),
      });

      await addSyncAction('complete', { documentId: document.id });

      feedback.success('✅ Инвентаризация завершена');
      analytics.track(EventType.DOC_COMPLETE, {
        module: 'inventory',
        type: document.inventoryType,
        linesCount: lines.length,
        discrepancies: discrepancies.length,
      });

      navigate('/docs/Inventarizaciya');
    } catch (err: any) {
      feedback.error(`Ошибка завершения: ${err.message}`);
    }
  };

  // Ранний возврат только после ВСЕХ хуков
  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-primary rounded-full border-t-transparent mx-auto"></div>
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className="flex flex-col h-[calc(100vh-var(--header-height))]">
        <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 pb-16">
          {/* Создание документа */}
          {!document && (
            <div className="bg-surface-secondary rounded-lg p-3 text-center">
              <ClipboardCheck size={32} className="mx-auto mb-2 text-brand-primary" />
              <h2 className="text-lg font-bold mb-1">Начать инвентаризацию</h2>
              <p className="text-xs text-content-secondary mb-2">
                Выберите тип инвентаризации
              </p>
              <Button size="sm" onClick={() => setShowTypeSelector(true)}>
                Выбрать тип
              </Button>
            </div>
          )}

          {document && (
            <>
              {/* Заголовок документа */}
              <div className="doc-header">
                <div className="flex items-center gap-2 mb-1.5">
                  <Warehouse size={22} className="text-brand-primary" />
                  <div>
                    <h2 className="text-sm font-bold leading-tight">{document.id}</h2>
                    <p className="text-[11px] text-content-secondary leading-tight">
                      {document.inventoryType === 'full'
                        ? 'Полная инвентаризация'
                        : document.inventoryType === 'partial'
                        ? 'Частичная инвентаризация'
                        : 'По ячейке'}
                    </p>
                  </div>
                </div>
                <div
                  className={`status-badge ${
                    document.status === 'completed'
                      ? 'status-badge-completed'
                      : 'status-badge-warning'
                  }`}
                >
                  {document.status === 'completed' ? 'ЗАВЕРШЕНА' : 'В РАБОТЕ'}
                </div>
              </div>

              {/* Режим потокового сканирования */}
              {document.status !== 'completed' && (
                <div className="bg-surface-secondary rounded-lg p-2 border border-borders-default">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-1.5">
                      <Zap size={16} className={streamMode ? 'text-warning' : 'text-content-tertiary'} />
                      <span className="text-xs font-semibold">Потоковое сканирование</span>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={streamMode}
                        onChange={(e) => setStreamMode(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-11 h-6 rounded-full transition-colors ${
                          streamMode ? 'bg-warning' : 'bg-surface-tertiary'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            streamMode ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  </label>
                  <p className="text-[11px] text-content-tertiary mt-1">
                    Быстрое сканирование без промежуточных экранов. Свайп влево/вправо для смены ячейки.
                  </p>
                </div>
              )}

              {/* Плашка с остатком товаров */}
              {streamMode && remainingProducts > 0 && (
                <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg p-2.5 text-white shadow-md animate-pulse">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs opacity-90">Осталось просканировать:</div>
                      <div className="text-xl font-bold">{remainingProducts} товаров</div>
                    </div>
                    <Package size={28} className="opacity-80" />
                  </div>
                </div>
              )}

              {/* Статистика */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className="stat-chip stat-chip-brand">
                  <div className="text-[10px] mb-0.5">Ячеек</div>
                  <div className="text-lg font-bold leading-tight">
                    {scannedCells.length}
                  </div>
                </div>
                <div className="stat-chip stat-chip-success">
                  <div className="text-[10px] mb-0.5">Позиций</div>
                  <div className="text-lg font-bold leading-tight">{lines.length}</div>
                </div>
                <div className="stat-chip stat-chip-warning">
                  <div className="text-[10px] mb-0.5">Расхождений</div>
                  <div className="text-lg font-bold leading-tight">
                    {discrepancies.length}
                  </div>
                </div>
              </div>

              {/* Текущая ячейка */}
              {currentCell && (
                <div className="context-highlight">
                  {streamMode && scannedCells.length > 1 && (
                    <>
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-brand-primary/30 animate-pulse">
                        <ChevronLeft size={18} />
                      </div>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-primary/30 animate-pulse">
                        <ChevronRight size={18} />
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-center">
                      <div className="text-xs text-brand-primary font-medium mb-0.5">
                        Текущая ячейка:
                      </div>
                      <div className="text-2xl font-bold text-brand-primary leading-tight">
                        {currentCell}
                      </div>
                      {streamMode && scannedCells.length > 1 && (
                        <div className="text-[10px] text-brand-primary/60 mt-0.5">
                          Свайп ← → для смены ({scannedCells.indexOf(currentCell) + 1} из {scannedCells.length})
                        </div>
                      )}
                    </div>
                    {!streamMode && (
                      <button
                        onClick={() => setCurrentCell(null)}
                        className="p-1.5 hover:bg-brand-primary/20 rounded-lg transition-colors"
                      >
                        <RefreshCcw size={16} className="text-brand-primary" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Сканирование */}
              {document.status !== 'completed' && (
                <div className="bg-surface-secondary rounded-lg p-2">
                  <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5">
                    <Package size={16} />
                    Сканирование
                  </h3>
                  <ScannerInput
                    onScan={handleScan}
                    placeholder={
                      currentCell
                        ? 'Отсканируйте товар...'
                        : 'Отсканируйте ячейку (например: A1-01)...'
                    }
                    autoFocus
                  />
                  <p className="text-[11px] text-content-tertiary mt-1">
                    {currentCell
                      ? 'Сканируйте товары в ячейке или сканируйте другую ячейку'
                      : 'Начните с сканирования ячейки (формат: A1-01)'}
                  </p>
                </div>
              )}

              {/* Список по ячейкам */}
              {Object.keys(linesByCell).length > 0 && !streamMode && (
                <div className="space-y-1.5">
                  <h3 className="font-bold text-xs text-content-tertiary uppercase">
                    Отсканировано ({lines.length} позиций в {scannedCells.length} ячейках)
                  </h3>

                  {Object.entries(linesByCell).map(([cell, cellLines]) => (
                    <div key={cell} className="bg-surface-secondary rounded-lg p-2 space-y-1.5">
                      {/* Заголовок ячейки */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Warehouse size={16} className="text-brand-primary" />
                          <span className="font-bold text-sm">{cell}</span>
                        </div>
                        <span className="text-xs text-content-secondary">
                          {cellLines.length} {cellLines.length === 1 ? 'товар' : 'товаров'}
                        </span>
                      </div>

                      {/* Товары в ячейке */}
                      {cellLines.map((line) => {
                        const hasDiscrepancy = line.quantityActual !== line.quantityExpected;
                        const isOver = line.quantityActual > line.quantityExpected;
                        const isUnder = line.quantityActual < line.quantityExpected;

                        return (
                          <div
                            key={line.id}
                            className={`item-card-base ${
                              hasDiscrepancy
                                ? isOver
                                  ? 'item-card-success'
                                  : 'item-card-error'
                                : ''
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1.5">
                              <div className="flex-1">
                                <div className="font-bold text-xs leading-tight">{line.productName}</div>
                                <div className="text-[11px] text-content-tertiary font-mono leading-tight">
                                  {line.barcode}
                                </div>
                                {line.scans > 1 && (
                                  <div className="text-[11px] text-brand-primary mt-0.5">
                                    Сканирований: {line.scans}
                                  </div>
                                )}
                              </div>
                              {hasDiscrepancy && (
                                <div className="flex items-center gap-1">
                                  {isOver ? (
                                    <TrendingUp size={14} className="text-success" />
                                  ) : (
                                    <TrendingDown size={14} className="text-error" />
                                  )}
                                  <span
                                    className={`text-xs font-bold ${
                                      isOver ? 'text-success' : 'text-error'
                                    }`}
                                  >
                                    {isOver ? '+' : ''}
                                    {line.quantityActual - line.quantityExpected}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Количество */}
                            <div className="flex items-center justify-between">
                              <div className="text-xs">
                                {line.quantityExpected > 0 && (
                                  <span className="text-content-secondary">
                                    План: {line.quantityExpected} /{' '}
                                  </span>
                                )}
                                <span className="font-medium">Факт: {line.quantityActual}</span>
                              </div>

                              {document.status !== 'completed' && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleQuantityChange(line.id, -1)}
                                    disabled={line.quantityActual <= 0}
                                    className="p-1 bg-surface-tertiary hover:bg-surface-primary rounded disabled:opacity-50"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleQuantityChange(line.id, 1)}
                                    className="p-1 bg-surface-tertiary hover:bg-surface-primary rounded"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}

              {/* Режим потокового сканирования - компактный список последних сканирований */}
              {streamMode && lines.length > 0 && (
                <div className="bg-surface-secondary rounded-lg p-2">
                  <h3 className="font-bold text-xs text-content-tertiary uppercase mb-1.5">
                    Последние сканирования ({lines.length})
                  </h3>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {lines
                      .sort((a, b) => b.lastScanAt - a.lastScanAt)
                      .slice(0, 10)
                      .map((line) => (
                        <div
                          key={line.id}
                          className="flex items-center justify-between p-1.5 bg-surface-primary rounded-lg text-xs"
                        >
                          <div className="flex-1 truncate">
                            <span className="font-medium">{line.productName}</span>
                            <span className="text-content-tertiary ml-1.5">• {line.cell}</span>
                          </div>
                          <div className="text-brand-primary font-bold">
                            ×{line.quantityActual}
                          </div>
                        </div>
                      ))}
                  </div>
                  <button
                    onClick={() => setStreamMode(false)}
                    className="w-full mt-2 text-xs text-brand-primary hover:underline"
                  >
                    Показать полный список →
                  </button>
                </div>
              )}

              {/* Кнопка просмотра расхождений */}
              {discrepancies.length > 0 && document.status !== 'completed' && (
                <Button
                  onClick={() => setShowDiscrepancyCard(true)}
                  variant="secondary"
                  className="w-full"
                >
                  <AlertTriangle className="mr-2" />
                  Просмотреть расхождения ({discrepancies.length})
                </Button>
              )}
            </>
          )}
        </div>

        {/* Кнопка завершения */}
        {document && document.status !== 'completed' && lines.length > 0 && (
          <div className="bottom-action-bar">
            <Button onClick={handleFinish} className="w-full py-2 text-sm">
              <CheckCircle className="mr-2" />
              Завершить инвентаризацию
            </Button>
          </div>
        )}
      </div>

      {/* Диалоги */}
      {showTypeSelector && (
        <InventoryTypeSelector
          onSelect={handleTypeSelect}
          onCancel={() => setShowTypeSelector(false)}
        />
      )}

      {showDiscrepancyCard && (
        <DiscrepancyCard
          discrepancies={discrepancyItems}
          onClose={() => setShowDiscrepancyCard(false)}
          onConfirm={handleConfirmDiscrepancies}
        />
      )}
    </>
  );
};

export default Inventory;
