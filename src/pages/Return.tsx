// === 📁 src/pages/Return.tsx ===
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderBar } from '@/components/HeaderBar';
import { ScanHint } from '@/components/ScanHint';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { useScanner } from '@/hooks/useScanner';
import { useNotifications } from '@/hooks/useNotifications';
import { feedback } from '@/utils/feedback';
import { RETURN_REASONS, type ReturnDocument } from '@/types/return';
import demoData from '@/data/return.json';

export function Return() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<ReturnDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<ReturnDocument | null>(null);
  const [hint, setHint] = useState('Выберите документ для работы');
  const [hintType, setHintType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const { success, error } = useNotifications();

  // Загрузка демо-данных при монтировании
  useEffect(() => {
    if (demoData && demoData.length > 0) {
      setDocuments(demoData as ReturnDocument[]);
      setHint('Выберите документ для работы или сканируйте товары');
      setHintType('success');
    }
  }, []);

  const handleDocumentSelect = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      setSelectedDoc(doc);
      setHint(`Документ загружен. Сканируйте товары для обработки`);
      setHintType('success');
    }
  };

  const handleScan = useCallback((result: { barcode: string; type: string }) => {
    if (!selectedDoc) return;

    const item = selectedDoc.items.find(i => i.barcode === result.barcode);
    if (item && item.remaining > 0) {
      const updatedDoc = {
        ...selectedDoc,
        items: selectedDoc.items.map(i =>
          i.id === item.id
            ? { ...i, processed: i.processed + 1, remaining: i.remaining - 1, status: i.remaining === 1 ? 'completed' as const : 'partial' as const }
            : i
        )
      };
      setSelectedDoc(updatedDoc);
      setDocuments(docs => docs.map(d => d.id === updatedDoc.id ? updatedDoc : d));
      setHint(`Обработан товар "${item.productName}"`);
      setHintType('success');
      feedback.scan();
    } else {
      setHint('Товар не найден или уже обработан');
      setHintType('error');
      feedback.error('Товар не найден');
    }
  }, [selectedDoc]);

  useScanner(handleScan);

  const handleQuantityChange = (itemId: string, processed: number) => {
    if (!selectedDoc) return;
    const item = selectedDoc.items.find(i => i.id === itemId);
    if (!item) return;

    const updatedDoc = {
      ...selectedDoc,
      items: selectedDoc.items.map(i =>
        i.id === itemId
          ? { ...i, processed, remaining: i.quantity - processed, status: processed >= i.quantity ? 'completed' as const : processed > 0 ? 'partial' as const : 'pending' as const }
          : i
      )
    };
    setSelectedDoc(updatedDoc);
    setDocuments(docs => docs.map(d => d.id === updatedDoc.id ? updatedDoc : d));
  };

  const handleComplete = () => {
    if (!selectedDoc) return;
    const docType = selectedDoc.type === 'return' ? 'Возврат' : 'Списание';
    feedback.complete(`${docType} завершён`);
    success(`${docType} завершён`);
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const totalItems = selectedDoc?.items.length || 0;
  const completedItems = selectedDoc?.items.filter(i => i.processed >= i.quantity).length || 0;

  const getReasonLabel = (reason: string) => {
    const reasonObj = RETURN_REASONS.find(r => r.value === reason);
    return reasonObj?.label || reason;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <HeaderBar title="♻️ Возврат / Списание" />
      <div className="p-4 space-y-4">
        {!selectedDoc && documents.length > 0 && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="text-6xl mb-4">♻️</div>
              <h2 className="text-xl font-semibold mb-2">Возврат / Списание</h2>
              <p className="text-gray-600">Выберите документ для работы</p>
            </div>

            <div className="space-y-3">
              {documents.map(doc => (
                <Card key={doc.id} onClick={() => handleDocumentSelect(doc.id)} className="cursor-pointer hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        {doc.type === 'return' ? '♻️ Возврат' : '🧾 Списание'} №{doc.number}
                      </h3>
                      <StatusBadge status={doc.status} />
                    </div>
                    {doc.customerName && (
                      <p className="text-sm text-gray-600">Клиент: {doc.customerName}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      Товаров: {doc.items.length} | Обработано: {doc.items.filter(i => i.processed >= i.quantity).length}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(doc.date).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedDoc && (
          <>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">
                  {selectedDoc.type === 'return' ? '♻️ Возврат' : '🧾 Списание'} №{selectedDoc.number}
                </h2>
                <Button variant="secondary" size="sm" onClick={() => setSelectedDoc(null)}>
                  Назад
                </Button>
              </div>
              {selectedDoc.customerName && (
                <p className="text-sm text-gray-600">Клиент: {selectedDoc.customerName}</p>
              )}
              <div className="mt-3">
                <ProgressBar current={completedItems} total={totalItems} />
              </div>
            </div>

            <div className="space-y-3">
              {selectedDoc.items.map(item => (
                <Card key={item.id}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{item.productName}</h3>
                        <p className="text-xs text-gray-500">Артикул: {item.sku}</p>
                        <p className="text-xs text-orange-600">
                          Причина: {getReasonLabel(item.reason)}
                        </p>
                        {item.reasonText && (
                          <p className="text-xs text-gray-500 italic">"{item.reasonText}"</p>
                        )}
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-gray-600">Обработано</label>
                        <Input
                          type="number"
                          value={item.processed}
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
                        Осталось обработать: {item.remaining} {item.unit}
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
              ✅ Завершить {selectedDoc.type === 'return' ? 'возврат' : 'списание'}
            </Button>
          </>
        )}

        {!selectedDoc && documents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">♻️</div>
            <h2 className="text-xl font-semibold mb-2">Возврат / Списание</h2>
            <p className="text-gray-600">Нет документов для обработки</p>
          </div>
        )}
      </div>
      <ScanHint message={hint} type={hintType} />
    </div>
  );
}

