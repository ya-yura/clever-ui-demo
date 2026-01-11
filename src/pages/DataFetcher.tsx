// === 📁 src/pages/DataFetcher.tsx ===
// Страница для загрузки данных с сервера

import React, { useState } from 'react';
import { Card } from '@/design/components/Card';
import { Button } from '@/design/components/Button';
import { Checkbox } from '@/design/components/Checkbox';
import { Alert } from '@/design/components/Alert';
import { ProgressBar } from '@/design/components/ProgressBar';
import { downloadAllData, saveDemoData, FetchDataOptions } from '@/utils/dataFetcher';

export const DataFetcher: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [options, setOptions] = useState<FetchDataOptions>({
    includeProducts: true,
    includeCells: true,
    includePartners: true,
    includeEmployees: true,
    includeWarehouses: true,
  });

  const handleFetch = async () => {
    setIsLoading(true);
    setProgress(0);
    setProgressMessage('');
    setResult(null);
    setError(null);

    try {
      const fetchResult = await downloadAllData({
        ...options,
        onProgress: (message, progressValue) => {
          setProgressMessage(message);
          setProgress(progressValue);
        },
      });

      if (fetchResult.success) {
        setResult(fetchResult);
        
        // Сохранить в localStorage для демо-режима
        if (fetchResult.data) {
          saveDemoData(fetchResult.data);
        }
      } else {
        setError(fetchResult.error || 'Неизвестная ошибка');
      }
    } catch (err: any) {
      setError(err.message || 'Неизвестная ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Загрузка данных с сервера</h1>

        <Card className="mb-6">
          <h2 className="text-lg font-bold mb-4">Настройки загрузки</h2>
          
          <div className="flex flex-col gap-3">
            <Checkbox
              checked={options.includeProducts ?? true}
              onChange={(e) => setOptions({ ...options, includeProducts: e.target.checked })}
              label="Загрузить товары"
            />
            
            <Checkbox
              checked={options.includeCells ?? true}
              onChange={(e) => setOptions({ ...options, includeCells: e.target.checked })}
              label="Загрузить ячейки"
            />
            
            <Checkbox
              checked={options.includePartners ?? true}
              onChange={(e) => setOptions({ ...options, includePartners: e.target.checked })}
              label="Загрузить контрагентов"
            />
            
            <Checkbox
              checked={options.includeEmployees ?? true}
              onChange={(e) => setOptions({ ...options, includeEmployees: e.target.checked })}
              label="Загрузить сотрудников"
            />
            
            <Checkbox
              checked={options.includeWarehouses ?? true}
              onChange={(e) => setOptions({ ...options, includeWarehouses: e.target.checked })}
              label="Загрузить склады"
            />
          </div>

          <Button
            onClick={handleFetch}
            disabled={isLoading}
            className="mt-6 w-full"
          >
            {isLoading ? 'Загрузка...' : 'Загрузить данные'}
          </Button>
        </Card>

        {isLoading && (
          <Card className="mb-6">
            <h3 className="font-bold mb-3">Прогресс загрузки</h3>
            <ProgressBar value={progress} max={100} />
            <p className="mt-2 text-sm text-content-secondary">
              {progressMessage}
            </p>
          </Card>
        )}

        {error && (
          <Alert variant="error" className="mb-6">
            <strong>Ошибка:</strong> {error}
          </Alert>
        )}

        {result && result.success && (
          <Card>
            <h3 className="font-bold mb-4">✅ Данные успешно загружены!</h3>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Статистика:</h4>
              <ul className="space-y-1 text-sm">
                <li>📋 Типов документов: {result.stats?.docTypes || 0}</li>
                <li>📄 Документов: {result.stats?.documents || 0}</li>
                <li>📦 Товаров: {result.stats?.products || 0}</li>
                <li>🏪 Ячеек: {result.stats?.cells || 0}</li>
                <li>👥 Контрагентов: {result.stats?.partners || 0}</li>
                <li>👨‍💼 Сотрудников: {result.stats?.employees || 0}</li>
                <li>🏭 Складов: {result.stats?.warehouses || 0}</li>
              </ul>
            </div>

            <Alert variant="success">
              Данные сохранены в виде JSON файлов и в localStorage для демо-режима.
              Скопируйте скачанные файлы в папку <code className="bg-surface-tertiary px-1 rounded">src/data/demo/</code>
            </Alert>
          </Card>
        )}

        <Card className="mt-6 bg-surface-tertiary">
          <h3 className="font-bold mb-3">ℹ️ Инструкция</h3>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Убедитесь, что сервер MobileSMARTS запущен и доступен</li>
            <li>Выберите нужные опции загрузки</li>
            <li>Нажмите "Загрузить данные"</li>
            <li>Дождитесь завершения загрузки</li>
            <li>JSON файлы будут автоматически скачаны</li>
            <li>Скопируйте скачанные файлы в папку <code className="bg-surface-secondary px-1 rounded">src/data/demo/</code></li>
            <li>Перезапустите приложение для применения новых данных</li>
          </ol>
        </Card>
      </div>
  );
};

export default DataFetcher;
