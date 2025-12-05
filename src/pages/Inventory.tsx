import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/services/db';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';
import { useScanner } from '@/hooks/useScanner';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useSwipe } from '@/hooks/useSwipe';
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
  useEffect(() => {
    if (documentId) {
      loadDocument();
    }
  }, [documentId]);

  const loadDocument = async () => {
    setLoading(true);
    try {
      const doc = await db.inventoryDocuments.get(documentId!);
      const docLines = doc
        ? await db.inventoryLines.where('documentId').equals(documentId!).toArray()
        : [];

      if (doc) {
        setDocument(doc);
        setLines(docLines);
        setCurrentCell(doc.currentCell || null);
        
        // Восстанавливаем список ячеек
        const cells = [...new Set(docLines.map((l: any) => l.cell))];
        setScannedCells(cells);
      }
    } catch (err: any) {
      console.error(err);
      feedback.error(`Ошибка загрузки: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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
      status: 'new',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      totalLines: 0,
    };

    try {
      await db.inventoryDocuments.add(newDoc);
      setDocument(newDoc);
      feedback.success(`Начата ${type === 'full' ? 'полная' : type === 'partial' ? 'частичная' : 'по ячейке'} инвентаризация`);

      // Обновляем URL
      navigate(`/docs/Inventarizaciya/${newDocId}`, { replace: true });
    } catch (err: any) {
      feedback.error(`Ошибка создания документа: ${err.message}`);
    }
  };

  // US VI.2 + VI.3: Общая обработка сканирования
  async function handleScan(code: string) {
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
      handleProductScan(code);
    }
  }

  // US VI.2: Сканирование ячейки
  const handleCellScan = (cellCode: string) => {
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
    if (!scannedCells.includes(cellCode)) {
      setScannedCells((prev) => [...prev, cellCode]);
    }
    feedback.success(`Ячейка: ${cellCode}`);
    analytics.track(EventType.SCAN_SUCCESS, { cell: cellCode, module: 'inventory' });
  };

  // US VI.3: Сканирование товара в ячейке
  const handleProductScan = async (barcode: string) => {
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
    const existingLine = lines.find(l => l.barcode === barcode && l.cell === currentCell);

    if (!product) {
      // Неизвестный товар - "не учтён"
      playScanSound('notListed');
      
      const unknownProduct = {
        id: `UNKNOWN-${barcode}`,
        name: `Неизвестный товар (${barcode})`,
        barcode,
        sku: barcode,
      };
      await db.products.add(unknownProduct);
      
      if (!streamMode) {
        feedback.warning(`Товар не найден в справочнике: ${barcode}`);
      }
      
      await addOrUpdateLine(unknownProduct, currentCell);
      return;
    }

    // Определяем тип звука
    if (isExpected || existingLine) {
      // Товар найден в списке или уже сканировался - "найден"
      playScanSound('found');
    } else if (expectedProducts.length > 0) {
      // Есть список ожидаемых, но товара там нет - "лишний"
      playScanSound('extra');
    } else {
      // Нет списка ожидаемых - обычное сканирование
      playScanSound('found');
    }

    await addOrUpdateLine(product, currentCell);
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

      await db.inventoryLines.add({
        ...newLine,
        documentId: document.id,
      });

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

  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-primary rounded-full border-t-transparent mx-auto"></div>
      </div>
    );
  }

  // Группировка по ячейкам
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

  return (
    <>
      <div ref={containerRef} className="flex flex-col h-[calc(100vh-var(--header-height))]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          {/* Создание документа */}
          {!document && (
            <div className="bg-surface-secondary rounded-lg p-6 text-center">
              <ClipboardCheck size={48} className="mx-auto mb-4 text-brand-primary" />
              <h2 className="text-xl font-bold mb-2">Начать инвентаризацию</h2>
              <p className="text-sm text-content-secondary mb-4">
                Выберите тип инвентаризации
              </p>
              <Button onClick={() => setShowTypeSelector(true)}>
                Выбрать тип
              </Button>
            </div>
          )}

          {document && (
            <>
              {/* Заголовок документа */}
              <div className="bg-surface-secondary rounded-lg p-4 border-2 border-brand-primary">
                <div className="flex items-center gap-3 mb-2">
                  <Warehouse size={28} className="text-brand-primary" />
                  <div>
                    <h2 className="text-lg font-bold">{document.id}</h2>
                    <p className="text-sm text-content-secondary">
                      {document.inventoryType === 'full'
                        ? 'Полная инвентаризация'
                        : document.inventoryType === 'partial'
                        ? 'Частичная инвентаризация'
                        : 'По ячейке'}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-2 rounded-lg text-center font-bold ${
                    document.status === 'completed'
                      ? 'bg-success-light text-success-dark'
                      : 'bg-warning-light text-warning-dark'
                  }`}
                >
                  {document.status === 'completed' ? 'ЗАВЕРШЕНА' : 'В РАБОТЕ'}
                </div>
              </div>

              {/* Режим потокового сканирования */}
              {document.status !== 'completed' && (
                <div className="bg-surface-secondary rounded-lg p-4 border border-borders-default">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Zap size={20} className={streamMode ? 'text-warning' : 'text-content-tertiary'} />
                      <span className="font-semibold">Потоковое сканирование</span>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={streamMode}
                        onChange={(e) => setStreamMode(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-14 h-8 rounded-full transition-colors ${
                          streamMode ? 'bg-warning' : 'bg-surface-tertiary'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${
                            streamMode ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  </label>
                  <p className="text-xs text-content-tertiary mt-2">
                    Быстрое сканирование без промежуточных экранов. Свайп влево/вправо для смены ячейки.
                  </p>
                </div>
              )}

              {/* Плашка с остатком товаров */}
              {streamMode && remainingProducts > 0 && (
                <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg p-4 text-white shadow-lg animate-pulse">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm opacity-90">Осталось просканировать:</div>
                      <div className="text-3xl font-bold">{remainingProducts} товаров</div>
                    </div>
                    <Package size={40} className="opacity-80" />
                  </div>
                </div>
              )}

              {/* Статистика */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-brand-primary/10 rounded-lg p-3 text-center">
                  <div className="text-xs text-brand-primary mb-1">Ячеек</div>
                  <div className="text-2xl font-bold text-brand-primary">
                    {scannedCells.length}
                  </div>
                </div>
                <div className="bg-success-light rounded-lg p-3 text-center">
                  <div className="text-xs text-success-dark mb-1">Позиций</div>
                  <div className="text-2xl font-bold text-success">{lines.length}</div>
                </div>
                <div className="bg-warning-light rounded-lg p-3 text-center">
                  <div className="text-xs text-warning-dark mb-1">Расхождений</div>
                  <div className="text-2xl font-bold text-warning">
                    {discrepancies.length}
                  </div>
                </div>
              </div>

              {/* Текущая ячейка */}
              {currentCell && (
                <div className="bg-brand-primary/10 rounded-lg p-4 relative">
                  {streamMode && scannedCells.length > 1 && (
                    <>
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-brand-primary/30 animate-pulse">
                        <ChevronLeft size={24} />
                      </div>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-primary/30 animate-pulse">
                        <ChevronRight size={24} />
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-center">
                      <div className="text-sm text-brand-primary font-medium mb-1">
                        Текущая ячейка:
                      </div>
                      <div className="text-3xl font-bold text-brand-primary">
                        {currentCell}
                      </div>
                      {streamMode && scannedCells.length > 1 && (
                        <div className="text-xs text-brand-primary/60 mt-1">
                          Свайп ← → для смены ({scannedCells.indexOf(currentCell) + 1} из {scannedCells.length})
                        </div>
                      )}
                    </div>
                    {!streamMode && (
                      <button
                        onClick={() => setCurrentCell(null)}
                        className="p-2 hover:bg-brand-primary/20 rounded-lg transition-colors"
                      >
                        <RefreshCcw size={20} className="text-brand-primary" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Сканирование */}
              {document.status !== 'completed' && (
                <div className="bg-surface-secondary rounded-lg p-4">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Package size={20} />
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
                  <p className="text-xs text-content-tertiary mt-2">
                    {currentCell
                      ? 'Сканируйте товары в ячейке или сканируйте другую ячейку'
                      : 'Начните с сканирования ячейки (формат: A1-01)'}
                  </p>
                </div>
              )}

              {/* Список по ячейкам */}
              {Object.keys(linesByCell).length > 0 && !streamMode && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-content-tertiary uppercase">
                    Отсканировано ({lines.length} позиций в {scannedCells.length} ячейках)
                  </h3>

                  {Object.entries(linesByCell).map(([cell, cellLines]) => (
                    <div key={cell} className="bg-surface-secondary rounded-lg p-4 space-y-2">
                      {/* Заголовок ячейки */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Warehouse size={20} className="text-brand-primary" />
                          <span className="font-bold text-lg">{cell}</span>
                        </div>
                        <span className="text-sm text-content-secondary">
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
                            className={`p-3 rounded-lg border-2 ${
                              hasDiscrepancy
                                ? isOver
                                  ? 'border-success bg-success/10'
                                  : 'border-error bg-error/10'
                                : 'border-separator'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="font-bold text-sm">{line.productName}</div>
                                <div className="text-xs text-content-tertiary font-mono">
                                  {line.barcode}
                                </div>
                                {line.scans > 1 && (
                                  <div className="text-xs text-brand-primary mt-1">
                                    Сканирований: {line.scans}
                                  </div>
                                )}
                              </div>
                              {hasDiscrepancy && (
                                <div className="flex items-center gap-1">
                                  {isOver ? (
                                    <TrendingUp size={16} className="text-success" />
                                  ) : (
                                    <TrendingDown size={16} className="text-error" />
                                  )}
                                  <span
                                    className={`text-sm font-bold ${
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
                              <div className="text-sm">
                                {line.quantityExpected > 0 && (
                                  <span className="text-content-secondary">
                                    План: {line.quantityExpected} /{' '}
                                  </span>
                                )}
                                <span className="font-medium">Факт: {line.quantityActual}</span>
                              </div>

                              {document.status !== 'completed' && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleQuantityChange(line.id, -1)}
                                    disabled={line.quantityActual <= 0}
                                    className="p-1 bg-surface-tertiary hover:bg-surface-primary rounded disabled:opacity-50"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleQuantityChange(line.id, 1)}
                                    className="p-1 bg-surface-tertiary hover:bg-surface-primary rounded"
                                  >
                                    <Plus size={16} />
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
                <div className="bg-surface-secondary rounded-lg p-4">
                  <h3 className="font-bold text-sm text-content-tertiary uppercase mb-3">
                    Последние сканирования ({lines.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {lines
                      .sort((a, b) => b.lastScanAt - a.lastScanAt)
                      .slice(0, 10)
                      .map((line) => (
                        <div
                          key={line.id}
                          className="flex items-center justify-between p-2 bg-surface-primary rounded-lg text-sm"
                        >
                          <div className="flex-1 truncate">
                            <span className="font-medium">{line.productName}</span>
                            <span className="text-content-tertiary ml-2">• {line.cell}</span>
                          </div>
                          <div className="text-brand-primary font-bold">
                            ×{line.quantityActual}
                          </div>
                        </div>
                      ))}
                  </div>
                  <button
                    onClick={() => setStreamMode(false)}
                    className="w-full mt-3 text-sm text-brand-primary hover:underline"
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
          <div className="p-4 border-t border-separator bg-surface-primary fixed bottom-0 w-full max-w-3xl">
            <Button onClick={handleFinish} className="w-full" size="lg">
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
