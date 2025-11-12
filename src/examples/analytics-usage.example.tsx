/**
 * Примеры использования Analytics Tracker
 * 
 * Этот файл содержит примеры интеграции трекера
 * в различные части PWA-приложения.
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import analytics from '../analytics';
import { EVENTS, SCAN_METHODS, DOCUMENT_TYPES } from '../types/analytics.types';

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

/**
 * Пример 1: Инициализация в main.tsx или App.tsx
 */
export function initializeAnalytics() {
  const isProd = import.meta.env.PROD;
  
  analytics.init({
    endpoint: isProd 
      ? 'https://analytics.your-domain.com/track'
      : 'http://localhost:9001/track',
    batchSize: isProd ? 20 : 5,
    flushInterval: isProd ? 60000 : 10000,
    debug: !isProd,
    trackPerformance: true,
    trackErrors: true,
    appVersion: '1.0.0',
  });
  
  console.log('Analytics initialized');
}

// ==================== НАВИГАЦИЯ ====================

/**
 * Пример 2: Отслеживание навигации в React Router
 */
export function AnalyticsNavigationTracker() {
  const location = useLocation();
  
  useEffect(() => {
    // Отследить просмотр страницы при каждом изменении location
    analytics.trackPageView();
  }, [location.pathname]);
  
  return null; // Этот компонент только для tracking
}

/**
 * Пример 3: Ручное отслеживание навигации с контекстом
 */
export function useAnalyticsNavigation() {
  const location = useLocation();
  
  useEffect(() => {
    const screenName = getScreenName(location.pathname);
    
    analytics.track(EVENTS.SCREEN_VIEW, {
      screen: screenName,
      url: window.location.href,
      path: location.pathname,
      previous_screen: getPreviousScreen(),
    });
    
    savePreviousScreen(screenName);
  }, [location]);
}

function getScreenName(pathname: string): string {
  const routes: Record<string, string> = {
    '/': 'Home',
    '/receiving': 'Receiving List',
    '/placement': 'Placement List',
    '/picking': 'Picking List',
    '/documents': 'All Documents',
    '/settings': 'Settings',
  };
  
  // Попытка найти точное совпадение
  if (routes[pathname]) {
    return routes[pathname];
  }
  
  // Проверка динамических маршрутов
  if (pathname.startsWith('/receiving/')) return 'Receiving Document';
  if (pathname.startsWith('/placement/')) return 'Placement Document';
  if (pathname.startsWith('/picking/')) return 'Picking Document';
  
  return pathname;
}

function getPreviousScreen(): string | undefined {
  return sessionStorage.getItem('previous_screen') || undefined;
}

function savePreviousScreen(screen: string): void {
  sessionStorage.setItem('previous_screen', screen);
}

// ==================== СКАНИРОВАНИЕ ====================

/**
 * Пример 4: Отслеживание сканирования в хуке useScanner
 */
export function useScannerWithAnalytics() {
  const handleScan = (barcode: string, method: 'keyboard' | 'camera' | 'manual') => {
    const startTime = performance.now();
    
    // Отследить попытку
    analytics.trackScanAttempt(method);
    
    try {
      // Обработка штрихкода
      const product = findProductByBarcode(barcode);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Успех
      const duration = performance.now() - startTime;
      analytics.trackScanSuccess(barcode, method, duration);
      
      // Опционально: озвучить название товара
      if (product.name) {
        analytics.track(EVENTS.SCAN_SUCCESS, {
          barcode_length: barcode.length,
          method,
          duration_ms: duration,
          product_name: product.name,
          product_found: true,
        });
      }
      
      return product;
    } catch (error) {
      // Ошибка
      analytics.trackScanFail(
        error instanceof Error ? error.message : 'Unknown error',
        method
      );
      
      throw error;
    }
  };
  
  return { handleScan };
}

function findProductByBarcode(barcode: string): any {
  // Заглушка - ваша реальная логика поиска
  return null;
}

/**
 * Пример 5: Компонент сканера с аналитикой
 */
