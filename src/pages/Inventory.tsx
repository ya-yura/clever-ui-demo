// === 📁 src/pages/Inventory.tsx ===
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderBar } from '@/components/HeaderBar';
import { ScanHint } from '@/components/ScanHint';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { Input } from '@/components/Input';
import { useScanner } from '@/hooks/useScanner';
import { useNotifications } from '@/hooks/useNotifications';
import { feedback } from '@/utils/feedback';
import type { InventoryDocument } from '@/types/inventory';
import demoData from '@/data/inventory.json';

export function Inventory() {
  const navigate = useNavigate();
  const [document, setDocument] = useState<InventoryDocument | null>(null);
  const [currentCell, setCurrentCell] = useState<string | null>(null);
  const [hint, setHint] = useState('Сканируйте ячейку для инвентаризации');
  const [hintType, setHintType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const { success, error } = useNotifications();

  // Загрузка демо-данных при монтировании
  useEffect(() => {
    if (demoData && demoData.length > 0) {
      const firstDoc = demoData[0] as InventoryDocument;
      setDocument(firstDoc);
      setHint('Документ загружен. Сканируйте ячейку или товары для инвентаризации');
      setHintType('success');
    }
  }, []);

  const handleScan = useCallback((result: { barcode: string; type: string }) => {
    if (!document) return;

    if (result.type === 'cell') {
      setCurrentCell(result.barcode);
      const item = document.items.find(i => i.cellBarcode === result.barcode);
      if (item) {
        setHint(`Ячейка ${item.cellId}. Сканируйте товар`);
        setHintType('success');
        feedback.success();
      } else {
        setHint(`Ячейка не найдена в документе`);
        setHintType('warning');
        feedback.warning();
      }
    } else if (result.type === 'product') {
      const item = document.items.find(i => i.barcode === result.barcode && i.status === 'pending');
      if (item) {
        const updatedDoc = {
          ...document,
          items: document.items.map(i =>
            i.id === item.id
              ? { 
                  ...i, 
                  actualQuantity: i.actualQuantity + 1, 
                  discrepancy: i.actualQuantity + 1 - i.expectedQuantity,
                  status: 'counted' as const,
                  countedAt: new Date().toISOString()
                }
              : i
          )
        };
        setDocument(updatedDoc);
        setHint(`Товар "${item.productName}" пересчитан`);
        setHintType('success');
        feedback.success();
      } else {
        setHint('Товар не найден или уже пересчитан');
        setHintType('error');
        feedback.error();
      }
    }
  }, [currentCell, document]);

  useScanner(handleScan);

  const handleQuantityChange = (itemId: string, actualQuantity: number) => {
    if (!document) return;
    const item = document.items.find(i => i.id === itemId);
    if (!item) return;

    const updatedDoc = {
      ...document,
      items: document.items.map(i =>
        i.id === itemId
          ? { 
              ...i, 
              actualQuantity, 
              discrepancy: actualQuantity - i.expectedQuantity,
              status: 'counted' as const,
              countedAt: new Date().toISOString()
            }
          : i
      )
    };
    setDocument(updatedDoc);
  };

  const handleComplete = () => {
    if (!document) return;
    feedback.complete('Инвентаризация завершена');
    success('Инвентаризация завершена');
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const totalItems = document?.items.length || 0;
  const countedItems = document?.items.filter(i => i.status === 'counted').length || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <HeaderBar title="🧮 Инвентаризация" />
      <div className="p-4 space-y-4">
        {document && (
          <>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold mb-2">Инвентаризация №{document.number}</h2>
              <p className="text-sm text-gray-600">Зона: {document.zone}</p>
              <p className="text-sm text-gray-600">Ответственный: {document.responsiblePerson}</p>
              <div className="mt-3">
                <ProgressBar current={countedItems} total={totalItems} />
              </div>
            </div>

            {currentCell && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-primary-700">
                  Активная ячейка: {currentCell}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {document.items.map(item => (
                <Card key={item.id}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{item.productName}</h3>
                        <p className="text-xs text-gray-500">Артикул: {item.sku}</p>
                        <p className="text-xs text-gray-500">Ячейка: {item.cellId}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-gray-600">Факт</label>
                        <Input
                          type="number"
                          value={item.actualQuantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                          min={0}
                        />
                      </div>
                      <div className="text-center pt-5">
                        <span className="text-xs text-gray-600">План</span>
                      </div>
                      <div className="flex-1 pt-5">
                        <div className="bg-gray-100 rounded p-2 text-center font-semibold">
                          {item.expectedQuantity}
                        </div>
                      </div>
                    </div>

                    {item.discrepancy !== 0 && item.status === 'counted' && (
                      <div className={`text-xs ${item.discrepancy > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Расхождение: {item.discrepancy > 0 ? '+' : ''}{item.discrepancy} {item.unit}
                      </div>
                    )}

                    {item.countedAt && (
                      <div className="text-xs text-gray-500">
                        Пересчитано: {new Date(item.countedAt).toLocaleString('ru-RU')}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <Button
              fullWidth
              variant="success"
              onClick={handleComplete}
              disabled={countedItems < totalItems}
            >
              ✅ Завершить инвентаризацию
            </Button>
          </>
        )}

        {!document && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🧮</div>
            <h2 className="text-xl font-semibold mb-2">Инвентаризация</h2>
            <p className="text-gray-600">Отсканируйте ячейку для начала</p>
          </div>
        )}
      </div>
      <ScanHint message={hint} type={hintType} />
    </div>
  );
}

