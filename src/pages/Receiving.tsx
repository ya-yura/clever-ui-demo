import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/services/db';
import { useScanner } from '@/hooks/useScanner';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useSync } from '@/hooks/useSync';
import { ReceivingDocument, ReceivingLine } from '@/types/receiving';
import { scanFeedback, feedback } from '@/utils/feedback';
import { STATUS_LABELS } from '@/types/document';
import { ReceivingCard, ReceivingStats } from '@/components/receiving';
import ScannerInput from '@/components/ScannerInput';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';
import { useAnalytics, EventType } from '@/lib/analytics';
import { CheckCircle } from 'lucide-react';

const Receiving: React.FC = () => {
  const { id, docId } = useParams(); // Support both legacy /receiving/:id and new /docs/PrihodNaSklad/:docId
  const documentId = docId || id; // Prefer new format, fallback to legacy
  const navigate = useNavigate();
  const analytics = useAnalytics();
  const [document, setDocument] = useState<ReceivingDocument | null>(null);
  const [lines, setLines] = useState<ReceivingLine[]>([]);
  const [documents, setDocuments] = useState<ReceivingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCell, setCurrentCell] = useState<string>('');
  const [highlightedLineId, setHighlightedLineId] = useState<string | null>(null);
  const { setDocumentInfo, setListInfo } = useDocumentHeader();

  // US I.1: Список документов
  const [documentsList, setDocumentsList] = useState<ReceivingDocument[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all' as 'all' | 'new' | 'in_progress' | 'completed',
    dateFrom: undefined as string | undefined,
    dateTo: undefined as string | undefined,
    supplier: undefined as string | undefined,
  });

  // US I.2.5: Карточка строки
  const [showLineCard, setShowLineCard] = useState(false);
  const [selectedLine, setSelectedLine] = useState<any | null>(null);

  // US I.3.1: Автозавершение
  const [showAutoComplete, setShowAutoComplete] = useState(false);

  // Логика документа (через хук)
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
    docType: 'receiving',
    docId: documentId,
    onComplete: async () => {
      // US II.1: Предложить перейти к размещению
      if (confirm('Приёмка завершена. Перейти к размещению?')) {
        // Создаём документ размещения на основе приёмки
        const placementDoc = {
          id: `PLM-${Date.now()}`,
          sourceDocumentId: documentId,
          sourceDocumentType: 'receiving',
          status: 'new',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          totalLines: lines.length,
          completedLines: 0,
          notes: `Размещение по приёмке ${document?.id || documentId}`,
        };

        await db.placementDocuments.add(placementDoc);

        // Копируем строки из приёмки в размещение
        const placementLines = lines.map(line => ({
          id: `${placementDoc.id}-${line.id}`,
          documentId: placementDoc.id,
          productId: line.productId,
          productName: line.productName,
          productSku: line.productSku,
          barcode: line.barcode,
          quantityPlan: line.quantityFact, // План = факт из приёмки
          quantityFact: 0,
          cellId: '', // Будет задана при сканировании
          status: 'pending',
        }));

        await db.placementLines.bulkAdd(placementLines);

        feedback.success('✅ Документ размещения создан');
        navigate(`/docs/RazmeshhenieVYachejki/${placementDoc.id}`);
      } else {
        navigate('/docs/PrihodNaSklad');
      }
    },
  });

  // --- Эффекты заголовка ---
  useEffect(() => {
    if (documentId && document) {
      setDocumentInfo({
        documentId: document.id,
        completed: document.completedLines || 0,
        total: document.totalLines || 0,
      });
      setListInfo(null);
    } else if (!documentId) {
      setDocumentInfo(null);
      setListInfo({ title: 'Приёмка', count: filteredDocuments.length });
    }
    return () => {
      setDocumentInfo(null);
      setListInfo(null);
    };
  }, [documentId, document, filteredDocuments.length, setDocumentInfo, setListInfo]);

  // --- US I.1: Загрузка списка документов (<1 sec) ---
  useEffect(() => {
    if (!documentId) {
      setLoadingList(true);
      const startTime = Date.now();
      db.receivingDocuments.toArray().then((docs) => {
        setDocumentsList(docs);
        setLoadingList(false);
        const loadTime = Date.now() - startTime;
        if (loadTime > 1000) {
          console.warn(`US I.1 FAILED: List loaded in ${loadTime}ms (target: <1000ms)`);
        }
      });
    }
  }, [documentId]);

  // US VII.1, VII.2: Фильтрация и поиск
  const filteredDocuments = useMemo(() => {
    let filtered = [...documentsList];

    // Поиск
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.id.toLowerCase().includes(search) ||
          doc.supplier?.toLowerCase().includes(search) ||
          doc.deliveryNumber?.toLowerCase().includes(search)
      );
    }

    // Фильтр по статусу
    if (filters.status !== 'all') {
      filtered = filtered.filter((doc) => doc.status === filters.status);
    }

    // Find product by barcode
    const line = lines.find(l => l.barcode === code || l.productSku === code);
    
    if (line) {
      // Highlight the scanned product
      setHighlightedLineId(line.id);
      setTimeout(() => setHighlightedLineId(null), 2000);

      // Check for over-plan
      if (line.quantityFact >= line.quantityPlan) {
        scanFeedback(false, 'Превышение плана');
        if (!window.confirm(`⚠️ Внимание!\n\nТовар: ${line.productName}\nПлан выполнен: ${line.quantityPlan} шт.\n\nДобавить сверх плана?`)) {
          return;
        }
      }

      const updatedLine: ReceivingLine = {
        ...line,
        quantityFact: line.quantityFact + 1,
        status: line.quantityFact + 1 >= line.quantityPlan ? 'completed' : 'partial' as const,
      };

      await db.receivingLines.update(line.id, updatedLine);
      await addSyncAction('update_line', updatedLine);
      
      // Refresh lines
      setLines(prev => prev.map(l => l.id === line.id ? updatedLine : l));
      
      scanFeedback(true, `✓ ${line.productName}: +1`);

      analytics.track(EventType.SCAN_SUCCESS, {
        barcode: code,
        documentId: id,
        productId: line.productId,
        productName: line.productName,
      });
      
      // Update document progress
      updateDocumentProgress();
    } else {
      // Product not found in document
      scanFeedback(false, 'Товар не найден в документе');
      
      // Show detailed error
      if (window.confirm(`❌ Товар не найден\n\nШтрихкод: ${code}\n\nЭтого товара нет в документе приёмки.\nДобавить как лишний товар?`)) {
        // TODO: Implement adding extra products
        feedback.notification('Функция добавления лишних товаров в разработке');
      }
      
      analytics.track(EventType.SCAN_ERROR, {
        barcode: code,
        documentId: id,
        error: 'Product not found in document',
      });
    }

    // Фильтр по поставщику
    if (filters.supplier) {
      filtered = filtered.filter((doc) => doc.supplier === filters.supplier);
    }

    return filtered;
  }, [documentsList, filters]);

  // US I.1: Получение списка поставщиков для фильтра
  const supplierOptions = useMemo(() => {
    return Array.from(new Set(documentsList.map((d) => d.supplier).filter(Boolean) as string[]));
  }, [documentsList]);

  // --- US I.2: Сканирование товара ---
  const { handleScan: onScanWithFeedback } = useScanner({
    mode: 'keyboard',
    onScan: async (code) => {
      if (!documentId) {
        // US I.1: Сканирование QR документа
        if (code.startsWith('DOC-') || code.startsWith('RCV-') || code.startsWith('new_')) {
          navigate(`/docs/PrihodNaSklad/${code}`);
          return;
        }
      }, 500);
    }
  };

  const handleManualComplete = async () => {
    if (!document) return;
    
    const uncompletedLines = lines.filter(l => l.quantityFact < l.quantityPlan);
    const overPlanLines = lines.filter(l => l.quantityFact > l.quantityPlan);
    const completedLines = lines.filter(l => l.quantityFact === l.quantityPlan);
    
    // Build detailed summary
    let message = '📋 Завершение документа\n\n';
    message += `Всего строк: ${lines.length}\n`;
    message += `✓ Принято точно: ${completedLines.length}\n`;
    
    if (uncompletedLines.length > 0) {
      message += `⚠️ Недостача: ${uncompletedLines.length} строк\n`;
      const totalShortage = uncompletedLines.reduce((sum, l) => sum + (l.quantityPlan - l.quantityFact), 0);
      message += `   (всего ${totalShortage} шт.)\n`;
    }
    
    if (overPlanLines.length > 0) {
      message += `⚠️ Излишки: ${overPlanLines.length} строк\n`;
      const totalOver = overPlanLines.reduce((sum, l) => sum + (l.quantityFact - l.quantityPlan), 0);
      message += `   (всего +${totalOver} шт.)\n`;
    }
    
    message += '\n';
    
    if (uncompletedLines.length > 0 || overPlanLines.length > 0) {
      message += '⚠️ Обнаружены расхождения!\n\n';
      message += 'Вы уверены, что хотите завершить документ с расхождениями?';
      
      if (!window.confirm(message)) {
        return;
      }
    } else {
      message += '✅ Все товары приняты согласно плану.\n\n';
      message += 'Завершить документ?';
      
      if (result.success && result.line) {
        // US I.2.1: Успешное сканирование
        setActiveLine(result.line);
        feedback.success(`${result.line.productName} (+1)`);
        
        // US I.3.1: Проверка на автозавершение
        if (document && lines.length > 0) {
          const allCompleted = lines.every(l => l.id === result.line!.id ? result.line!.status === 'completed' : l.status === 'completed');
          if (allCompleted) {
            setTimeout(() => setShowAutoComplete(true), 500);
          }
        }
      } else if (!result.success) {
        // US I.2.2: Ошибка сканирования
        feedback.error(result.message || 'Товар не найден');
      }
    },
  });

    await addSyncAction('complete', updatedDoc);
    sync();
    
    feedback.success('✅ Приёмка завершена!');

    analytics.track(EventType.DOC_COMPLETE, {
      documentId: document.id,
      docType: 'receiving',
      status: 'completed_manual',
      totalLines: lines.length,
      completedExact: completedLines.length,
      shortage: uncompletedLines.length,
      overplan: overPlanLines.length,
    });
    
    setTimeout(() => {
      if (window.confirm('📦 Документ завершён\n\nПерейти к размещению товара?')) {
        navigate(`/placement?source=${document.id}`);
      } else {
        navigate('/receiving');
      }
    }, 500);
  };

  const setLineQuantity = async (lineId: string, quantity: number) => {
    const line = lines.find(l => l.id === lineId);
    if (!line) return;

    const updatedLine: ReceivingLine = {
      ...line,
      quantityFact: quantity,
      status: quantity >= line.quantityPlan ? 'completed' : quantity > 0 ? 'partial' : 'pending' as const,
    };

    await db.receivingLines.update(lineId, updatedLine);
    await addSyncAction('update_line', updatedLine);
    
    setLines(prev => prev.map(l => l.id === lineId ? updatedLine : l));
    updateDocumentProgress();
  };

  const adjustQuantity = async (lineId: string, delta: number) => {
    const line = lines.find(l => l.id === lineId);
    if (!line) return;

  // US I.2.5: Открытие карточки строки
  const handleLineClick = (line: any) => {
    setSelectedLine(line);
    setShowLineCard(true);
  };

  // US I.3.1: Автозавершение
  const handleAutoComplete = () => {
    setShowAutoComplete(false);
    handleFinish();
  };

  // --- Рендер списка документов ---
  if (!documentId) {
    if (loadingList) return <div className="p-4 text-center">Загрузка...</div>;

    return (
      <div className="space-y-4 p-4">
        {/* US VII.1, VII.2: Фильтры и поиск */}
        <DocumentListFilter
          onFilterChange={setFilters}
          supplierOptions={supplierOptions}
          showSupplier={true}
        />

        {/* US I.1: Список документов */}
        <div className="space-y-3">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-10">
              <Package className="mx-auto mb-4 text-content-tertiary" size={48} />
              <p className="text-content-tertiary">
                {filters.search || filters.status !== 'all'
                  ? 'Нет документов по заданным фильтрам'
                  : 'Нет документов приёмки'}
              </p>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => navigate(`/receiving/${doc.id}`)}
                className="card p-4 active:scale-[0.98] transition-transform cursor-pointer hover:border-brand-primary"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{doc.id}</h3>
                    {doc.supplier && (
                      <p className="text-sm text-content-secondary mt-1">
                        Поставщик: {doc.supplier}
                      </p>
                    )}
                    {doc.deliveryNumber && (
                      <p className="text-xs text-content-tertiary">№ {doc.deliveryNumber}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        doc.status === 'completed'
                          ? 'bg-success-light text-success-dark'
                          : doc.status === 'in_progress'
                          ? 'bg-warning-light text-warning-dark'
                          : 'bg-surface-tertiary text-content-secondary'
                      }`}
                    >
                      {doc.status === 'completed'
                        ? 'ЗАВЕРШЁН'
                        : doc.status === 'in_progress'
                        ? 'В РАБОТЕ'
                        : 'НОВЫЙ'}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-between text-sm text-content-tertiary">
                  <span>{new Date(doc.createdAt).toLocaleString('ru-RU')}</span>
                  <span>
                    {doc.completedLines} / {doc.totalLines} строк
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // --- Рендер документа ---
  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-primary rounded-full border-t-transparent mx-auto"></div>
      </div>
    );
  }
  if (!document) {
    return <div className="p-10 text-center text-error">Документ не найден</div>;
  }

  // Sort lines by status priority based on actual quantities:
  // 1. partial (in progress: 0 < fact < plan) - highest priority
  // 2. pending (not started: fact === 0) - needs to be done
  // 3. over-plan (fact > plan) - needs attention
  // 4. completed (fact === plan) - lowest priority, done
  const sortedLines = [...lines].sort((a, b) => {
    const getStatusPriority = (line: ReceivingLine) => {
      const fact = line.quantityFact;
      const plan = line.quantityPlan;
      
      // In progress: started but not finished
      if (fact > 0 && fact < plan) return 1;
      
      // Not started: nothing received yet
      if (fact === 0) return 2;
      
      // Over-plan: received more than planned
      if (fact > plan) return 3;
      
      // Completed: received exactly as planned
      if (fact === plan && fact > 0) return 4;
      
      return 5; // Fallback
    };

    const priorityDiff = getStatusPriority(a) - getStatusPriority(b);
    
    // If same priority, sort alphabetically by product name
    if (priorityDiff === 0) {
      return a.productName.localeCompare(b.productName);
    }
    
    return priorityDiff;
  });

  return (
    <div className="space-y-3">
      {/* Scanner Input */}
      <ScannerInput 
        onScan={onScanWithFeedback}
        placeholder="Отсканируйте товар или документ..."
      />

      {/* Statistics Panel */}
      {lines.length > 0 && (
        <ReceivingStats lines={lines} />
      )}

      {/* Lines */}
      <div className="space-y-2">
        {sortedLines.map(line => (
          <ReceivingCard
            key={line.id}
            line={line}
            onAdjust={(delta) => adjustQuantity(line.id, delta)}
            onSetQuantity={(qty) => setLineQuantity(line.id, qty)}
            isHighlighted={highlightedLineId === line.id}
          />

      {lines.length === 0 && (
        <div className="bg-surface-secondary border border-borders-default rounded-lg text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-content-secondary text-lg">
            Нет товаров в документе
          </p>
          <p className="text-content-tertiary text-sm mt-2">
            Отсканируйте документ для загрузки
          </p>
        </div>
      </div>

      {/* US I.3: Алерт расхождений */}
      {showDiscrepancyAlert && (
        <DiscrepancyAlert
          discrepancies={getDiscrepancies()}
          onConfirm={handleConfirmWithDiscrepancies}
          onCancel={() => setShowDiscrepancyAlert(false)}
        />
      )}

      {/* US I.2.5: Карточка строки */}
      {showLineCard && selectedLine && (
        <LineCard
          line={selectedLine}
          onClose={() => {
            setShowLineCard(false);
            setSelectedLine(null);
          }}
          onQuantityChange={(lineId, delta) => {
            updateQuantity(lineId, delta);
            // Обновляем selectedLine для отображения новых значений
            const updatedLine = lines.find(l => l.id === lineId);
            if (updatedLine) setSelectedLine(updatedLine);
          }}
        />
      )}

      {document && document.status !== 'completed' && lines.length > 0 && (
        <button
          onClick={handleManualComplete}
          className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-4 rounded-lg font-bold text-lg shadow-lg transition-all mt-4 mb-8 flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-6 h-6" />
          Завершить документ
        </button>
      )}
    </>
  );
};

export default Receiving;
