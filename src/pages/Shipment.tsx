// === 📁 src/pages/Shipment.tsx ===
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
import type { ShipmentDocument } from '@/types/shipment';
import demoData from '@/data/shipment.json';

export function Shipment() {
  const navigate = useNavigate();
  const [document, setDocument] = useState<ShipmentDocument | null>(null);
  const [hint, setHint] = useState('Сканируйте документ отгрузки');
  const [hintType, setHintType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const { success, error } = useNotifications();

  // Загрузка демо-данных при монтировании
  useEffect(() => {
    if (demoData && demoData.length > 0) {
      const firstDoc = demoData[0] as ShipmentDocument;
      setDocument(firstDoc);
      setHint('Документ загружен. Сканируйте товары для отгрузки');
      setHintType('success');
    }
  }, []);

  const handleScan = useCallback((result: { barcode: string; type: string }) => {
    if (!document) return;

    const item = document.items.find(i => i.barcode === result.barcode);
    if (item && item.remaining > 0) {
      const updatedDoc = {
        ...document,
        items: document.items.map(i =>
          i.id === item.id
            ? { ...i, shipped: i.shipped + 1, remaining: i.remaining - 1, status: i.remaining === 1 ? 'completed' as const : 'partial' as const }
            : i
        )
      };
      setDocument(updatedDoc);
      setHint(`Отгружен товар "${item.productName}"`);
      setHintType('success');
      feedback.scan();
    } else {
      setHint('Товар не найден или уже отгружен');
      setHintType('error');
      feedback.error('Товар не найден');
    }
  }, [document]);

  useScanner(handleScan);

  const handleQuantityChange = (itemId: string, shipped: number) => {
    if (!document) return;
    const item = document.items.find(i => i.id === itemId);
    if (!item) return;

    const updatedDoc = {
      ...document,
      items: document.items.map(i =>
        i.id === itemId
          ? { ...i, shipped, remaining: i.quantity - shipped, status: shipped >= i.quantity ? 'completed' as const : shipped > 0 ? 'partial' as const : 'pending' as const }
          : i
      )
    };
    setDocument(updatedDoc);
  };

  const handleComplete = () => {
    if (!document) return;
    feedback.complete('Отгрузка завершена');
    success('Отгрузка завершена');
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const totalItems = document?.items.length || 0;
  const completedItems = document?.items.filter(i => i.shipped >= i.quantity).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <HeaderBar title="🧾 Отгрузка" />
      <div className="p-4 space-y-4">
        {document && (
          <>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold mb-2">Отгрузка №{document.number}</h2>
              <p className="text-sm text-gray-600">Клиент: {document.customerName}</p>
              <p className="text-sm text-gray-600">Адрес: {document.shippingAddress}</p>
              <p className="text-sm text-gray-600">Перевозчик: {document.carrier}</p>
              {document.trackingNumber && (
                <p className="text-sm text-gray-600">Трек-номер: {document.trackingNumber}</p>
              )}
              <div className="mt-3">
                <ProgressBar current={completedItems} total={totalItems} />
              </div>
            </div>

            <div className="space-y-3">
              {document.items.map(item => (
                <Card key={item.id}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{item.productName}</h3>
                        <p className="text-xs text-gray-500">Артикул: {item.sku}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-gray-600">Отгружено</label>
                        <Input
                          type="number"
                          value={item.shipped}
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
                        Осталось отгрузить: {item.remaining} {item.unit}
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
              ✅ Завершить отгрузку
            </Button>
          </>
        )}

        {!document && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🧾</div>
            <h2 className="text-xl font-semibold mb-2">Отгрузка товаров</h2>
            <p className="text-gray-600">Отсканируйте документ для начала</p>
          </div>
        )}
      </div>
      <ScanHint message={hint} type={hintType} />
    </div>
  );
}

