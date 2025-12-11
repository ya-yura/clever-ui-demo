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
 * ✨ С учетом UX-эффективности
 */
export interface PerformanceMetrics {
  // Время выполнения операций
  documentProcessingTime?: number;      // мс
  pickingTime?: number;                 // мс
  inventoryTime?: number;               // мс
  shippingTime?: number;                // мс
  
  // Количественные показатели
  skuProcessed?: number;
  correctionsCount?: number;
  wrongScansCount?: number;
  
  // Скорость
  itemsPerHour?: number;
  linesPerHour?: number;
  
  // === UX Impact ===
  errorRate?: number;                   // % ошибок
  completionRate?: number;              // % завершенных операций
}

/**
 * Error metrics (Ошибки)
 * ✨ Расширенные метрики с контекстом исправления
 */
export interface ErrorMetrics {
  // Процентные показатели
  deviationPercent?: number;
  pickingErrorPercent?: number;
  quantityConflictsCount?: number;
  cancellationsCount?: number;
  
  // Технические
  freezeTime?: number;              // время зависаний в мс
  networkErrors?: number;
  validationErrors?: number;
  
  // === Error-as-Guidance metrics ===
  errorType?: string;               // тип ошибки
  guidanceProvided?: boolean;       // была ли предоставлена помощь
  resolved?: boolean;               // была ли ошибка исправлена
  resolutionTime?: number;          // время на исправление (мс)
  userRetries?: number;             // попыток исправления
}

/**
 * UX metrics (Метрики пользовательского опыта)
 * ✨ Расширенные метрики по паттернам коммуникации Джеки Рида
 */
export interface UXMetrics {
  // === Signal → Action → Feedback ===
  timeToFirstScan?: number;           // время от открытия документа до первого скана
  scanSuccessRate?: number;           // % успешных сканов
  feedbackLatency?: number;           // задержка обратной связи (мс)
  
  // === Поиск и навигация ===
  documentSearchTime?: number;        // время поиска документа (мс)
  clicksToTarget?: number;            // кликов до целевого действия
  backNavigationsCount?: number;      // количество возвратов назад
  navigationMethod?: 'auto' | 'manual' | 'back';
  navigationTime?: number;            // время перехода (мс)
  
  // === Chunking ===
  chunkedViewUsed?: boolean;          // использовалась ли группировка
  groupsShown?: number;               // количество групп на экране
  itemsPerGroup?: number;             // среднее кол-во элементов в группе
  
  // === Progressive Disclosure ===
  elementsShown?: number;             // видимых элементов
  elementsHidden?: number;            // скрытых элементов
  revealInteractions?: number;        // раскрытий информации
  cognitiveLoadReduction?: number;    // снижение когнитивной нагрузки (0-1)
  
  // === Contextual Guidance ===
  hintShown?: boolean;                // была ли показана подсказка
  hintType?: 'micro_hint' | 'error_hint' | 'contextual';
  hintEffective?: boolean;            // помогла ли подсказка
  timeToAction?: number;              // время от подсказки до действия (мс)
  hintsShownCount?: number;           // общее количество подсказок
  hintsPerItem?: number;              // подсказок на элемент
  
  // === Error-as-Guidance ===
  errorType?: string;                 // тип ошибки
  guidanceProvided?: boolean;         // была ли предоставлена помощь
  errorRecoveryTime?: number;         // время исправления ошибки (мс)
  errorDialogsCount?: number;         // количество диалогов с ошибками
  
  // === Screen Interaction ===
  screenFocusTime?: number;           // время фокуса на экране (мс)
  interactionsPerMinute?: number;     // взаимодействий в минуту
  screenComplexity?: 'low' | 'medium' | 'high';
  swipeActionsCount?: number;         // количество свайпов
  
  // === Micro Rewards ===
  rewardsShown?: number;              // показано микро-наград
  progressUpdates?: number;           // обновлений прогресса
  
  // === Efficiency ===
  efficiencyScore?: number;           // общий показатель эффективности
  stepsReduction?: number;            // сокращение шагов относительно базового
  filtersUsed?: number;               // использовано фильтров
  
  // === Performance UI ===
  pageLoadTime?: number;              // время загрузки страницы (мс)
  componentRenderTime?: number;       // время рендера компонента (мс)
  helpViewsCount?: number;            // просмотров справки
  
  // === Custom Events ===
  eventType?: string;                 // тип кастомного события
  duration?: number;                  // длительность события (мс)
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


