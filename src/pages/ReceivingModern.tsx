/**
 * 📦 RECEIVING (MODERN UX)
 * Приёмка товара с применением паттернов коммуникации Джеки Рида
 * 
 * Применённые принципы:
 * - Signal → Action → Feedback
 * - Chunking (группировка документов и позиций)
 * - Progressive Disclosure
 * - Single Path Flow
 * - Error-as-Guidance
 * - Contextual Hints
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/services/db';
import { useAuth } from '@/contexts/AuthContext';
import { useUXTracking } from '@/hooks/useUXTracking';

// Новые UX-компоненты
import {
  DocumentChunkedList,
  DocumentHeader,
  ScannerScreen,
  ItemList,
  MicroHintOverlay,
  ErrorHint,
  ProgressStats,
  ScanResult,
} from '@/ui';

import { ReceivingDocument } from '@/types/receiving';

export const ReceivingModern: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [documents, setDocuments] = useState<ReceivingDocument[]>([]);
  const [currentDocument, setCurrentDocument] = useState<ReceivingDocument | null>(null);
  const [lines, setLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanError, setScanError] = useState<{ error: string; guidance: string } | null>(null);

  // UX Tracking
  const ux = useUXTracking({
    userId: user?.id || 'anonymous',
    screen: id ? 'receiving_document' : 'receiving_list',
    operationType: 'receiving',
    documentId: id,
  });

  // === CHUNKING: Загрузка документов ===
  useEffect(() => {
    if (!id) {
      loadDocuments();
    } else {
      loadDocument(id);
    }
  }, [id]);

  const loadDocuments = async () => {
    const startTime = Date.now();
    setLoading(true);

    try {
      const docs = await db.receivingDocuments.toArray();
      setDocuments(docs);
      
      // Track search time
      ux.trackEvent('chunked_view', { 
        documentsCount: docs.length,
        loadTime: Date.now() - startTime,
      });
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocument = async (docId: string) => {
    setLoading(true);

    try {
      const doc = await db.receivingDocuments.get(docId);
      if (!doc) {
        navigate('/receiving');
        return;
      }

      setCurrentDocument(doc);

      // Загрузка строк
      const docLines = await db.receivingLines
        .where('documentId')
        .equals(docId)
        .toArray();

      setLines(docLines);

      // Обновить статус документа на "в работе" если новый
      if (doc.status === 'new') {
        await db.receivingDocuments.update(docId, {
          status: 'in_progress',
          updatedAt: Date.now(),
        });
      }
    } catch (error) {
      console.error('Failed to load document:', error);
    } finally {
      setLoading(false);
    }
  };

  // === SIGNAL → ACTION → FEEDBACK: Обработка сканирования ===
  const handleScan = async (code: string): Promise<ScanResult> => {
    if (!currentDocument) {
      return {
        success: false,
        error: 'Документ не загружен',
        guidance: 'Попробуйте перезагрузить страницу',
      };
    }

    // Track first scan
    if (lines.every(l => l.quantityFact === 0)) {
      ux.trackFirstScan();
    }

    // Поиск строки по штрихкоду
    const line = lines.find(l => 
      l.barcode === code || 
      l.productSku === code
    );

    if (!line) {
      // ERROR-AS-GUIDANCE
      setScanError({
        error: `Товар "${code}" не найден в документе`,
        guidance: `Ожидаются: ${lines
          .filter(l => l.status !== 'completed')
          .slice(0, 3)
          .map(l => l.productName)
          .join(', ')}`,
      });

      ux.trackError('product_not_found', true);

      return {
        success: false,
        error: `Товар не найден в документе`,
        guidance: `Проверьте штрихкод и попробуйте снова`,
      };
    }

    // Обновить количество (+1)
    const newQuantity = line.quantityFact + 1;
    const newStatus = 
      newQuantity === line.quantityPlan ? 'completed' :
      newQuantity > 0 ? 'partial' :
      'pending';

    await db.receivingLines.update(line.id, {
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

    await db.receivingDocuments.update(currentDocument.id, {
      completedLines: completedCount,
      updatedAt: Date.now(),
    });

    setCurrentDocument(prev => prev ? {
      ...prev,
      completedLines: completedCount,
    } : null);

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
      return {
        success: true,
        message: 'Приёмка завершена!',
        autoAdvance: true,
      };
    }

    // MICRO-REWARD
    const remaining = lines.length - completedCount;
    return {
      success: true,
      message: remaining > 0 
        ? `Отлично! Осталось ${remaining} ${remaining === 1 ? 'позиция' : 'позиций'}`
        : 'Всё готово!',
    };
  };

  // === AUTO-NAVIGATION: Завершение документа ===
  const handleComplete = async () => {
    if (!currentDocument) return;

    await db.receivingDocuments.update(currentDocument.id, {
      status: 'completed',
      updatedAt: Date.now(),
    });

    // Track completion
    ux.trackEvent('auto_navigation', {
      from: 'receiving_document',
      to: 'receiving_list',
    });

    // Предложить перейти к размещению
    setTimeout(() => {
      if (confirm('Приёмка завершена. Перейти к размещению?')) {
        navigate(`/placement/create?source=${currentDocument.id}`);
      } else {
        navigate('/receiving');
      }
    }, 500);
  };

  // === PROGRESSIVE DISCLOSURE: Показать только необходимую информацию ===
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  // === CHUNKING: Список документов ===
  if (!id) {
    const mappedDocuments = documents.map(doc => ({
      id: doc.id,
      number: doc.id,
      type: 'Приёмка',
      status: doc.status === 'completed' ? 'success' as const :
              doc.status === 'in_progress' ? 'inProgress' as const :
              'pending' as const,
      date: new Date(doc.createdAt),
      itemsCount: doc.totalLines,
      completed: doc.completedLines,
    }));

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Приёмка</h1>
          <p className="text-sm text-gray-600 mt-1">
            {documents.length} {documents.length === 1 ? 'документ' : 'документов'}
          </p>
        </div>

        <div className="p-4">
          <DocumentChunkedList
            documents={mappedDocuments}
            onDocumentClick={(docId) => {
              ux.trackNavigation(`/receiving/${docId}`, 'manual');
              navigate(`/receiving/${docId}`);
            }}
          />
        </div>

        {/* CONTEXTUAL HINT */}
        <MicroHintOverlay
          position="bottom"
          message="Выберите документ или отсканируйте QR-код"
          status="neutral"
          showIcon={true}
          persistent={true}
        />
      </div>
    );
  }

  // === SINGLE PATH FLOW: Экран документа ===
  if (!currentDocument) {
    return (
      <div className="p-4">
        <ErrorHint
          error="Документ не найден"
          guidance="Вернитесь к списку документов"
          onDismiss={() => navigate('/receiving')}
        />
      </div>
    );
  }

  const mappedLines = lines.map(line => ({
    id: line.id,
    name: line.productName,
    barcode: line.barcode,
    expected: line.quantityPlan,
    scanned: line.quantityFact,
    cell: line.cellId,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* FIRST GLANCE UNDERSTANDING */}
      <DocumentHeader
        documentType="Приёмка"
        documentNumber={currentDocument.id}
        completed={currentDocument.completedLines || 0}
        total={currentDocument.totalLines || 0}
        nextAction={
          currentDocument.completedLines === currentDocument.totalLines
            ? undefined
            : 'Сканируйте следующий товар'
        }
        date={new Date(currentDocument.createdAt)}
        onBack={() => {
          ux.trackNavigation('/receiving', 'back');
          navigate('/receiving');
        }}
      />

      {/* SCANNER SCREEN с Signal → Action → Feedback */}
      <ScannerScreen
        signalText="Сканируйте товар из документа"
        signalSubtext="Каждое сканирование автоматически добавляет +1"
        expectedType="Штрихкод товара"
        onScan={handleScan}
        currentProgress={{
          current: currentDocument.completedLines || 0,
          total: currentDocument.totalLines || 0,
        }}
        autoNavigateOnComplete={true}
        onComplete={handleComplete}
      />

      {/* ERROR-AS-GUIDANCE */}
      {scanError && (
        <div className="fixed bottom-20 left-4 right-4 z-50">
          <ErrorHint
            error={scanError.error}
            guidance={scanError.guidance}
            onDismiss={() => setScanError(null)}
            autoDismiss={5000}
          />
        </div>
      )}

      {/* CHUNKING: Список позиций с группировкой */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Позиции документа</h3>
        
        <ItemList
          items={mappedLines}
          onItemClick={(lineId) => {
            // Progressive Disclosure - показать детали
            ux.trackEvent('progressive_disclosure', { lineId });
          }}
        />
      </div>

      {/* PROGRESS STATS */}
      <div className="p-4">
        <ProgressStats
          completed={currentDocument.completedLines || 0}
          total={currentDocument.totalLines || 0}
          title="Статистика приёмки"
        />
      </div>
    </div>
  );
};

export default ReceivingModern;

