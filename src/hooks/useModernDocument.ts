/**
 * 📄 USE MODERN DOCUMENT
 * Универсальный хук для работы с документами в новом UX
 * Применяет все паттерны Джеки Рида автоматически
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/db';
import { useAuth } from '@/contexts/AuthContext';
import { useUXTracking } from './useUXTracking';
import { metricsCollector } from '@/metrics/collector';
import { ScanResult } from '@/ui';

interface DocumentLine {
  id: string;
  documentId: string;
  productId: string;
  productName: string;
  productSku: string;
  barcode: string;
  quantityPlan: number;
  quantityFact: number;
  status: 'pending' | 'partial' | 'completed';
  [key: string]: any;
}

interface ModernDocumentOptions {
  docType: 'receiving' | 'picking' | 'shipping' | 'inventory' | 'placement' | 'return';
  docId?: string;
  onComplete?: () => void;
}

export function useModernDocument(options: ModernDocumentOptions) {
  const { docType, docId, onComplete } = options;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [document, setDocument] = useState<any | null>(null);
  const [lines, setLines] = useState<DocumentLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Session tracking
  const [sessionStartTime] = useState(Date.now());
  const [scanCount, setScanCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [hintCount, setHintCount] = useState(0);

  // UX Tracking
  const ux = useUXTracking({
    userId: user?.id || 'anonymous',
    screen: docId ? `${docType}_document` : `${docType}_list`,
    operationType: docType,
    documentId: docId,
  });

  // Таблицы БД по типу документа
  const tables = {
    receiving: { docs: 'receivingDocuments', lines: 'receivingLines' },
    picking: { docs: 'pickingDocuments', lines: 'pickingLines' },
    shipping: { docs: 'shipmentDocuments', lines: 'shipmentLines' },
    inventory: { docs: 'inventoryDocuments', lines: 'inventoryLines' },
    placement: { docs: 'placementDocuments', lines: 'placementLines' },
    return: { docs: 'returnDocuments', lines: 'returnLines' },
  };

  const { docs: docsTable, lines: linesTable } = tables[docType];

  // === Загрузка документа ===
  useEffect(() => {
    if (docId) {
      loadDocument();
    }
  }, [docId]);

  const loadDocument = async () => {
    if (!docId) return;

    setLoading(true);
    setError(null);

    try {
      // @ts-ignore
      const doc = await db[docsTable].get(docId);
      if (!doc) {
        setError('Документ не найден');
        setLoading(false);
        return;
      }

      setDocument(doc);

      // Загрузка строк
      // @ts-ignore
      const docLines = await db[linesTable]
        .where('documentId')
        .equals(docId)
        .toArray();

      setLines(docLines);

      // Обновить статус на "в работе" если новый
      if (doc.status === 'new') {
        // @ts-ignore
        await db[docsTable].update(docId, {
          status: 'in_progress',
          updatedAt: Date.now(),
        });
        setDocument({ ...doc, status: 'in_progress' });
      }
    } catch (err) {
      console.error('Failed to load document:', err);
      setError('Ошибка загрузки документа');
    } finally {
      setLoading(false);
    }
  };

  // === SIGNAL → ACTION → FEEDBACK: Обработка сканирования ===
  const handleScan = useCallback(async (code: string): Promise<ScanResult> => {
    if (!document) {
      return {
        success: false,
        error: 'Документ не загружен',
        guidance: 'Попробуйте перезагрузить страницу',
      };
    }

    setScanCount(prev => prev + 1);

    // Track first scan
    if (scanCount === 0) {
      ux.trackFirstScan();
    }

    // Поиск строки
    const line = lines.find(l => 
      l.barcode === code || 
      l.productSku === code ||
      l.productId === code
    );

    if (!line) {
      // ERROR-AS-GUIDANCE
      setErrorCount(prev => prev + 1);
      setHintCount(prev => prev + 1);

      ux.trackError('product_not_found', true);

      const expectedProducts = lines
        .filter(l => l.status !== 'completed')
        .slice(0, 3)
        .map(l => l.productName);

      return {
        success: false,
        error: `Товар "${code}" не найден в документе`,
        guidance: expectedProducts.length > 0
          ? `Ожидаются: ${expectedProducts.join(', ')}`
          : 'Проверьте штрихкод',
      };
    }

    // Обновить количество (+1)
    const newQuantity = line.quantityFact + 1;
    const newStatus = 
      newQuantity >= line.quantityPlan ? 'completed' :
      newQuantity > 0 ? 'partial' :
      'pending';

    // @ts-ignore
    await db[linesTable].update(line.id, {
      quantityFact: newQuantity,
      status: newStatus,
      updatedAt: Date.now(),
    });

    // Обновить состояние
    setLines(prev => prev.map(l => 
      l.id === line.id 
        ? { ...l, quantityFact: newQuantity, status: newStatus }
        : l
    ));

    // Обновить прогресс документа
    const completedCount = lines.filter(l => 
      l.id === line.id ? newStatus === 'completed' : l.status === 'completed'
    ).length;

    // @ts-ignore
    await db[docsTable].update(document.id, {
      completedLines: completedCount,
      updatedAt: Date.now(),
    });

    setDocument({ ...document, completedLines: completedCount });

    // Track успешного скана
    ux.trackEvent('scan_success', {
      productId: line.productId,
      progress: `${completedCount}/${lines.length}`,
    });

    // AUTO-NAVIGATION: если всё завершено
    const allCompleted = lines.every(l => 
      l.id === line.id ? newStatus === 'completed' : l.status === 'completed'
    );

    if (allCompleted) {
      trackCompletion();
      return {
        success: true,
        message: 'Документ завершён!',
        autoAdvance: true,
      };
    }

    // MICRO-REWARD
    const remaining = lines.length - completedCount;
    setHintCount(prev => prev + 1);

    return {
      success: true,
      message: remaining > 0 
        ? `Отлично! Осталось ${remaining} ${remaining === 1 ? 'позиция' : 'позиций'}`
        : 'Всё готово!',
    };
  }, [document, lines, scanCount, ux, docsTable, linesTable]);

  // === Трекинг завершения ===
  const trackCompletion = useCallback(() => {
    const sessionTime = Date.now() - sessionStartTime;

    metricsCollector.trackCompletionEfficiency({
      userId: user?.id || 'anonymous',
      operationType: docType,
      documentId: document?.id || '',
      totalTime: sessionTime,
      totalItems: lines.length,
      totalErrors: errorCount,
      totalBackNavigations: 0, // TODO: track from navigation
      totalHintsShown: hintCount,
    });
  }, [sessionStartTime, lines.length, errorCount, hintCount, document, user, docType]);

  // === Завершение документа ===
  const completeDocument = useCallback(async () => {
    if (!document) return;

    // @ts-ignore
    await db[docsTable].update(document.id, {
      status: 'completed',
      updatedAt: Date.now(),
      completedAt: Date.now(),
    });

    trackCompletion();

    ux.trackEvent('auto_navigation', {
      from: `${docType}_document`,
      to: `${docType}_list`,
    });

    // Callback
    if (onComplete) {
      onComplete();
    } else {
      // Дефолтная навигация
      setTimeout(() => {
        navigate(`/${docType}`);
      }, 1000);
    }
  }, [document, trackCompletion, ux, onComplete, navigate, docType, docsTable]);

  // === Обновление количества вручную ===
  const updateQuantity = useCallback(async (lineId: string, newQuantity: number) => {
    const line = lines.find(l => l.id === lineId);
    if (!line) return;

    const newStatus = 
      newQuantity >= line.quantityPlan ? 'completed' :
      newQuantity > 0 ? 'partial' :
      'pending';

    // @ts-ignore
    await db[linesTable].update(lineId, {
      quantityFact: newQuantity,
      status: newStatus,
      updatedAt: Date.now(),
    });

    setLines(prev => prev.map(l => 
      l.id === lineId 
        ? { ...l, quantityFact: newQuantity, status: newStatus }
        : l
    ));

    // Обновить прогресс документа
    const completedCount = lines.filter(l => 
      l.id === lineId ? newStatus === 'completed' : l.status === 'completed'
    ).length;

    // @ts-ignore
    await db[docsTable].update(document.id, {
      completedLines: completedCount,
      updatedAt: Date.now(),
    });

    setDocument({ ...document, completedLines: completedCount });
  }, [lines, document, linesTable, docsTable]);

  return {
    document,
    lines,
    loading,
    error,
    handleScan,
    completeDocument,
    updateQuantity,
    scanCount,
    errorCount,
    ux,
  };
}

