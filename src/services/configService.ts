// === 📁 src/services/configService.ts ===
// Configuration management service

import { AppConfig } from '@/types/auth';

const CONFIG_KEY = 'app_config';
const DEFAULT_CONFIG: AppConfig = {
  serverUrl: '',
  isConfigured: false,
  lastUpdated: 0,
};

class ConfigService {
  /**
   * Get current configuration
   */
  getConfig(): AppConfig {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
    return DEFAULT_CONFIG;
  }

  /**
   * Save configuration
   */
  saveConfig(config: AppConfig): void {
    try {
      config.lastUpdated = Date.now();
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      console.log('✅ Config saved:', config.serverUrl);
    } catch (error) {
      console.error('Error saving config:', error);
      throw new Error('Failed to save configuration');
    }
  }

  /**
   * Update server URL
   */
  setServerUrl(url: string): void {
    const config = this.getConfig();
    config.serverUrl = url;
    config.isConfigured = true;
    this.saveConfig(config);
  }

  /**
   * Get server URL
   */
  getServerUrl(): string {
    return this.getConfig().serverUrl;
  }

  /**
   * Check if app is configured
   */
  isConfigured(): boolean {
    const config = this.getConfig();
    return config.isConfigured && !!config.serverUrl;
  }

  /**
   * Reset configuration (for testing or logout)
   */
  resetConfig(): void {
    localStorage.removeItem(CONFIG_KEY);
    console.log('⚠️ Config reset');
  }

  /**
   * Validate server URL format
   */
  validateServerUrl(url: string): { valid: boolean; error?: string } {
    if (!url || url.trim() === '') {
      return { valid: false, error: 'URL не может быть пустым' };
    }

    // Remove trailing slash
    url = url.trim().replace(/\/+$/, '');

    // Check if starts with http:// or https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return { valid: false, error: 'URL должен начинаться с http:// или https://' };
    }

    // Basic URL validation
    try {
      new URL(url);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Некорректный формат URL' };
    }
  }

  /**
   * Build full API URL
   */
  getApiUrl(endpoint: string = ''): string {
    const serverUrl = this.getServerUrl();
    if (!serverUrl) {
      throw new Error('Server URL not configured');
    }

    // Ensure endpoint starts with /
    if (endpoint && !endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }

    return `${serverUrl}${endpoint}`;
  }
}

export const configService = new ConfigService();

