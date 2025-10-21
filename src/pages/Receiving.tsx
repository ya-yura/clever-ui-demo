// === 📁 src/pages/Receiving.tsx ===
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderBar } from '@/components/HeaderBar';
import { ScanHint } from '@/components/ScanHint';
import { ProductCard } from '@/components/receiving/ProductCard';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { useScanner } from '@/hooks/useScanner';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useNotifications } from '@/hooks/useNotifications';
import { feedback } from '@/utils/feedback';
import { db } from '@/services/db';
import { api } from '@/services/api';
import { getISOString } from '@/utils/date';
import type { ReceivingDocument, ReceivingItem } from '@/types/receiving';
import demoData from '@/data/receiving.json';

export function Receiving() {
  const navigate = useNavigate();
  const [document, setDocument] = useState<ReceivingDocument | null>(null);
  const [hint, setHint] = useState('Сканируйте документ приёмки');
  const [hintType, setHintType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const { saveReceivingDoc, addToSyncQueue, setupAutoSave } = useOfflineStorage();
  const { success, error } = useNotifications();

  // Загрузка демо-данных при монтировании
  useEffect(() => {
    if (demoData && demoData.length > 0) {
      const firstDoc = demoData[0] as ReceivingDocument;
      setDocument(firstDoc);
      setHint('Документ загружен. Сканируйте товары или измените количество');
      setHintType('success');
    }
  }, []);

  // Автосохранение каждые 30 секунд
  useEffect(() => {
    if (!document) return;
    
    const cleanup = setupAutoSave(async () => {
      await saveReceivingDoc(document);
    }, 30);

    return cleanup;
  }, [document, saveReceivingDoc, setupAutoSave]);

  // Обработка сканирования
  const handleScan = useCallback(async (result: { barcode: string; type: string }) => {
    if (!document) {
      // Загрузка документа по штрихкоду
      if (result.type === 'document') {
        try {
          // В реальности здесь запрос к API
          const mockDoc: ReceivingDocument = {
            id: result.barcode,
            number: result.barcode.replace('DOC-', ''),
            date: getISOString(),
            status: 'in_progress',
            syncStatus: 'pending',
            supplierId: 'SUP-001',
            supplierName: 'ООО "Поставщик"',
            warehouseId: 'WH-001',
            items: [
              {
                id: '1',
                documentId: result.barcode,
                productId: 'PROD-001',
                productName: 'Товар Тестовый 1',
                sku: 'SKU-001',
                barcode: '1234567890',
                quantity: 10,
                unit: 'шт',
                planned: 10,
                received: 0,
                discrepancy: 0,
                status: 'pending'
              },
              {
                id: '2',
                documentId: result.barcode,
                productId: 'PROD-002',
                productName: 'Товар Тестовый 2',
                sku: 'SKU-002',
                barcode: '0987654321',
                quantity: 20,
                unit: 'шт',
                planned: 20,
                received: 0,
                discrepancy: 0,
                status: 'pending'
              }
            ],
            createdAt: getISOString(),
            updatedAt: getISOString()
          };
          
          setDocument(mockDoc);
          await saveReceivingDoc(mockDoc);
          setHint('Документ загружен. Сканируйте товары');
          setHintType('success');
          feedback.success('Документ загружен');
          success('Документ загружен');
        } catch (err) {
          setHint('Ошибка загрузки документа');
          setHintType('error');
          feedback.error('Ошибка загрузки документа');
          error('Ошибка загрузки документа');
        }
      }
    } else {
      // Обработка сканирования товара
      const item = document.items.find(i => i.barcode === result.barcode);
      
      if (item) {
        const updatedDoc = {
          ...document,
          items: document.items.map(i =>
            i.id === item.id
              ? { ...i, received: i.received + 1, discrepancy: i.received + 1 - i.planned }
              : i
          ),
          updatedAt: getISOString()
        };
        
        setDocument(updatedDoc);
        await saveReceivingDoc(updatedDoc);
        await addToSyncQueue('receiving', document.id, 'update', updatedDoc);
        
        setHint(`Товар "${item.productName}" добавлен`);
        setHintType('success');
        feedback.success();
      } else {
        setHint('Товар не найден в документе');
        setHintType('error');
        feedback.error('Товар не найден');
      }
    }
  }, [document, saveReceivingDoc, addToSyncQueue, success, error]);

  useScanner(handleScan);

  // Изменение количества вручную
  const handleQuantityChange = useCallback(async (itemId: string, quantity: number) => {
    if (!document) return;

    const updatedDoc = {
      ...document,
      items: document.items.map(i =>
        i.id === itemId
          ? { ...i, received: quantity, discrepancy: quantity - i.planned }
          : i
      ),
      updatedAt: getISOString()
    };

    setDocument(updatedDoc);
    await saveReceivingDoc(updatedDoc);
  }, [document, saveReceivingDoc]);

  // Завершение приёмки
  const handleComplete = async () => {
    if (!document) return;

    const completedDoc = {
      ...document,
      status: 'completed' as const,
      updatedAt: getISOString()
    };

    await saveReceivingDoc(completedDoc);
    await addToSyncQueue('receiving', document.id, 'complete', completedDoc);
    
    feedback.complete('Приёмка завершена');
    success('Приёмка завершена');

    // Предложение перейти к размещению
    setTimeout(() => {
      if (window.confirm('Перейти к размещению товаров?')) {
        navigate('/placement', { state: { fromReceiving: document.id } });
      } else {
        navigate('/');
      }
    }, 1000);
  };

  const totalItems = document?.items.length || 0;
  const completedItems = document?.items.filter(i => i.received >= i.planned).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <HeaderBar title="📦 Приёмка" />

      <div className="p-4 space-y-4">
        {document && (
          <>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold mb-2">Документ №{document.number}</h2>
              <p className="text-sm text-gray-600">Поставщик: {document.supplierName}</p>
              <div className="mt-3">
                <ProgressBar current={completedItems} total={totalItems} />
              </div>
            </div>

            <div className="space-y-3">
              {document.items.map(item => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </div>

            <Button
              fullWidth
              variant="success"
              onClick={handleComplete}
              disabled={completedItems < totalItems}
            >
              📤 Завершить приёмку
            </Button>
          </>
        )}

        {!document && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold mb-2">Приёмка товаров</h2>
            <p className="text-gray-600">Отсканируйте документ для начала</p>
          </div>
        )}
      </div>

      <ScanHint message={hint} type={hintType} />
    </div>
  );
}

