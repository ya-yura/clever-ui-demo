// === 📁 src/pages/Placement.tsx ===
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
import type { PlacementDocument, PlacementItem } from '@/types/placement';
import demoData from '@/data/placement.json';

export function Placement() {
  const navigate = useNavigate();
  const [document, setDocument] = useState<PlacementDocument | null>(null);
  const [currentCell, setCurrentCell] = useState<string | null>(null);
  const [hint, setHint] = useState('Сканируйте ячейку назначения');
  const [hintType, setHintType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const { success, error } = useNotifications();

  // Загрузка демо-данных при монтировании
  useEffect(() => {
    if (demoData && demoData.length > 0) {
      const firstDoc = demoData[0] as PlacementDocument;
      setDocument(firstDoc);
      setHint('Документ загружен. Сканируйте ячейку для размещения товара');
      setHintType('success');
    }
  }, []);

  const handleScan = useCallback((result: { barcode: string; type: string }) => {
    if (!document) return;

    if (result.type === 'cell') {
      setCurrentCell(result.barcode);
      setHint(`Ячейка ${result.barcode} активна. Сканируйте товары`);
      setHintType('success');
      feedback.success();
    } else if (result.type === 'product' && currentCell) {
      const item = document.items.find(i => i.barcode === result.barcode);
      if (item && item.remaining > 0) {
        const updatedDoc = {
          ...document,
          items: document.items.map(i =>
            i.id === item.id
              ? { ...i, placed: i.placed + 1, remaining: i.remaining - 1, status: i.remaining === 1 ? 'completed' as const : 'partial' as const }
              : i
          )
        };
        setDocument(updatedDoc);
        setHint(`Товар "${item.productName}" размещён в ${currentCell}`);
        setHintType('success');
        feedback.success();
      } else {
        setHint('Товар не найден или уже размещён');
        setHintType('error');
        feedback.error();
      }
    } else {
      setHint('Сначала отсканируйте ячейку');
      setHintType('error');
      feedback.error();
    }
  }, [currentCell, document]);

  useScanner(handleScan);

  const handleQuantityChange = (itemId: string, placed: number) => {
    if (!document) return;
    const item = document.items.find(i => i.id === itemId);
    if (!item) return;

    const updatedDoc = {
      ...document,
      items: document.items.map(i =>
        i.id === itemId
          ? { ...i, placed, remaining: i.quantity - placed, status: placed >= i.quantity ? 'completed' as const : placed > 0 ? 'partial' as const : 'pending' as const }
          : i
      )
    };
    setDocument(updatedDoc);
  };

  const handleComplete = () => {
    if (!document) return;
    feedback.complete('Размещение завершено');
    success('Размещение завершено');
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const totalItems = document?.items.length || 0;
  const completedItems = document?.items.filter(i => i.placed >= i.quantity).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <HeaderBar title="🏷️ Размещение" />
      <div className="p-4 space-y-4">
        {document && (
          <>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold mb-2">Документ №{document.number}</h2>
              <p className="text-sm text-gray-600 mb-3">Размещение товаров</p>
              <ProgressBar current={completedItems} total={totalItems} />
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
                        <label className="text-xs text-gray-600">Размещено</label>
                        <Input
                          type="number"
                          value={item.placed}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                          min={0}
                          max={item.quantity}
                        />
                      </div>
                      <div className="text-center pt-5">
                        <span className="text-xs text-gray-600">из</span>
                      </div>
                      <div className="flex-1 pt-5">
                        <div className="bg-gray-100 rounded p-2 text-center font-semibold">
                          {item.quantity}
                        </div>
                      </div>
                    </div>

                    {item.remaining > 0 && (
                      <div className="text-xs text-orange-600">
                        Осталось разместить: {item.remaining} {item.unit}
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
              disabled={completedItems < totalItems}
            >
              ✅ Завершить размещение
            </Button>
          </>
        )}

        {!document && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏷️</div>
            <h2 className="text-xl font-semibold mb-2">Размещение товаров</h2>
            <p className="text-gray-600">Отсканируйте документ для начала</p>
          </div>
        )}
      </div>
      <ScanHint message={hint} type={hintType} />
    </div>
  );
}

