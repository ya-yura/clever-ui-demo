import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/services/db';
import { useScanner } from '@/hooks/useScanner';
import { useDocumentLogic } from '@/hooks/useDocumentLogic';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';
import ScannerInput from '@/components/ScannerInput';
import { QuantityControl } from '@/components/QuantityControl';
import { DocumentListFilter } from '@/components/DocumentListFilter';
import { DiscrepancyAlert } from '@/components/DiscrepancyAlert';
import { LineCard } from '@/components/LineCard';
import { AutoCompletePrompt } from '@/components/AutoCompletePrompt';
import ReceivingCard from '@/components/receiving/ReceivingCard';
import { ReceivingDocument } from '@/types/receiving';
import { ArrowLeft, CheckCircle, XCircle, Package, Info, AlertTriangle, Search, Filter } from 'lucide-react';
import { Button } from '@/design/components';
import { feedback } from '@/utils/feedback';
import { sortByOperationalState } from '@/utils/documentOrdering';

const Receiving: React.FC = () => {
  const { id, docId } = useParams(); // Support both legacy /receiving/:id and new /docs/PrihodNaSklad/:docId
  const documentId = docId || id; // Prefer new format, fallback to legacy
  const navigate = useNavigate();
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

  // Новые фильтры и настройки
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);
  const [groupByPriority, setGroupByPriority] = useState(true);
  const [lineScanFrequency, setLineScanFrequency] = useState<Map<string, number>>(new Map());

  // US I.2.5: Карточка строки
  const [showLineCard, setShowLineCard] = useState(false);
  const [selectedLine, setSelectedLine] = useState<any | null>(null);

  // US I.3.1: Автозавершение
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  
  // Refs для фиксации позиций
  const linesContainerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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
      setListInfo({ title: 'Приёмка', count: documentsList.length });
    }
    return () => {
      setDocumentInfo(null);
      setListInfo(null);
    };
  }, [documentId, document, documentsList.length, setDocumentInfo, setListInfo]);

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

  // Загрузка частоты сканирования строк
  useEffect(() => {
    try {
      const stored = localStorage.getItem('line_scan_frequency');
      if (stored) {
        setLineScanFrequency(new Map(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Failed to load scan frequency:', error);
    }
  }, []);

  // US VII.1, VII.2: Умный поиск Spotlight-стиль
  const filteredDocuments = useMemo(() => {
    let filtered = [...documentsList];

    // Фильтр "Только не завершённые"
    if (showOnlyIncomplete) {
      filtered = filtered.filter(doc => doc.status !== 'completed');
    }

    // Spotlight-поиск: ищет по всем полям включая строки
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter((doc) => {
        // Поиск по основным полям
        const matchesMain = 
          doc.id.toLowerCase().includes(search) ||
          doc.supplier?.toLowerCase().includes(search) ||
          doc.deliveryNumber?.toLowerCase().includes(search) ||
          doc.notes?.toLowerCase().includes(search);
        
        if (matchesMain) return true;

        // Поиск по дате
        const dateStr = new Date(doc.createdAt).toLocaleDateString('ru-RU');
        if (dateStr.includes(search)) return true;

        // TODO: Поиск по строкам документа (требует подгрузки строк)
        // В production можно кешировать или индексировать
        
        return false;
      });
    }

    // Фильтр по статусу
    if (filters.status !== 'all') {
      filtered = filtered.filter((doc) => doc.status === filters.status);
    }

    // Фильтр по дате
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      filtered = filtered.filter((doc) => doc.createdAt >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime() + 86400000; // +1 день
      filtered = filtered.filter((doc) => doc.createdAt < to);
    }

    // Фильтр по поставщику
    if (filters.supplier) {
      filtered = filtered.filter((doc) => doc.supplier === filters.supplier);
    }

    return filtered;
  }, [documentsList, filters, showOnlyIncomplete]);

  // Группировка и сортировка с приоритетами
  const orderedDocuments = useMemo(() => {
    if (!groupByPriority) {
      return sortByOperationalState(filteredDocuments);
    }

    const now = Date.now();
    const oneDayAgo = now - 86400000;
    const currentUserId = 'current-user-id'; // TODO: из контекста

    // Группируем документы
    const groups = {
      urgent: [] as ReceivingDocument[],
      recent: [] as ReceivingDocument[],
      myOwn: [] as ReceivingDocument[],
      other: [] as ReceivingDocument[],
    };

    filteredDocuments.forEach(doc => {
      // Срочные (по приоритету или дедлайну)
      if (doc.priority === 'urgent' || doc.priority === 'high') {
        groups.urgent.push(doc);
      }
      // Недавние (созданы за последние 24 часа)
      else if (doc.createdAt >= oneDayAgo) {
        groups.recent.push(doc);
      }
      // Мои (текущий пользователь работал)
      else if (doc.assignedTo === currentUserId || doc.status === 'in_progress') {
        groups.myOwn.push(doc);
      }
      // Остальные
      else {
        groups.other.push(doc);
      }
    });

    // Сортируем каждую группу
    const sortGroup = (group: ReceivingDocument[]) => sortByOperationalState(group);

    return [
      ...sortGroup(groups.urgent),
      ...sortGroup(groups.recent),
      ...sortGroup(groups.myOwn),
      ...sortGroup(groups.other),
    ];
  }, [filteredDocuments, groupByPriority]);

  // US I.1: Получение списка поставщиков для фильтра
  const supplierOptions = useMemo(() => {
    return Array.from(new Set(documentsList.map((d) => d.supplier).filter(Boolean) as string[]));
  }, [documentsList]);

  // Трекинг частоты сканирования
  const trackScanFrequency = (lineId: string) => {
    const newFreq = new Map(lineScanFrequency);
    newFreq.set(lineId, (newFreq.get(lineId) || 0) + 1);
    setLineScanFrequency(newFreq);
    
    // Сохраняем в localStorage
    try {
      localStorage.setItem('line_scan_frequency', JSON.stringify(Array.from(newFreq.entries())));
    } catch (error) {
      console.error('Failed to save scan frequency:', error);
    }
  };

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
      }
      // US I.2: Скан товара с авто +1
      const result = await handleScan(code);
      
      if (result.success && result.line) {
        // US I.2.1: Успешное сканирование
        
        // Трекинг частоты для автосортировки
        trackScanFrequency(result.line.id);
        
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
        // US I.2.2: Умная ошибка с подсказкой
        const expectedProducts = lines
          .filter(l => l.status !== 'completed')
          .slice(0, 3)
          .map(l => l.productName);
        
        const errorMsg = expectedProducts.length > 0
          ? `Товар не найден в документе.\n\nОжидаются:\n${expectedProducts.map(p => `• ${p}`).join('\n')}`
          : result.message || 'Товар не найден';
        
        feedback.error(errorMsg);
        
      }
    },
  });

  // US I.4: Завершение с проверкой расхождений
  const handleFinish = async () => {
    const discrepancies = getDiscrepancies();
    
    if (discrepancies.length > 0) {
      // US I.3.3: Показать диалог расхождений
      setShowDiscrepancyAlert(true);
    } else {
      // Нет расхождений - завершаем сразу
      await finishDocument(true);
      feedback.success('✅ Документ завершён');
    }
  };

  const handleConfirmWithDiscrepancies = async () => {
    setShowDiscrepancyAlert(false);
    await finishDocument(true);
    feedback.success('✅ Документ завершён с расхождениями');
  };

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

  // Группировка документов с заголовками
  const groupedDocuments = useMemo(() => {
    if (!groupByPriority) {
      return [{ title: null, docs: orderedDocuments }];
    }

    const now = Date.now();
    const oneDayAgo = now - 86400000;
    const currentUserId = 'current-user-id';

    const groups: Array<{ title: string | null; docs: ReceivingDocument[] }> = [];
    
    const urgent = orderedDocuments.filter(d => 
      d.priority === 'urgent' || d.priority === 'high'
    );
    const recent = orderedDocuments.filter(d => 
      d.createdAt >= oneDayAgo && 
      d.priority !== 'urgent' && d.priority !== 'high'
    );
    const myOwn = orderedDocuments.filter(d =>
      d.createdAt < oneDayAgo &&
      d.priority !== 'urgent' && d.priority !== 'high' &&
      (d.assignedTo === currentUserId || d.status === 'in_progress')
    );
    const other = orderedDocuments.filter(d =>
      d.createdAt < oneDayAgo &&
      d.priority !== 'urgent' && d.priority !== 'high' &&
      d.assignedTo !== currentUserId && d.status !== 'in_progress'
    );

    if (urgent.length > 0) groups.push({ title: '🔴 Срочные', docs: urgent });
    if (recent.length > 0) groups.push({ title: '🕐 Недавние', docs: recent });
    if (myOwn.length > 0) groups.push({ title: '👤 Мои документы', docs: myOwn });
    if (other.length > 0) groups.push({ title: null, docs: other });

    return groups;
  }, [orderedDocuments, groupByPriority]);

  // --- Рендер списка документов ---
  if (!documentId) {
    if (loadingList) return <div className="p-4 text-center">Загрузка...</div>;

    return (
      <div className="space-y-4 p-4">
        {/* Умный поиск Spotlight */}
        <div className="bg-surface-secondary rounded-lg p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" size={20} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Поиск по номеру, поставщику, дате, строкам..."
              className="w-full pl-10 pr-4 py-3 border border-borders-default rounded-lg bg-surface-primary focus:outline-none focus:border-brand-primary text-base"
              autoFocus
            />
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary hover:text-content-primary"
              >
                ✕
              </button>
            )}
          </div>

          {/* Быстрые фильтры */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowOnlyIncomplete(!showOnlyIncomplete)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                showOnlyIncomplete
                  ? 'bg-brand-primary text-white'
                  : 'bg-surface-tertiary text-content-secondary'
              }`}
            >
              <Filter size={14} className="inline mr-1" />
              Не завершённые
            </button>
            
            <button
              onClick={() => setGroupByPriority(!groupByPriority)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                groupByPriority
                  ? 'bg-brand-primary text-white'
                  : 'bg-surface-tertiary text-content-secondary'
              }`}
            >
              Группировка
            </button>
          </div>
        </div>

        {/* Старые фильтры */}
        <DocumentListFilter
          onFilterChange={setFilters}
          supplierOptions={supplierOptions}
          showSupplier={true}
        />

        {/* US I.1: Список документов с группировкой */}
        <div className="space-y-4">
          {groupedDocuments.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-3">
              {group.title && (
                <h3 className="font-bold text-sm text-content-tertiary uppercase px-2">
                  {group.title}
                </h3>
              )}
              
              {group.docs.length === 0 && groupIdx === groupedDocuments.length - 1 ? (
                <div className="text-center py-10">
                  <Package className="mx-auto mb-4 text-content-tertiary" size={48} />
                  <p className="text-content-tertiary">
                    {filters.search || filters.status !== 'all'
                      ? 'Нет документов по заданным фильтрам'
                      : 'Нет документов приёмки'}
                  </p>
                </div>
              ) : (
                group.docs.map((doc) => (
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
          ))}
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

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-var(--header-height))]">
        {/* US I.2: Панель активного товара (детальный просмотр) */}
        {activeLine && (
          <div className="fixed inset-0 z-50 bg-surface-primary flex flex-col p-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h2 className="text-xl font-bold">{activeLine.productName}</h2>
                <p className="text-content-secondary font-mono mt-1 text-sm">
                  {activeLine.barcode}
                </p>
                <p className="text-content-tertiary text-xs mt-1">Арт: {activeLine.productSku}</p>
              </div>
              <button
                onClick={() => setActiveLine(null)}
                className="p-2 bg-surface-secondary rounded-full hover:bg-surface-tertiary transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* US I.3: Индикация расхождений */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              <div
                className={`text-6xl font-bold ${
                  activeLine.quantityFact > activeLine.quantityPlan
                    ? 'text-warning'
                    : activeLine.quantityFact === activeLine.quantityPlan
                    ? 'text-success'
                    : 'text-brand-primary'
                }`}
              >
                {activeLine.quantityFact}{' '}
                <span className="text-2xl text-content-tertiary">/ {activeLine.quantityPlan}</span>
              </div>

              {/* US I.3: Предупреждение о расхождениях */}
              {activeLine.quantityFact !== activeLine.quantityPlan && (
                <div
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    activeLine.quantityFact > activeLine.quantityPlan
                      ? 'bg-warning/20 text-warning-dark'
                      : 'bg-error/20 text-error-dark'
                  }`}
                >
                  {activeLine.quantityFact > activeLine.quantityPlan
                    ? `⚠️ Излишек: +${activeLine.quantityFact - activeLine.quantityPlan} шт.`
                    : `⚠️ Недостача: ${activeLine.quantityPlan - activeLine.quantityFact} шт.`}
                </div>
              )}

              {/* US I.2: Управление количеством */}
              <QuantityControl
                current={activeLine.quantityFact}
                plan={activeLine.quantityPlan}
                onChange={(val) => updateQuantity(activeLine.id, val, true)}
              />

              <div className="w-full grid grid-cols-2 gap-4 mt-8">
                <div className="p-3 bg-surface-secondary rounded flex flex-col items-center">
                  <span className="text-sm text-content-tertiary">Статус</span>
                  <span className="font-bold uppercase text-xs mt-1">
                    {activeLine.status === 'completed' && '✅ ВЫПОЛНЕНО'}
                    {activeLine.status === 'partial' && '🟡 ЧАСТИЧНО'}
                    {activeLine.status === 'pending' && '⚪ ОЖИДАЕТ'}
                    {activeLine.status === 'over' && '⚠️ ИЗЛИШЕК'}
                  </span>
                </div>
                <div className="p-3 bg-surface-secondary rounded flex flex-col items-center">
                  <span className="text-sm text-content-tertiary">Осталось</span>
                  <span className="font-bold text-lg">
                    {Math.max(0, activeLine.quantityPlan - activeLine.quantityFact)}
                  </span>
                </div>
              </div>
            </div>

            <Button size="lg" onClick={() => setActiveLine(null)} className="mt-4 w-full">
              Готово
            </Button>
          </div>
        )}

        {/* 2. Основной экран документа */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          {/* US I.2: Поле сканирования */}
          <ScannerInput
            onScan={onScanWithFeedback}
            placeholder="Скан товара или документа..."
            className="sticky top-0 z-10 shadow-md"
          />

          {/* US I.2.3: Статус и прогресс документа */}
          <div className="bg-surface-secondary rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Прогресс приёмки</h3>
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
                <span>Выполнено строк</span>
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

          {/* US I.2: Список строк документа с автосортировкой */}
          <div ref={linesContainerRef} className="space-y-2">
            {lines
              .slice() // Копируем для избежания мутации
              .sort((a, b) => {
                // Сортировка по частоте сканирования (самые частые первые)
                const freqA = lineScanFrequency.get(a.id) || 0;
                const freqB = lineScanFrequency.get(b.id) || 0;
                
                if (freqA !== freqB) {
                  return freqB - freqA;
                }
                
                // Затем по статусу (незавершённые первые)
                if (a.status !== b.status) {
                  const statusOrder = { pending: 0, partial: 1, completed: 2, over: 3 };
                  return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
                }
                
                return 0;
              })
              .map((line, index) => (
                <div 
                  key={line.id}
                  ref={(el) => {
                    if (el) lineRefs.current.set(line.id, el);
                  }}
                  onClick={() => handleLineClick(line)}
                  className="cursor-pointer"
                  style={{
                    // Фиксация позиции для предотвращения прыжков
                    position: 'relative',
                  }}
                >
                  <ReceivingCard
                    line={{
                      id: line.id,
                      documentId: documentId || '',
                      productId: line.productId,
                      productName: line.productName,
                      productSku: line.productSku,
                      barcode: line.barcode,
                      quantity: line.quantityFact,
                      quantityPlan: line.quantityPlan,
                      quantityFact: line.quantityFact,
                      status: line.status === 'over' ? 'completed' : line.status,
                      notes: ''
                    }}
                    onAdjust={(delta) => {
                      updateQuantity(line.id, delta);
                    }}
                  />
                </div>
              ))}
          </div>
        </div>

        {/* US I.4: Кнопка завершения документа */}
        <div className="p-4 border-t border-borders-default bg-surface-primary fixed bottom-0 w-full max-w-3xl">
          <Button
            variant={document.status === 'completed' ? 'secondary' : 'primary'}
            className="w-full"
            onClick={handleFinish}
            disabled={document.status === 'completed'}
          >
            {document.status === 'completed' ? '✅ Документ завершен' : 'Завершить приёмку'}
          </Button>
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

      {/* US I.3.1: Автозавершение */}
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

export default Receiving;
