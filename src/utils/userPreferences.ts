// === 📁 src/utils/userPreferences.ts ===
// User preferences and personalization system

export type UXMode = 'beginner' | 'professional';

export interface UserActivity {
  documentId: string;
  documentType: string;
  lastAccessedAt: number;
  accessCount: number;
}

export interface ProductFrequency {
  productId: string;
  productName: string;
  barcode: string;
  scanCount: number;
  lastScannedAt: number;
}

export interface ModuleUsage {
  module: string;
  useCount: number;
  lastUsedAt: number;
  avgSessionDuration: number;
}

export interface UserPreferences {
  uxMode: UXMode;
  showTooltips: boolean;
  enableAnimations: boolean;
  streamScanningDefault: boolean;
  autoPhotoEnabled: boolean;
  voiceGuidanceEnabled: boolean;
  compactMode: boolean;
  
  // Personalization data
  recentDocuments: UserActivity[];
  frequentProducts: ProductFrequency[];
  moduleUsage: ModuleUsage[];
  favoriteTemplates: string[];
  customShortcuts: Record<string, string>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  uxMode: 'beginner',
  showTooltips: true,
  enableAnimations: true,
  streamScanningDefault: false,
  autoPhotoEnabled: false,
  voiceGuidanceEnabled: false,
  compactMode: false,
  recentDocuments: [],
  frequentProducts: [],
  moduleUsage: [],
  favoriteTemplates: [],
  customShortcuts: {},
};

const STORAGE_KEY = 'cleverence_user_preferences';

/**
 * User Preferences Service
 */
export class UserPreferencesService {
  private static preferences: UserPreferences | null = null;

  /**
   * Load user preferences from storage
   */
  static load(): UserPreferences {
    if (this.preferences) return this.preferences;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      } else {
        this.preferences = { ...DEFAULT_PREFERENCES };
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      this.preferences = { ...DEFAULT_PREFERENCES };
    }

    return this.preferences ?? DEFAULT_PREFERENCES;
  }

  /**
   * Save preferences to storage
   */
  static save(preferences: Partial<UserPreferences>): void {
    const current = this.load();
    this.preferences = { ...current, ...preferences };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  /**
   * Get UX mode
   */
  static getUXMode(): UXMode {
    return this.load().uxMode;
  }

  /**
   * Set UX mode
   */
  static setUXMode(mode: UXMode): void {
    this.save({ uxMode: mode });
    
    // Apply mode-specific settings
    if (mode === 'professional') {
      this.save({
        showTooltips: false,
        compactMode: true,
        streamScanningDefault: true,
      });
    } else {
      this.save({
        showTooltips: true,
        compactMode: false,
        enableAnimations: true,
      });
    }
  }

  /**
   * Track document access
   */
  static trackDocumentAccess(documentId: string, documentType: string): void {
    const prefs = this.load();
    const existing = prefs.recentDocuments.find(d => d.documentId === documentId);

    if (existing) {
      existing.lastAccessedAt = Date.now();
      existing.accessCount++;
    } else {
      prefs.recentDocuments.unshift({
        documentId,
        documentType,
        lastAccessedAt: Date.now(),
        accessCount: 1,
      });
    }

    // Keep only last 50 documents
    prefs.recentDocuments = prefs.recentDocuments
      .sort((a, b) => b.lastAccessedAt - a.lastAccessedAt)
      .slice(0, 50);

    this.save({ recentDocuments: prefs.recentDocuments });
  }

  /**
   * Track product scan
   */
  static trackProductScan(productId: string, productName: string, barcode: string): void {
    const prefs = this.load();
    const existing = prefs.frequentProducts.find(p => p.productId === productId);

    if (existing) {
      existing.scanCount++;
      existing.lastScannedAt = Date.now();
    } else {
      prefs.frequentProducts.push({
        productId,
        productName,
        barcode,
        scanCount: 1,
        lastScannedAt: Date.now(),
      });
    }

    // Keep top 100 by frequency
    prefs.frequentProducts = prefs.frequentProducts
      .sort((a, b) => b.scanCount - a.scanCount)
      .slice(0, 100);

    this.save({ frequentProducts: prefs.frequentProducts });
  }

  /**
   * Track module usage
   */
  static trackModuleUsage(module: string, sessionDuration: number): void {
    const prefs = this.load();
    const existing = prefs.moduleUsage.find(m => m.module === module);

    if (existing) {
      existing.useCount++;
      existing.lastUsedAt = Date.now();
      // Moving average
      existing.avgSessionDuration = 
        (existing.avgSessionDuration * (existing.useCount - 1) + sessionDuration) / existing.useCount;
    } else {
      prefs.moduleUsage.push({
        module,
        useCount: 1,
        lastUsedAt: Date.now(),
        avgSessionDuration: sessionDuration,
      });
    }

    this.save({ moduleUsage: prefs.moduleUsage });
  }

  /**
   * Get recent documents
   */
  static getRecentDocuments(limit: number = 10): UserActivity[] {
    return this.load().recentDocuments.slice(0, limit);
  }

  /**
   * Get frequent products
   */
  static getFrequentProducts(limit: number = 10): ProductFrequency[] {
    return this.load().frequentProducts.slice(0, limit);
  }

  /**
   * Get most used modules
   */
  static getMostUsedModules(limit: number = 5): ModuleUsage[] {
    return this.load().moduleUsage
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, limit);
  }

  /**
   * Add favorite template
   */
  static addFavoriteTemplate(template: string): void {
    const prefs = this.load();
    if (!prefs.favoriteTemplates.includes(template)) {
      prefs.favoriteTemplates.unshift(template);
      prefs.favoriteTemplates = prefs.favoriteTemplates.slice(0, 20);
      this.save({ favoriteTemplates: prefs.favoriteTemplates });
    }
  }

  /**
   * Reset all preferences
   */
  static reset(): void {
    this.preferences = { ...DEFAULT_PREFERENCES };
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Convenience exports
export const getUserPreferences = () => UserPreferencesService.load();
export const setUXMode = (mode: UXMode) => UserPreferencesService.setUXMode(mode);
export const trackDocument = (id: string, type: string) => 
  UserPreferencesService.trackDocumentAccess(id, type);
export const trackProduct = (id: string, name: string, barcode: string) =>
  UserPreferencesService.trackProductScan(id, name, barcode);
export const trackModule = (module: string, duration: number) =>
  UserPreferencesService.trackModuleUsage(module, duration);























