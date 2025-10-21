// === 📁 src/hooks/useScanner.ts ===
import { useState, useEffect, useCallback } from 'react';
import { feedback } from '@/utils/feedback';

export type ScanType = 'product' | 'cell' | 'document' | 'package' | 'unknown';

export interface ScanResult {
  barcode: string;
  type: ScanType;
  timestamp: number;
}

export function useScanner(onScan: (result: ScanResult) => void) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);

  // Определение типа штрихкода
  const detectBarcodeType = useCallback((barcode: string): ScanType => {
    if (barcode.startsWith('DOC-')) return 'document';
    if (barcode.startsWith('CELL-')) return 'cell';
    if (barcode.startsWith('PKG-')) return 'package';
    if (barcode.length >= 8 && barcode.length <= 13) return 'product';
    return 'unknown';
  }, []);

  // Обработка скана
  const handleScan = useCallback((barcode: string) => {
    if (!barcode) return;

    const result: ScanResult = {
      barcode: barcode.trim(),
      type: detectBarcodeType(barcode),
      timestamp: Date.now()
    };

    setLastScan(result);
    feedback.scan();
    onScan(result);
  }, [detectBarcodeType, onScan]);

  // Обработка ввода с клавиатуры (эмуляция сканера)
  useEffect(() => {
    let buffer = '';
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Игнорируем если фокус на input/textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      clearTimeout(timeout);

      if (e.key === 'Enter') {
        if (buffer.length > 0) {
          handleScan(buffer);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
        timeout = setTimeout(() => {
          buffer = '';
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [handleScan]);

  // Ручной скан (для кнопок)
  const manualScan = useCallback((barcode: string) => {
    handleScan(barcode);
  }, [handleScan]);

  // Включение/выключение камеры для сканирования
  const toggleCamera = useCallback(() => {
    setIsScanning(prev => !prev);
  }, []);

  return {
    isScanning,
    lastScan,
    manualScan,
    toggleCamera
  };
}



