/**
 * 🎨 STATUS COLOR SYSTEM
 * Основан на принципе "Цвет = Статус" из паттернов коммуникации Джеки Рида
 * 
 * Каждый цвет мгновенно передает состояние системы без необходимости чтения текста
 */

export const statusColors = {
  // ОЖИДАЕТ ДЕЙСТВИЯ - нейтральное состояние, требующее внимания
  pending: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-500',
    ring: 'ring-blue-300',
    hex: '#3B82F6',
    vibrant: 'bg-blue-500',
  },
  
  // УСПЕШНО - позитивное подтверждение
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: 'text-green-500',
    ring: 'ring-green-300',
    hex: '#10B981',
    vibrant: 'bg-green-500',
  },
  
  // ПРЕДУПРЕЖДЕНИЕ - требует осторожности, но не критично
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    icon: 'text-yellow-500',
    ring: 'ring-yellow-300',
    hex: '#F59E0B',
    vibrant: 'bg-yellow-500',
  },
  
  // ОШИБКА - критическая ситуация, требующая немедленного внимания
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: 'text-red-500',
    ring: 'ring-red-300',
    hex: '#EF4444',
    vibrant: 'bg-red-500',
  },
  
  // НЕЙТРАЛЬНЫЙ - информационный статус
  neutral: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-700',
    icon: 'text-gray-500',
    ring: 'ring-gray-300',
    hex: '#6B7280',
    vibrant: 'bg-gray-500',
  },
  
  // В РАБОТЕ - активный процесс
  inProgress: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    icon: 'text-purple-500',
    ring: 'ring-purple-300',
    hex: '#8B5CF6',
    vibrant: 'bg-purple-500',
  },
} as const;

export type StatusType = keyof typeof statusColors;

/**
 * Получить все классы для определенного статуса
 */
export const getStatusClasses = (status: StatusType) => statusColors[status];

/**
 * Получить только фоновый цвет
 */
export const getStatusBg = (status: StatusType) => statusColors[status].bg;

/**
 * Получить HEX-код цвета для программного использования
 */
export const getStatusHex = (status: StatusType) => statusColors[status].hex;

/**
 * Определить статус на основе прогресса выполнения
 */
export const getProgressStatus = (completed: number, total: number): StatusType => {
  if (completed === 0) return 'pending';
  if (completed === total) return 'success';
  return 'inProgress';
};

/**
 * Определить статус на основе количества ошибок
 */
export const getErrorStatus = (errorCount: number): StatusType => {
  if (errorCount === 0) return 'success';
  if (errorCount <= 2) return 'warning';
  return 'error';
};

