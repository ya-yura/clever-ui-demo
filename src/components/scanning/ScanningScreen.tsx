// === 📁 src/components/scanning/ScanningScreen.tsx ===
// Main battle scanning screen with prominent hints and indicators

import React, { useState, useEffect } from 'react';
import { Card, ProgressBar, Badge } from '@/design/components';
import { 
  Camera, 
  Wifi, 
  WifiOff, 
  Keyboard, 
  AlertCircle,
  CheckCircle2,
  Barcode 
} from 'lucide-react';
import { DOCUMENT_TYPE_ICONS } from '@/types/document';

interface ScanningScreenProps {
  documentType: string;
  documentNumber: string;
  currentProduct?: {
    name: string;
    sku?: string;
    imageUrl?: string;
  };
  totalItems: number;
  completedItems: number;
  isOnline: boolean;
  hint: string;
  lastScanResult?: {
    success: boolean;
    message: string;
    timestamp: number;
  };
  onManualInput: () => void;
  onCameraInput: () => void;
  onScan?: (code: string) => void;
}

export const ScanningScreen: React.FC<ScanningScreenProps> = ({
  documentType,
  documentNumber,
  currentProduct,
  totalItems,
  completedItems,
  isOnline,
  hint,
  lastScanResult,
  onManualInput,
  onCameraInput,
  onScan,
}) => {
  const [showScanEffect, setShowScanEffect] = useState(false);
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Show scan effect when new result comes in
  useEffect(() => {
    if (lastScanResult) {
      setShowScanEffect(true);
      const timer = setTimeout(() => setShowScanEffect(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [lastScanResult?.timestamp]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-primary to-surface-secondary flex flex-col">
      {/* Header - Operation Type & Status */}
      <div className="bg-surface-secondary border-b border-surface-tertiary px-4 py-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Operation Icon & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-lg flex items-center justify-center text-2xl">
              {DOCUMENT_TYPE_ICONS[documentType as keyof typeof DOCUMENT_TYPE_ICONS] || '📦'}
            </div>
            <div>
              <div className="font-bold text-content-primary">{documentNumber}</div>
              <div className="text-xs text-content-tertiary">{documentType}</div>
            </div>
          </div>

          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            isOnline 
              ? 'bg-success/10 text-success' 
              : 'bg-warning/10 text-warning'
          }`}>
            {isOnline ? (
              <>
                <Wifi size={16} />
                <span className="text-xs font-medium">Онлайн</span>
              </>
            ) : (
              <>
                <WifiOff size={16} />
                <span className="text-xs font-medium">Оффлайн</span>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-content-tertiary mb-1">
            <span>Прогресс</span>
            <span className="font-bold text-content-primary">
              {completedItems} / {totalItems} ({progress}%)
            </span>
          </div>
          <ProgressBar
            value={progress}
            variant={progress === 100 ? 'success' : 'primary'}
            size="md"
          />
        </div>
      </div>

      {/* Main Scanning Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        {/* Large Hint Block */}
        <Card className={`w-full max-w-md p-8 text-center transition-all duration-300 ${
          showScanEffect 
            ? lastScanResult?.success 
              ? 'bg-success/10 border-success scale-105' 
              : 'bg-error/10 border-error scale-105'
            : 'bg-surface-secondary border-surface-tertiary'
        }`}>
          {/* Scan Animation */}
          <div className="mb-6 relative">
            <div className={`w-32 h-32 mx-auto bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              showScanEffect ? 'scale-110' : 'scale-100'
            }`}>
              <Barcode size={64} className="text-brand-primary" />
            </div>
            
            {/* Scanning lines animation */}
            {!showScanEffect && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-1 bg-brand-primary/50 animate-pulse" />
              </div>
            )}
          </div>

          {/* Hint Text - Большой и заметный */}
          <h2 className="text-2xl font-bold text-content-primary mb-2">
            {hint}
          </h2>
          
          {/* Current Product Info */}
          {currentProduct && (
            <div className="mt-4 p-4 bg-surface-tertiary rounded-lg">
              <div className="text-sm text-content-tertiary mb-1">Текущий товар:</div>
              <div className="font-semibold text-content-primary">{currentProduct.name}</div>
              {currentProduct.sku && (
                <div className="text-xs text-content-tertiary font-mono mt-1">
                  {currentProduct.sku}
                </div>
              )}
            </div>
          )}

          {/* Last Scan Result */}
          {lastScanResult && showScanEffect && (
            <div className={`mt-4 flex items-center justify-center gap-2 ${
              lastScanResult.success ? 'text-success' : 'text-error'
            }`}>
              {lastScanResult.success ? (
                <CheckCircle2 size={24} />
              ) : (
                <AlertCircle size={24} />
              )}
              <span className="font-semibold">{lastScanResult.message}</span>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-3">
          {/* Manual Input - Крупная кнопка */}
          <button
            onClick={onManualInput}
            className="w-full py-4 px-6 bg-surface-secondary hover:bg-surface-tertiary border-2 border-surface-tertiary hover:border-brand-primary rounded-xl transition-all duration-200 flex items-center justify-center gap-3 text-lg font-semibold text-content-primary active:scale-95"
          >
            <Keyboard size={24} />
            Ввести вручную
          </button>

          {/* Camera Input */}
          <button
            onClick={onCameraInput}
            className="w-full py-4 px-6 bg-surface-secondary hover:bg-surface-tertiary border-2 border-surface-tertiary hover:border-brand-secondary rounded-xl transition-all duration-200 flex items-center justify-center gap-3 text-lg font-semibold text-content-primary active:scale-95"
          >
            <Camera size={24} />
            Сканировать камерой
          </button>
        </div>

        {/* Help Text */}
        <div className="text-sm text-content-tertiary text-center max-w-md">
          💡 Совет: Для быстрого сканирования используйте подключенный сканер штрихкодов
        </div>
      </div>

      {/* Auto-save indicator */}
      <div className="px-4 py-2 bg-surface-secondary border-t border-surface-tertiary text-xs text-content-tertiary text-center">
        💾 Автосохранение каждые 30 секунд
      </div>
    </div>
  );
};


