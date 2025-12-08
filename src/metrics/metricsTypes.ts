// === 📁 src/metrics/metricsTypes.ts ===
// Types for metrics collection system

/**
 * Metric categories
 */
export type MetricCategory = 
  | 'performance'  // Рабочие показатели
  | 'errors'       // Ошибки
  | 'ux'           // UX метрики
  | 'team';        // Командные метрики

/**
 * Performance metrics (Рабочие показатели)
 */
export interface PerformanceMetrics {
  // Время выполнения операций
  documentProcessingTime: number;      // мс
  pickingTime: number;                 // мс
  inventoryTime: number;               // мс
  shippingTime: number;                // мс
  
  // Количественные показатели
  skuProcessed: number;
  correctionsCount: number;
  wrongScansCount: number;
  
  // Скорость
  itemsPerHour: number;
  linesPerHour: number;
}

/**
 * Error metrics (Ошибки)
 */
export interface ErrorMetrics {
  // Процентные показатели
  deviationPercent: number;
  pickingErrorPercent: number;
  quantityConflictsCount: number;
  cancellationsCount: number;
  
  // Технические
  freezeTime: number;  // время зависаний в мс
  networkErrors: number;
  validationErrors: number;
}

/**
 * UX metrics (Метрики пользовательского опыта)
 */
export interface UXMetrics {
  // Поиск и навигация
  documentSearchTime: number;  // мс
  clicksToTarget: number;
  backNavigationsCount: number;
  
  // Интерфейс
  errorDialogsCount: number;
  helpViewsCount: number;
  
  // Производительность интерфейса
  pageLoadTime: number;
  componentRenderTime: number;
}

/**
 * Team metrics (Командные метрики)
 */
export interface TeamMetrics {
  // Вклад операторов
  operatorAContribution: number;  // % от общего объёма
  operatorBContribution: number;
  
  // Распределение времени
  operatorATime: number;  // мс
  operatorBTime: number;
  
  // Скорость пары
  pairAverageSpeed: number;  // товаров в час
  
  // Синергия
  synergyBonus: number;  // % улучшения относительно одиночной работы
}

/**
 * Complete metric event
 */
export interface MetricEvent {
  id: string;
  timestamp: number;
  category: MetricCategory;
  
  // User context
  userId: string;
  partnerId?: string;
  sessionId: string;
  
  // Operation context
  operationType: string;
  documentId?: string;
  
  // Metrics data
  performance?: Partial<PerformanceMetrics>;
  errors?: Partial<ErrorMetrics>;
  ux?: Partial<UXMetrics>;
  team?: Partial<TeamMetrics>;
  
  // Additional metadata
  metadata?: Record<string, any>;
}

/**
 * Aggregated metrics for reporting
 */
export interface MetricsReport {
  period: {
    start: number;
    end: number;
  };
  
  userId: string;
  partnerId?: string;
  
  // Aggregated data
  totalEvents: number;
  performance: PerformanceMetrics;
  errors: ErrorMetrics;
  ux: UXMetrics;
  team?: TeamMetrics;
  
  // Trends
  trends: {
    performanceChange: number;  // % изменение
    errorRateChange: number;
    efficiencyChange: number;
  };
}

/**
 * Metrics storage configuration
 */
export interface MetricsConfig {
  // Collection
  enabled: boolean;
  samplingRate: number;  // 0-1, вероятность записи события
  
  // Storage
  maxLocalEvents: number;  // максимум событий в IndexedDB
  flushInterval: number;   // интервал отправки на сервер (мс)
  
  // Privacy
  anonymize: boolean;
  excludePersonalData: boolean;
  
  // Endpoints
  reportEndpoint: string;
  batchSize: number;
}


