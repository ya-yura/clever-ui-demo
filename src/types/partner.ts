// === 📁 src/types/partner.ts ===
// Types for partner/team work module

/**
 * User/Employee information
 */
export interface Employee {
  id: string;
  name: string;
  badge?: string;          // Badge number
  role?: string;           // Warehouse role (picker, packer, etc.)
  department?: string;
  phone?: string;
  photo?: string;
  isActive: boolean;
  createdAt: number;
  lastActiveAt?: number;
}

/**
 * Work session with a partner
 */
export interface PartnerSession {
  id: string;
  userId: string;          // Current user ID
  partnerId: string;       // Partner's ID
  startedAt: number;
  endedAt?: number;
  status: SessionStatus;
  
  // Work statistics
  documentsCompleted: number;
  linesProcessed: number;
  itemsProcessed: number;
  
  // Session details
  workType?: WorkType;     // Type of work being done
  documentId?: string;     // Document they're working on
  notes?: string;
}

/**
 * Session status
 */
export type SessionStatus = 
  | 'active'      // Currently working
  | 'paused'      // On break
  | 'completed'   // Finished
  | 'cancelled';  // Cancelled

/**
 * Type of work
 */
export type WorkType = 
  | 'receiving'   // Receiving goods
  | 'placement'   // Placing goods
  | 'picking'     // Picking orders
  | 'shipment'    // Shipping orders
  | 'inventory'   // Inventory count
  | 'return'      // Returns processing
  | 'general';    // General warehouse work

/**
 * Partner selection criteria
 */
export interface PartnerFilter {
  searchQuery?: string;
  role?: string;
  department?: string;
  isActive?: boolean;
}

/**
 * Partner statistics
 */
export interface PartnerStats {
  partnerId: string;
  partnerName: string;
  sessionsCount: number;
  totalHours: number;
  documentsCompleted: number;
  itemsProcessed: number;
  lastSessionAt?: number;
  compatibility: number;  // 0-100 score based on work efficiency
}

/**
 * Current work mode
 */
export type WorkMode = 'solo' | 'partner';

/**
 * Partner state in the app
 */
export interface PartnerState {
  currentSession?: PartnerSession;
  workMode: WorkMode;
  selectedPartner?: Employee;
  availablePartners: Employee[];
  recentPartners: PartnerStats[];
}

/**
 * Work type labels for UI
 */
export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  receiving: 'Приёмка',
  placement: 'Размещение',
  picking: 'Подбор',
  shipment: 'Отгрузка',
  inventory: 'Инвентаризация',
  return: 'Возврат',
  general: 'Общие работы',
};

/**
 * Work type icons
 */
export const WORK_TYPE_ICONS: Record<WorkType, string> = {
  receiving: '📦',
  placement: '📍',
  picking: '🛒',
  shipment: '🚚',
  inventory: '📊',
  return: '↩️',
  general: '🔧',
};

/**
 * Session status labels
 */
export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  active: 'Активна',
  paused: 'На паузе',
  completed: 'Завершена',
  cancelled: 'Отменена',
};

/**
 * Session status colors
 */
export const SESSION_STATUS_COLORS: Record<SessionStatus, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

