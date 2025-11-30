// === 📁 src/pages/Receiving.tsx ===
// Receiving module page

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/services/db';
import { api } from '@/services/api';
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
  const { id } = useParams();
  const navigate = useNavigate();
  const analytics = useAnalytics();
  const [document, setDocument] = useState<ReceivingDocument | null>(null);
  const [lines, setLines] = useState<ReceivingLine[]>([]);
  const [documents, setDocuments] = useState<ReceivingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCell, setCurrentCell] = useState<string>('');
  const [highlightedLineId, setHighlightedLineId] = useState<string | null>(null);
  const { setDocumentInfo, setListInfo } = useDocumentHeader();
  
  // Ref to track if we are in the process of completing the document
  // This prevents the cleanup function from stopping the timer if we are about to complete
  const isCompletingRef = React.useRef(false);

  const { addSyncAction } = useOfflineStorage('receiving');
  const { sync, isSyncing, pendingCount } = useSync({
    module: 'receiving',
    syncEndpoint: '/receiving/sync',
  });

  // Update header with document info or list info
  useEffect(() => {
    if (document && id) {
      setDocumentInfo({
        documentId: document.id,
        completed: document.completedLines || 0,
        total: document.totalLines || 0,
      });
      setListInfo(null);
    } else if (!id) {
      setDocumentInfo(null);
      setListInfo({
        title: 'Приёмка',
        count: documents.length,
      });
    }
    
    return () => {
      setDocumentInfo(null);
      setListInfo(null);
    };
  }, [document, id, documents.length, setDocumentInfo, setListInfo]);

  // Load document
  useEffect(() => {
    loadDocument();
    
    if (id) {
      // Track document start
      analytics.track(EventType.DOC_START, {
        documentId: id,
        docType: 'receiving',
        module: 'Приёмка',
      });
      isCompletingRef.current = false;
    }
    
    return () => {
      // Track document exit/completion
      if (id && !isCompletingRef.current) {
        analytics.track(EventType.DOC_COMPLETE, {
           documentId: id,
           docType: 'receiving',
           status: 'aborted' 
        });
      }
    };
  }, [id]);

  const loadDocument = async () => {
    setLoading(true);
    try {
      if (id) {
        // Load specific document
        const doc = await db.receivingDocuments.get(id);
        const docLines = await db.receivingLines.where('documentId').equals(id).toArray();

        if (doc) {
          setDocument(doc);
          setLines(docLines);
        }
      } else {
        // Load all documents
        const allDocs = await db.receivingDocuments.toArray();
        setDocuments(allDocs);
      }
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle scan
  const handleScan = async (code: string) => {
    if (!document) return;

    // Check if it's a document barcode
    if (code.startsWith('DOC-')) {
      // Load document
      navigate(`/receiving/${code}`);
      return;
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
  };

  const { handleScan: onScanWithFeedback, lastScan } = useScanner({
    mode: 'keyboard',
    onScan: handleScan,
  });

  // Update document progress and auto-complete if all lines are done
  const updateDocumentProgress = async () => {
    if (!document) return;

    const completedLines = lines.filter(l => l.status === 'completed').length;
    const totalLines = lines.length;
    
    // Check if all lines are completed
    const allCompleted = totalLines > 0 && completedLines === totalLines;
    
    const updatedDoc = {
      ...document,
      completedLines,
      status: allCompleted ? 'completed' as const : document.status,
      updatedAt: Date.now(),
    };

    await db.receivingDocuments.update(document.id, updatedDoc);
    setDocument(updatedDoc);
    
    // Auto-complete and navigate when all done
    if (allCompleted && document.status !== 'completed') {
      // Mark as completing so cleanup doesn't stop the timer
      isCompletingRef.current = true;

      await addSyncAction('complete', updatedDoc);
      sync();
      
      // Show success feedback
      feedback.success('Приёмка завершена!');

      // Track completion
      analytics.track(EventType.DOC_COMPLETE, {
        documentId: document.id,
        docType: 'receiving',
        status: 'completed',
        totalLines: totalLines
      });
      
      // Navigate after short delay
      setTimeout(() => {
        if (confirm('Документ завершён. Перейти к размещению?')) {
          navigate(`/placement?source=${document.id}`);
        } else {
          navigate('/receiving');
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
      
      if (!window.confirm(message)) {
        return;
      }
    }
    
    const updatedDoc = {
      ...document,
      status: 'completed' as const,
      completedLines: lines.filter(l => l.status === 'completed').length,
      updatedAt: Date.now(),
    };

    await db.receivingDocuments.update(document.id, updatedDoc);
    setDocument(updatedDoc);
    
    isCompletingRef.current = true;

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

    const newFact = Math.max(0, line.quantityFact + delta);
    const updatedLine: ReceivingLine = {
      ...line,
      quantityFact: newFact,
      status: newFact >= line.quantityPlan ? 'completed' : newFact > 0 ? 'partial' : 'pending' as const,
    };

    await db.receivingLines.update(lineId, updatedLine);
    await addSyncAction('update_line', updatedLine);
    
    setLines(prev => prev.map(l => l.id === lineId ? updatedLine : l));
    updateDocumentProgress();
  };

    if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // Show document list if no id specified
  if (!id) {
    return (
      <div className="space-y-4">
        {documents.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-content-tertiary">
              Нет документов приёмки
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => navigate(`/receiving/${doc.id}`)}
                className="card hover:shadow-lg hover:border-brand-primary transition-all text-left p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-content-primary">
                      {doc.id}
                    </h3>
                    {doc.supplier && (
                      <p className="text-sm text-content-secondary mt-1">
                        Поставщик: {doc.supplier}
                      </p>
                    )}
                    {doc.deliveryNumber && (
                      <p className="text-sm text-content-secondary">
                        Номер поставки: {doc.deliveryNumber}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`status-badge ${
                      doc.status === 'completed' ? 'bg-success-light text-success-dark' :
                      doc.status === 'in_progress' ? 'bg-warning-light text-warning-dark' :
                      'bg-surface-tertiary text-content-secondary'
                    }`}>
                      {doc.status === 'completed' ? 'Завершен' :
                       doc.status === 'in_progress' ? 'В работе' :
                       'Ожидает'}
                    </span>
                    <p className="text-sm text-content-tertiary mt-2">
                      {doc.completedLines} / {doc.totalLines} строк
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <p className="text-content-secondary">Документ не найден</p>
      </div>
    );
  }

  const progress = document.totalLines > 0 
    ? (document.completedLines / document.totalLines) * 100 
    : 0;

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
        ))}
      </div>

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
    </div>
  );
};

export default Receiving;
