// === 📁 src/config/server.ts ===
// Dynamic server configuration (can be changed without recompiling)

export interface ServerConfig {
  // API Configuration
  API_URL: string;
  TIMEOUT: number;
  RETRY_POLICY: {
    maxRetries: number;
    retryDelay: number;
    retryableStatuses: number[];
  };
  
  // Offline Queue
  OFFLINE_QUEUE: {
    enabled: boolean;
    maxQueueSize: number;
    syncInterval: number;
  };
  
  // Metrics
  ENABLE_METRICS: boolean;
  METRICS_ENDPOINT: string;
  METRICS_BATCH_SIZE: number;
  METRICS_FLUSH_INTERVAL: number;
  
  // Features
  FEATURES: {
    enableOfflineMode: boolean;
    enableMetrics: boolean;
    enableExperiments: boolean;
    enableVoiceAssistant: boolean;
    enableTeamMode: boolean;
    enableOnboarding: boolean;
  };
  
  // Performance
  PERFORMANCE: {
    enableCodeSplitting: boolean;
    enableLazyLoading: boolean;
    imageOptimization: boolean;
    cacheStrategy: 'aggressive' | 'balanced' | 'minimal';
  };
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ServerConfig = {
  // API
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_POLICY: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    retryableStatuses: [408, 429, 500, 502, 503, 504],
  },
  
  // Offline Queue
  OFFLINE_QUEUE: {
    enabled: true,
    maxQueueSize: 1000,
    syncInterval: 60000, // 1 minute
  },
  
  // Metrics
  ENABLE_METRICS: true,
  METRICS_ENDPOINT: '/api/metrics/report',
  METRICS_BATCH_SIZE: 100,
  METRICS_FLUSH_INTERVAL: 60000, // 1 minute
  
  // Features
  FEATURES: {
    enableOfflineMode: true,
    enableMetrics: true,
    enableExperiments: true,
    enableVoiceAssistant: true,
    enableTeamMode: true,
    enableOnboarding: true,
  },
  
  // Performance
  PERFORMANCE: {
    enableCodeSplitting: true,
    enableLazyLoading: true,
    imageOptimization: true,
    cacheStrategy: 'balanced',
  },
};

/**
 * Server Configuration Manager
 */
class ServerConfigManager {
  private static instance: ServerConfigManager;
  private config: ServerConfig;
  private listeners: Set<(config: ServerConfig) => void> = new Set();

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): ServerConfigManager {
    if (!ServerConfigManager.instance) {
      ServerConfigManager.instance = new ServerConfigManager();
    }
    return ServerConfigManager.instance;
  }

  /**
   * Get current configuration
   */
  getConfig(): ServerConfig {
    return { ...this.config };
  }

  /**
   * Get specific config value
   */
  get<K extends keyof ServerConfig>(key: K): ServerConfig[K] {
    return this.config[key];
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ServerConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
    };
    
    this.saveConfig();
    this.notifyListeners();
  }

  /**
   * Reset to default configuration
   */
  resetConfig(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.saveConfig();
    this.notifyListeners();
  }

  /**
   * Load configuration from remote
   */
  async loadRemoteConfig(url?: string): Promise<void> {
    try {
      const configUrl = url || `${this.config.API_URL}/config`;
      const response = await fetch(configUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch remote config');
      }
      
      const remoteConfig = await response.json();
      this.updateConfig(remoteConfig);
      
      console.log('✓ Remote configuration loaded');
    } catch (error) {
      console.error('Failed to load remote config:', error);
      // Continue with current config
    }
  }

  /**
   * Subscribe to config changes
   */
  subscribe(listener: (config: ServerConfig) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: keyof ServerConfig['FEATURES']): boolean {
    return this.config.FEATURES[feature] === true;
  }

  /**
   * Get API URL with path
   */
  getApiUrl(path: string): string {
    const baseUrl = this.config.API_URL.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    return `${baseUrl}/${cleanPath}`;
  }

  // Private methods

  private loadConfig(): ServerConfig {
    try {
      // Try to load from localStorage first
      const stored = localStorage.getItem('serverConfig');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_CONFIG, ...parsed };
      }
      
      // Try to load from public/config.json
      const publicConfig = this.loadPublicConfig();
      if (publicConfig) {
        return { ...DEFAULT_CONFIG, ...publicConfig };
      }
    } catch (error) {
      console.error('Failed to load server config:', error);
    }
    
    return { ...DEFAULT_CONFIG };
  }

  private loadPublicConfig(): Partial<ServerConfig> | null {
    try {
      // This would be loaded via fetch in production
      // For now, return null
      return null;
    } catch {
      return null;
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem('serverConfig', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save server config:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.config);
      } catch (error) {
        console.error('Error in config listener:', error);
      }
    });
  }
}

// Export singleton instance
export const serverConfig = ServerConfigManager.getInstance();

// Export convenience functions
export function getServerConfig(): ServerConfig {
  return serverConfig.getConfig();
}

export function isFeatureEnabled(feature: keyof ServerConfig['FEATURES']): boolean {
  return serverConfig.isFeatureEnabled(feature);
}

export function getApiUrl(path: string): string {
  return serverConfig.getApiUrl(path);
}


