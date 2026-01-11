// === 📁 src/services/serverHealth.ts ===
// Server availability check service

import { api } from './api';
import { configService } from './configService';

interface ServerHealthStatus {
  isAvailable: boolean;
  isDemoMode: boolean;
  lastCheck: number;
  error?: string;
}

class ServerHealthService {
  private cache: ServerHealthStatus | null = null;
  private cacheTimeout = 30000; // 30 seconds
  private checkPromise: Promise<ServerHealthStatus> | null = null;

  /**
   * Check if server is available
   * Uses caching to avoid multiple simultaneous checks
   */
  async checkServerHealth(forceCheck = false): Promise<ServerHealthStatus> {
    // Check if we're in explicit demo mode
    const isExplicitDemo = localStorage.getItem('demo_mode') === 'true';
    if (isExplicitDemo) {
      return {
        isAvailable: false,
        isDemoMode: true,
        lastCheck: Date.now(),
      };
    }

    // Return cached result if still valid
    if (!forceCheck && this.cache && Date.now() - this.cache.lastCheck < this.cacheTimeout) {
      return this.cache;
    }

    // If check is already in progress, return the same promise
    if (this.checkPromise) {
      return this.checkPromise;
    }

    // Start new check
    this.checkPromise = this.performHealthCheck();
    
    try {
      const result = await this.checkPromise;
      this.cache = result;
      return result;
    } finally {
      this.checkPromise = null;
    }
  }

  /**
   * Perform actual health check
   */
  private async performHealthCheck(): Promise<ServerHealthStatus> {
    try {
      // Check if server URL is configured
      const serverUrl = configService.getServerUrl();
      if (!serverUrl) {
        console.log('🎭 [HEALTH] No server URL configured, using demo mode');
        return {
          isAvailable: false,
          isDemoMode: true,
          lastCheck: Date.now(),
        };
      }

      // Try to fetch metadata endpoint (lightweight check)
      console.log('🔍 [HEALTH] Checking server availability...');
      
      // Update API baseURL to ensure it's current
      api.updateBaseURL();
      
      // Try to fetch DocTypes (lightweight endpoint)
      const response = await api.get('/DocTypes', { $top: 1 });
      
      if (response.success && response.data) {
        console.log('✅ [HEALTH] Server is available');
        return {
          isAvailable: true,
          isDemoMode: false,
          lastCheck: Date.now(),
        };
      } else {
        console.warn('⚠️ [HEALTH] Server responded but with error:', response.error);
        return {
          isAvailable: false,
          isDemoMode: true,
          lastCheck: Date.now(),
          error: response.error || 'Server returned error',
        };
      }
    } catch (error: any) {
      console.warn('⚠️ [HEALTH] Server check failed:', error.message);
      
      // Check if it's a network error (server not reachable)
      const isNetworkError = 
        error.code === 'ECONNREFUSED' ||
        error.code === 'ERR_NETWORK' ||
        error.message?.includes('Network Error') ||
        error.message?.includes('Failed to fetch') ||
        error.response?.status === 0;

      return {
        isAvailable: false,
        isDemoMode: true,
        lastCheck: Date.now(),
        error: isNetworkError ? 'Server not reachable' : error.message,
      };
    }
  }

  /**
   * Check if we should use demo mode
   */
  async shouldUseDemoMode(): Promise<boolean> {
    const health = await this.checkServerHealth();
    return health.isDemoMode || !health.isAvailable;
  }

  /**
   * Clear cache (force next check)
   */
  clearCache(): void {
    this.cache = null;
    this.checkPromise = null;
  }

  /**
   * Get current status (synchronous, uses cache)
   */
  getCurrentStatus(): ServerHealthStatus | null {
    return this.cache;
  }
}

export const serverHealth = new ServerHealthService();

