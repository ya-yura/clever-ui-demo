// === 📁 src/types/auth.ts ===
// Authentication and configuration types

export interface AppConfig {
  serverUrl: string;
  isConfigured: boolean;
  lastUpdated: number;
}

export interface User {
  id: string;
  name: string;
  username: string;
  groupId?: string;
  groupName?: string;
  warehouseIds?: string[];
  role?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
  mode?: 'demo' | 'oauth';
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface SetupData {
  serverUrl: string;
}

