/**
 * TypeScript Type Definitions for Analytics Events
 * 
 * Используйте эти типы для строгой типизации событий
 * и предотвращения опечаток в названиях событий.
 */

// ==================== EVENT NAMES ====================

/**
 * Все возможные типы событий в системе
 */
export type EventName =
  // Навигация
  | 'screen_view'
  | 'page_load'
  
  // Сканирование
  | 'scan.attempt'
  | 'scan.success'
  | 'scan.fail'
  
  // Ввод данных
  | 'manual_input'
  | 'form.submit'
  | 'form.validation_error'
  
  // Действия пользователя
  | 'button.click'
  | 'confirm'
  | 'cancel'
  
  // Кастомный интерфейс
  | 'custom_interface.loaded'
  | 'custom_interface.button_click'
  | 'custom_interface.qr_scan'
  
  // Документы
  | 'document.created'
  | 'document.opened'
  | 'document.saved'
  | 'document.completed'
  | 'document.cancelled'
  
  // Ошибки и производительность
  | 'error'
  | 'timing'
  | 'screen.load_time'
  | 'page.performance'
  
  // Синхронизация
  | 'sync.started'
  | 'sync.completed'
  | 'sync.failed'
  
  // Другие
  | string; // Разрешаем кастомные события

// ==================== EVENT PROPERTIES ====================

/**
 * Свойства для события screen_view
 */
export interface ScreenViewProperties {
  screen: string;
  url: string;
  path: string;
  previous_screen?: string;
}

/**
 * Свойства для событий сканирования
 */
export interface ScanAttemptProperties {
  method: 'keyboard' | 'camera' | 'manual';
}

export interface ScanSuccessProperties extends ScanAttemptProperties {
  barcode_length: number;
  duration_ms?: number;
  product_found?: boolean;
}

export interface ScanFailProperties extends ScanAttemptProperties {
  error: string;
  error_code?: string;
}

/**
 * Свойства для ручного ввода
 */
export interface ManualInputProperties {
  input_type: 'barcode' | 'quantity' | 'cell' | 'text' | string;
  field_name?: string;
}

/**
 * Свойства для подтверждения/отмены
 */
export interface ConfirmProperties {
  action: string;
  [key: string]: any;
}

export interface CancelProperties {
  action: string;
  reason?: string;
  [key: string]: any;
}

/**
 * Свойства для событий документов
 */
export interface DocumentEventProperties {
  document_type: 'receiving' | 'placement' | 'picking' | 'shipment' | 'return' | 'inventory';
  document_id: string;
  document_number?: string;
  lines_count?: number;
  lines_completed?: number;
  duration_seconds?: number;
}

/**
 * Свойства для ошибок
 */
export interface ErrorProperties {
  message: string;
  stack?: string;
  name?: string;
  component?: string;
  action?: string;
  [key: string]: any;
}

/**
 * Свойства для измерения времени
 */
export interface TimingProperties {
  category: string;
  variable: string;
  time_ms: number;
  label?: string;
}

/**
 * Свойства для времени загрузки экрана
 */
export interface ScreenLoadTimeProperties {
  screen: string;
  load_time_ms: number;
}

/**
 * Свойства для производительности страницы
 */
export interface PagePerformanceProperties {
  dns_time: number;
  connect_time: number;
  response_time: number;
  dom_load_time: number;
  total_load_time: number;
}

/**
 * Свойства для синхронизации
 */
export interface SyncEventProperties {
  module?: string;
  items_count?: number;
  duration_ms?: number;
  error?: string;
}

/**
 * Свойства для загрузки кастомного интерфейса
 */
export interface CustomInterfaceLoadedProperties {
  schema_id: string;
  schema_version: string;
  buttons_count: number;
  load_source: 'qr' | 'localStorage' | 'file';
}

/**
 * Свойства для клика по кастомной кнопке
 */
export interface CustomButtonClickProperties {
  button_label: string;
  button_action: string;
  button_params?: any;
  button_position?: { row: number; col: number };
  button_color?: string;
}

/**
 * Свойства для сканирования QR-кода кастомного интерфейса
 */
export interface CustomInterfaceQRScanProperties {
  success: boolean;
  error?: string;
}

// ==================== TYPED TRACKING FUNCTIONS ====================

/**
 * Типизированные функции для отслеживания событий
 * (для использования с трекером)
 */
export interface TypedAnalyticsTracker {
  /**
   * Отследить просмотр экрана
   */
  trackScreenView(properties: ScreenViewProperties): void;
  
  /**
   * Отследить попытку сканирования
   */
  trackScanAttempt(properties: ScanAttemptProperties): void;
  
  /**
   * Отследить успешное сканирование
   */
  trackScanSuccess(properties: ScanSuccessProperties): void;
  