export function ScannerComponent() {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  
  const handleKeyboardScan = (code: string) => {
    analytics.trackScanAttempt(SCAN_METHODS.KEYBOARD);
    
    try {
      // Обработка
      processBarcode(code);
      analytics.trackScanSuccess(code, SCAN_METHODS.KEYBOARD);
    } catch (error) {
      analytics.trackScanFail('Invalid barcode', SCAN_METHODS.KEYBOARD);
    }
  };
  
  const handleCameraScan = () => {
    setIsScanning(true);
    analytics.trackScanAttempt(SCAN_METHODS.CAMERA);
    
    // Запуск камеры...
  };
  
  const handleManualInput = () => {
    analytics.trackManualInput('barcode');
    
    if (barcode) {
      analytics.trackScanAttempt(SCAN_METHODS.MANUAL);
      // Обработка...
    }
  };
  
  return (
    <div>
      <input 
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        placeholder="Scan or enter barcode"
      />
      <button onClick={handleCameraScan}>Camera</button>
      <button onClick={handleManualInput}>Manual</button>
    </div>
  );
}

function processBarcode(code: string): void {
  // Заглушка
}

// ==================== ДОКУМЕНТЫ ====================

/**
 * Пример 6: Отслеживание работы с документами
 */
export function ReceivingDocumentPage({ documentId }: { documentId: string }) {
  const [startTime] = useState(performance.now());
  const navigate = useNavigate();
  
  useEffect(() => {
    // Открытие документа
    analytics.track(EVENTS.DOCUMENT_OPENED, {
      document_type: DOCUMENT_TYPES.RECEIVING,
      document_id: documentId,
    });
    
    // Отследить время загрузки
    const loadTime = performance.now() - startTime;
    analytics.trackScreenLoadTime('Receiving Document', startTime);
    
    // Cleanup при закрытии
    return () => {
      const duration = (performance.now() - startTime) / 1000;
      analytics.track(EVENTS.DOCUMENT_OPENED, {
        document_type: DOCUMENT_TYPES.RECEIVING,
        document_id: documentId,
        duration_seconds: Math.round(duration),
      });
    };
  }, [documentId]);
  
  const handleSave = () => {
    analytics.track(EVENTS.DOCUMENT_SAVED, {
      document_type: DOCUMENT_TYPES.RECEIVING,
      document_id: documentId,
      lines_count: 15,
      lines_completed: 10,
    });
    
    // Сохранение...
  };
  
  const handleComplete = () => {
    const duration = (performance.now() - startTime) / 1000;
    
    analytics.track(EVENTS.DOCUMENT_COMPLETED, {
      document_type: DOCUMENT_TYPES.RECEIVING,
      document_id: documentId,
      lines_count: 15,
      lines_completed: 15,
      duration_seconds: Math.round(duration),
    });
    
    // Завершение...
    navigate('/receiving');
  };
  
  const handleCancel = () => {
    analytics.track(EVENTS.DOCUMENT_CANCELLED, {
      document_type: DOCUMENT_TYPES.RECEIVING,
      document_id: documentId,
      reason: 'user_cancelled',
    });
    
    navigate('/receiving');
  };
  
  return (
    <div>
      <h1>Receiving Document {documentId}</h1>
      <button onClick={handleSave}>Save</button>
      <button onClick={handleComplete}>Complete</button>
      <button onClick={handleCancel}>Cancel</button>
    </div>
  );
}

// ==================== ДЕЙСТВИЯ ПОЛЬЗОВАТЕЛЯ ====================

/**
 * Пример 7: Отслеживание кликов на кнопки
 */
export function ButtonWithAnalytics({ 
  action, 
  onClick, 
  children 
}: { 
  action: string; 
  onClick: () => void; 
  children: React.ReactNode;
}) {
  const handleClick = () => {
    analytics.track(EVENTS.BUTTON_CLICK, {
      button_action: action,
      timestamp: Date.now(),
    });
    
    onClick();
  };
  
  return (
    <button onClick={handleClick}>
      {children}
    </button>
  );
}

/**
 * Пример 8: Подтверждение и отмена действий
 */
