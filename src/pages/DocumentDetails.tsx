// === 📁 src/pages/DocumentDetails.tsx ===
// Document details page with items table

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { ODataDocumentItem } from '@/types/odata';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';
import { useAuth } from '@/contexts/AuthContext';
import { demoDataService } from '@/services/demoDataService';

// Short titles for document types
const SHORT_TITLES: Record<string, string> = {
  PrihodNaSklad: 'Приход',
  RazmeshhenieVYachejki: 'Размещение',
  PodborZakaza: 'Подбор',
  Otgruzka: 'Отгрузка',
  Inventarizaciya: 'Инвентаризация',
  Vozvrat: 'Возврат',
};

interface DocumentData {
  id: string;
  name: string;
  documentTypeName: string;
  description?: string;
  finished: boolean;
  inProcess: boolean;
  declaredItems?: ODataDocumentItem[];
  currentItems?: ODataDocumentItem[];
  combinedItems?: ODataDocumentItem[];
}

const DocumentDetails: React.FC = () => {
  const { docTypeUni, docId } = useParams<{ docTypeUni: string; docId: string }>();
  const navigate = useNavigate();
  const { setListInfo } = useDocumentHeader();
  const { isDemo } = useAuth();

  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (docId) {
      loadDocument();
    }
  }, [docId, isDemo]);

  // Update header
  useEffect(() => {
    if (document) {
      const shortTitle = SHORT_TITLES[docTypeUni || ''] || docTypeUni || 'Документ';
      const mergedCount = document.combinedItems?.length
        ?? document.declaredItems?.length
        ?? document.currentItems?.length
        ?? 0;
      setListInfo({
        title: shortTitle,
        count: mergedCount,
      });
    }

    return () => {
      setListInfo(null);
    };
  }, [document, docTypeUni, setListInfo]);

  const extractDocument = (data: any): DocumentData | null => {
    if (!data) return null;
    if (Array.isArray(data?.value)) {
      return data.value[0] || null;
    }
    return data as DocumentData;
  };

  const fetchDocument = async (withProducts: boolean) => {
    const expandBase = ['declaredItems', 'currentItems', 'combinedItems'];
    const expand = withProducts
      ? expandBase.map((path) => `${path}($expand=product)`)
      : expandBase;

    const response = await api.getDocumentById(docId!, expand);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Не удалось загрузить документ');
    }

    const doc = extractDocument(response.data);
    if (!doc) {
      throw new Error('Документ не найден');
    }

    return doc;
  };

  const loadDocument = async () => {
    if (!docId) return;

    console.log(`📄 [DOC] Loading document: ${docId} (demo mode: ${isDemo})`);

    try {
      setLoading(true);
      setError(null);
      
      // Use demo data if in demo mode
      if (isDemo) {
        console.log('📦 [DEMO] Loading document from demo service');
        const expand = ['declaredItems($expand=product)', 'currentItems($expand=product)', 'combinedItems($expand=product)'];
        const demoResponse = demoDataService.getDocumentById(docId, expand);
        
        if (!demoResponse || !demoResponse.success) {
          throw new Error('Документ не найден в демо-данных');
        }
        
        console.log('✅ [DEMO] Document loaded from demo service', demoResponse.data);
        setDocument(demoResponse.data);
      } else {
        // Load from API
        try {
          const doc = await fetchDocument(true);
          console.log(`📄 [DOC] Loaded document with products`, doc);
          setDocument(doc);
        } catch (primaryError) {
          console.warn('⚠️ [DOC] Failed to load with product expand, retrying without product details', primaryError);
          const doc = await fetchDocument(false);
          console.log(`📄 [DOC] Loaded document without product expand`, doc);
          setDocument(doc);
        }
      }
    } catch (error: any) {
      console.error('❌ [DOC] Error loading document:', error);
      setError(isDemo 
        ? 'Ошибка загрузки документа из демо-данных.' 
        : 'Ошибка загрузки документа. Проверьте подключение к серверу.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!document) return null;
    if (document.finished) {
      return <span className="px-2 py-1 bg-green-600/80 text-white text-[10px] rounded-full uppercase tracking-wide">Завершён</span>;
    }
    if (document.inProcess) {
      return <span className="px-2 py-1 bg-brand-primary/80 text-white text-[10px] rounded-full uppercase tracking-wide">В работе</span>;
    }
    return <span className="px-2 py-1 bg-gray-500/80 text-white text-[10px] rounded-full uppercase tracking-wide">Новый</span>;
  };

  // Merge declared and current items for display
  const getMergedItems = (): ODataDocumentItem[] => {
    if (!document) return [];
    
    // Prefer combinedItems if available
    if (document.combinedItems && document.combinedItems.length > 0) {
      return document.combinedItems;
    }

    // Otherwise merge declaredItems and currentItems
    const declared = document.declaredItems || [];
    const current = document.currentItems || [];

    // Create a map of all items by productId
    const itemsMap = new Map<string, ODataDocumentItem>();

    // Add declared items
    declared.forEach((item) => {
      const key = item.productId || item.uid;
      itemsMap.set(key, { ...item });
    });

    // Merge current items
    current.forEach((item) => {
      const key = item.productId || item.uid;
      const existing = itemsMap.get(key);
      if (existing) {
        // Update current quantity
        existing.currentQuantity = item.currentQuantity;
        existing.currentQuantityWithBinding = item.currentQuantityWithBinding;
      } else {
        itemsMap.set(key, { ...item });
      }
    });

    return Array.from(itemsMap.values()).sort((a, b) => a.index - b.index);
  };

  const items = getMergedItems();

  const formatQuantity = (value: number | undefined | null) => {
    if (value === undefined || value === null || Number.isNaN(Number(value))) {
      return '0';
    }
    return Number(value).toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });
  };

  type ItemStatus = 'pending' | 'progress' | 'done' | 'over';

  const getItemStatus = (planned: number, actual: number): ItemStatus => {
    if (planned <= 0 && actual <= 0) return 'pending';
    if (actual === 0) return 'pending';
    if (actual >= planned && planned > 0) return actual > planned ? 'over' : 'done';
    if (actual > 0 && actual < planned) return 'progress';
    return 'pending';
  };

  const STATUS_META: Record<
    ItemStatus,
    { label: string; badge: string; border: string; progress: string }
  > = {
    pending: {
      label: 'Не начато',
      badge: 'ring-1 ring-inset',
      border: '',
      progress: '',
    },
    progress: {
      label: 'В работе',
      badge: 'ring-1 ring-inset',
      border: '',
      progress: '',
    },
    done: {
      label: 'Готово',
      badge: '',
      border: '',
      progress: '',
    },
    over: {
      label: 'Переполнено',
      badge: 'ring-1 ring-inset',
      border: '',
      progress: '',
    },
  };

  const normalizedItems = useMemo(() => {
    const mapped = items.map((item, index) => {
      const planned = typeof item.declaredQuantity === 'number'
        ? item.declaredQuantity
        : Number(item.quantityPlan ?? item.plan ?? 0);
      const actualCandidate =
        item.currentQuantity ?? item.currentQuantityWithBinding ?? item.quantityFact ?? item.factQuantity ?? 0;
      const actual = typeof actualCandidate === 'number' ? actualCandidate : Number(actualCandidate || 0);
      const status = getItemStatus(planned, actual);
      const diff = actual - planned;
      const diffLabel = diff === 0 ? '0' : diff > 0 ? `+${formatQuantity(diff)}` : formatQuantity(diff);
      const diffColor = diff === 0 ? '' : diff > 0 ? '' : '';
      const completion =
        planned <= 0 && actual > 0
          ? 100
          : planned <= 0
          ? 0
          : Math.min(100, (actual / planned) * 100);

      return {
        raw: item,
        index,
        planned,
        actual,
        status,
        diff,
        diffLabel,
        diffColor,
        completion,
      };
    });

    // Sort by priority: progress (1) -> over (2) -> pending (3) -> done (4)
    return mapped.sort((a, b) => {
      const priorityA = a.status === 'progress' ? 1 : a.status === 'over' ? 2 : a.status === 'pending' ? 3 : 4;
      const priorityB = b.status === 'progress' ? 1 : b.status === 'over' ? 2 : b.status === 'pending' ? 3 : 4;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If same priority, sort alphabetically by product name
      const nameA = a.raw.product?.name || a.raw.productName || '';
      const nameB = b.raw.product?.name || b.raw.productName || '';
      return nameA.localeCompare(nameB);
    });
  }, [items]);

  const statusCounters = normalizedItems.reduce(
    (acc, entry) => {
      acc[entry.status] += 1;
      return acc;
    },
    { pending: 0, progress: 0, done: 0, over: 0 },
  );

  const [statusFilters, setStatusFilters] = useState<Set<ItemStatus>>(new Set());

  const filteredItems = statusFilters.size === 0
    ? normalizedItems
    : normalizedItems.filter((entry) => statusFilters.has(entry.status));

  const toggleStatusFilter = (status: ItemStatus) => {
    setStatusFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
  };

  const STATUS_SUMMARY: Array<{
    key: 'progress' | 'pending' | 'done' | 'over';
    label: string;
  }> = [
    { key: 'progress', label: 'В работе' },
    { key: 'pending', label: 'Не начато' },
    { key: 'done', label: 'Готово' },
    { key: 'over', label: 'Переп.' },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📋</div>
          <p className="text-xl text-content-tertiary">Загрузка документа...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !document) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-error mb-2">Ошибка загрузки</h2>
          <p className="text-content-tertiary mb-6">{error || 'Документ не найден'}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={loadDocument}
              className="bg-brand-primary hover:brightness-90 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Повторить
            </button>
            <button
              onClick={() => navigate(`/docs/${docTypeUni}`)}
              className="bg-surface-tertiary hover:brightness-90 text-content-primary px-6 py-3 rounded-lg transition-colors"
            >
              Назад к списку
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Document header (compact) */}
      <div className="bg-surface-tertiary border border-border-default rounded-md px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-content-primary truncate">{document.name || document.id}</p>
          {document.description && (
            <p className="text-xs text-content-tertiary truncate">{document.description}</p>
          )}
        </div>
        <div className="shrink-0">
          {getStatusBadge()}
        </div>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-4 gap-1">
          {STATUS_SUMMARY.map((stat) => {
            const isActive = statusFilters.has(stat.key);
            const statusStyle = `status-${stat.key}`;
            return (
              <button
                key={stat.key}
                onClick={() => toggleStatusFilter(stat.key)}
                className={`w-full px-2 py-2 rounded-md text-left transition-all text-[11px] ${statusStyle} ${
                  isActive ? 'ring-2 ring-offset-2 ring-brand-primary ring-offset-surface-primary' : ''
                }`}
                style={{
                  backgroundColor: `var(--status-${stat.key}-bg)`,
                  color: `var(--status-${stat.key}-text)`,
                }}
              >
                <div className="text-[9px] uppercase tracking-wide opacity-70">{stat.label}</div>
                <div className="text-lg font-semibold">{statusCounters[stat.key]}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Items list */}
      {items.length === 0 ? (
        <div className="text-center py-12 bg-surface-secondary border border-border-default rounded-lg">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl text-content-tertiary mb-2">Нет строк</h3>
          <p className="text-sm text-content-tertiary opacity-80">
            В документе пока нет товаров
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {filteredItems.map(({ raw: item, index, planned, actual, status, diff, diffLabel, diffColor, completion }) => {
            const productName =
              item.product?.name || item.productName || item.productMarking || item.productId || '—';
            const article =
              item.product?.marking || item.product?.barcode || item.productBarcode || item.productMarking || '—';
            const location =
              item.firstCellId ||
              item.secondCellId ||
              item.firstStorageBarcode ||
              item.secondStorageBarcode ||
              item.firstStorageId ||
              item.secondStorageId ||
              '—';

            const statusMeta = STATUS_META[status];

            return (
              <div
                key={item.uid || index}
                className="bg-surface-secondary rounded-xl border px-3 py-2 shadow-sm"
                style={{
                  borderColor: `var(--status-${status}-border)`,
                }}
              >
                <div className="flex items-center gap-2">
                  {diff !== 0 && (
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                      style={{
                        color: diff > 0 ? 'var(--diff-positive)' : 'var(--diff-negative)',
                        backgroundColor: diff > 0 ? 'rgba(217, 119, 6, 0.15)' : 'rgba(220, 38, 38, 0.15)',
                        borderColor: diff > 0 ? 'var(--diff-positive)' : 'var(--diff-negative)',
                      }}
                    >
                      {diffLabel}
                    </span>
                  )}
                  <p className="font-semibold text-sm text-content-primary truncate flex-1">{productName}</p>
                  <span 
                    className={`text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap ${statusMeta.badge}`}
                    style={{
                      backgroundColor: `var(--status-${status}-bg)`,
                      color: `var(--status-${status}-text)`,
                      borderColor: `var(--status-${status}-border)`,
                    }}
                  >
                    {statusMeta.label}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-mono">
                  <span className="bg-surface-tertiary text-content-secondary rounded px-2 py-0.5 truncate">Артикул: {article}</span>
                  <span className="bg-info/20 text-info rounded px-2 py-0.5 truncate">Место: {location}</span>
                  <div className="flex items-center gap-2 text-[11px] text-content-primary">
                    <span>Пл {formatQuantity(planned)}</span>
                    <span>Факт {formatQuantity(actual)}</span>
                  </div>
                </div>

                {/* Removed progress bar as per request */}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary stats */}
      {items.length > 0 && (
        <div className="bg-surface-tertiary rounded-lg p-3 border border-border-default">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="text-xl font-bold text-content-primary">{items.length}</div>
              <div className="text-xs text-content-tertiary">Строк</div>
            </div>
            <div>
              <div className="text-xl font-bold text-content-primary">
                {formatQuantity(items.reduce((sum, item) => {
                  const planned = typeof item.declaredQuantity === 'number' ? item.declaredQuantity : Number(item.quantityPlan ?? item.plan ?? 0);
                  return sum + (Number.isFinite(planned) ? planned : 0);
                }, 0))}
              </div>
              <div className="text-xs text-content-tertiary">План</div>
            </div>
            <div>
              <div className="text-xl font-bold text-success">
                {formatQuantity(items.reduce((sum, item) => {
                  const actual = item.currentQuantity ?? item.currentQuantityWithBinding ?? item.quantityFact ?? item.factQuantity ?? 0;
                  const val = typeof actual === 'number' ? actual : Number(actual || 0);
                  return sum + (Number.isFinite(val) ? val : 0);
                }, 0))}
              </div>
              <div className="text-xs text-content-tertiary">Факт</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetails;

