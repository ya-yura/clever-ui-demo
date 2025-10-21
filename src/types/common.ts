// === 📁 src/types/common.ts ===
export type Status = 'pending' | 'in_progress' | 'completed' | 'error';

export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error';

export interface BaseDocument {
  id: string;
  number: string;
  date: string;
  status: Status;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BaseItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  barcode: string;
  quantity: number;
  unit: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
  token?: string;
}

export interface AppConfig {
  apiBaseUrl: string;
  syncIntervalSec: number;
  authMode: 'token' | 'basic';
  demoMode: boolean;
  printer: PrinterConfig;
  scanner: ScannerConfig;
  offline: OfflineConfig;
  sound: SoundConfig;
  vibration: VibrationConfig;
  voice: VoiceConfig;
}

export interface PrinterConfig {
  type: 'bluetooth' | 'network' | 'usb';
  defaultPrinter: string;
}

export interface ScannerConfig {
  type: 'auto' | 'bluetooth' | 'camera';
  bluetoothEnabled: boolean;
  cameraEnabled: boolean;
}

export interface OfflineConfig {
  autoSyncEnabled: boolean;
  maxRetries: number;
  retryDelaySec: number;
}

export interface SoundConfig {
  enabled: boolean;
  volume: number;
}

export interface VibrationConfig {
  enabled: boolean;
  duration: number;
}

export interface VoiceConfig {
  enabled: boolean;
  lang: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  timestamp: number;
}