export function ConfirmDialog({ 
  action, 
  onConfirm, 
  onCancel 
}: {
  action: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const handleConfirm = () => {
    analytics.trackConfirm(action, {
      confirmed_at: new Date().toISOString(),
    });
    
    onConfirm();
  };
  
  const handleCancel = () => {
    analytics.trackCancel(action, {
      reason: 'user_cancelled',
    });
    
    onCancel();
  };
  
  return (
    <div>
      <p>Are you sure?</p>
      <button onClick={handleConfirm}>Confirm</button>
      <button onClick={handleCancel}>Cancel</button>
    </div>
  );
}

// ==================== ОШИБКИ ====================

/**
 * Пример 9: Error Boundary с аналитикой
 */
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AnalyticsErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };
  
  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Отследить ошибку
    analytics.trackError(error, {
      component: errorInfo.componentStack,
      error_boundary: true,
    });
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    
    return this.props.children;
  }
}

/**
 * Пример 10: Обработка ошибок в async функциях
 */
export async function loadDocumentWithAnalytics(documentId: string) {
  const startTime = performance.now();
  
  try {
    const response = await fetch(`/api/documents/${documentId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Отследить время загрузки
    const duration = performance.now() - startTime;
    analytics.trackTiming('api', 'load_document', duration, documentId);
    
    return data;
  } catch (error) {
    // Отследить ошибку
    analytics.trackError(error as Error, {
      component: 'DocumentLoader',
      document_id: documentId,
      action: 'load',
    });
    
    throw error;
  }
}

// ==================== СИНХРОНИЗАЦИЯ ====================

/**
 * Пример 11: Отслеживание синхронизации
 */
export function useSyncWithAnalytics() {
  const [isSyncing, setIsSyncing] = useState(false);
  
  const sync = async (module: string) => {
    setIsSyncing(true);
    
    const startTime = performance.now();
    
    analytics.track(EVENTS.SYNC_STARTED, {
      module,
    });
    
    try {
      // Синхронизация...
      const result = await performSync(module);
      
      const duration = performance.now() - startTime;
      
      analytics.track(EVENTS.SYNC_COMPLETED, {
        module,
        items_count: result.itemsCount,
        duration_ms: Math.round(duration),
      });
      
      return result;
    } catch (error) {
      analytics.track(EVENTS.SYNC_FAILED, {
        module,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };
  
  return { isSyncing, sync };
}

async function performSync(module: string): Promise<any> {
  // Заглушка
  return { itemsCount: 0 };
}

// ==================== ФОРМЫ ====================

/**
 * Пример 12: Отслеживание отправки форм
 */
export function FormWithAnalytics() {
  const [formData, setFormData] = useState({ name: '', quantity: 0 });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startTime = performance.now();
    
    try {
      // Валидация
      if (!formData.name || formData.quantity <= 0) {
        throw new Error('Validation failed');
      }
      
      // Отправка
      submitForm(formData);
      
      const duration = performance.now() - startTime;
      
      analytics.track(EVENTS.FORM_SUBMIT, {
        form_name: 'product_form',
        duration_ms: Math.round(duration),
        success: true,
      });
    } catch (error) {
      analytics.track(EVENTS.FORM_VALIDATION_ERROR, {
        form_name: 'product_form',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

function submitForm(data: any): void {
  // Заглушка
}

// ==================== CUSTOM HOOK ====================

/**
 * Пример 13: Универсальный хук для отслеживания событий
 */
export function useAnalytics() {
  return {
    trackScreenView: (screenName?: string) => {
      analytics.trackPageView(screenName);
    },
    
    trackAction: (action: string, properties?: Record<string, any>) => {
      analytics.track(action, properties);
    },
    
    trackError: (error: Error | string, context?: Record<string, any>) => {
      analytics.trackError(error, context);
    },
    
    trackTiming: (category: string, variable: string, time: number) => {
      analytics.trackTiming(category, variable, time);
    },
    
    flush: () => {
      analytics.flush();
    },
  };
}

// ==================== USAGE IN APP ====================

/**
 * Пример 14: Полная интеграция в App
 */
export function App() {
  useEffect(() => {
    // Инициализация при старте
    initializeAnalytics();
    
    // Первый просмотр
    analytics.trackPageView('Home');
  }, []);
  
  return (
    <AnalyticsErrorBoundary>
      <AnalyticsNavigationTracker />
      {/* Остальное приложение */}
    </AnalyticsErrorBoundary>
  );
}