  /**
   * Отследить неудачное сканирование
   */
  trackScanFail(properties: ScanFailProperties): void;
  
  /**
   * Отследить ручной ввод
   */
  trackManualInput(properties: ManualInputProperties): void;
  
  /**
   * Отследить подтверждение
   */
  trackConfirm(properties: ConfirmProperties): void;
  
  /**
   * Отследить отмену
   */
  trackCancel(properties: CancelProperties): void;
  
  /**
   * Отследить событие документа
   */
  trackDocumentEvent(event: 'created' | 'opened' | 'saved' | 'completed' | 'cancelled', properties: DocumentEventProperties): void;
  
  /**
   * Отследить ошибку
   */
  trackError(properties: ErrorProperties): void;
  
  /**
   * Отследить измерение времени
   */
  trackTiming(properties: TimingProperties): void;
  
  /**
   * Отследить время загрузки экрана
   */
  trackScreenLoadTime(properties: ScreenLoadTimeProperties): void;
  
  /**
   * Отследить производительность страницы
   */
  trackPagePerformance(properties: PagePerformanceProperties): void;
  
  /**
   * Отследить событие синхронизации
   */
  trackSyncEvent(event: 'started' | 'completed' | 'failed', properties: SyncEventProperties): void;
  
  /**
   * Отследить кастомное событие с типизированными свойствами
   */
  track<T extends Record<string, any>>(event: EventName, properties?: T): void;
}

// ==================== HELPER TYPES ====================

/**
 * Карта событий и их свойств
 */
export type EventPropertiesMap = {
  'screen_view': ScreenViewProperties;
  'scan.attempt': ScanAttemptProperties;
  'scan.success': ScanSuccessProperties;
  'scan.fail': ScanFailProperties;
  'manual_input': ManualInputProperties;
  'confirm': ConfirmProperties;
  'cancel': CancelProperties;
  'document.created': DocumentEventProperties;
  'document.opened': DocumentEventProperties;
  'document.saved': DocumentEventProperties;
  'document.completed': DocumentEventProperties;
  'document.cancelled': DocumentEventProperties;
  'error': ErrorProperties;
  'timing': TimingProperties;
  'screen.load_time': ScreenLoadTimeProperties;
  'page.performance': PagePerformanceProperties;
  'sync.started': SyncEventProperties;
  'sync.completed': SyncEventProperties;
  'sync.failed': SyncEventProperties;
};

/**
 * Получить тип свойств для конкретного события
 */
export type PropertiesForEvent<E extends EventName> = E extends keyof EventPropertiesMap
  ? EventPropertiesMap[E]
  : Record<string, any>;

// ==================== CONSTANTS ====================

/**
 * Константы для типов документов
 */
export const DOCUMENT_TYPES = {
  RECEIVING: 'receiving',
  PLACEMENT: 'placement',
  PICKING: 'picking',
  SHIPMENT: 'shipment',
  RETURN: 'return',
  INVENTORY: 'inventory',
} as const;

export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES];

/**
 * Константы для методов сканирования
 */
export const SCAN_METHODS = {
  KEYBOARD: 'keyboard',
  CAMERA: 'camera',
  MANUAL: 'manual',
} as const;

export type ScanMethod = typeof SCAN_METHODS[keyof typeof SCAN_METHODS];

/**
 * Константы для событий
 */
export const EVENTS = {
  // Навигация
  SCREEN_VIEW: 'screen_view',
  PAGE_LOAD: 'page_load',
  
  // Сканирование
  SCAN_ATTEMPT: 'scan.attempt',
  SCAN_SUCCESS: 'scan.success',
  SCAN_FAIL: 'scan.fail',
  
  // Ввод
  MANUAL_INPUT: 'manual_input',
  FORM_SUBMIT: 'form.submit',
  FORM_VALIDATION_ERROR: 'form.validation_error',
  
  // Действия
  BUTTON_CLICK: 'button.click',
  CONFIRM: 'confirm',
  CANCEL: 'cancel',
  
  // Документы
  DOCUMENT_CREATED: 'document.created',
  DOCUMENT_OPENED: 'document.opened',
  DOCUMENT_SAVED: 'document.saved',
  DOCUMENT_COMPLETED: 'document.completed',
  DOCUMENT_CANCELLED: 'document.cancelled',
  
  // Ошибки и производительность
  ERROR: 'error',
  TIMING: 'timing',
  SCREEN_LOAD_TIME: 'screen.load_time',
  PAGE_PERFORMANCE: 'page.performance',
  
  // Синхронизация
  SYNC_STARTED: 'sync.started',
  SYNC_COMPLETED: 'sync.completed',
  SYNC_FAILED: 'sync.failed',
} as const;

export type EventConstant = typeof EVENTS[keyof typeof EVENTS];


