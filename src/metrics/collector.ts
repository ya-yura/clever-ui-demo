// === 📁 src/metrics/collector.ts ===
// Main metrics collection system

import { db } from '@/services/db';
import { MetricEvent, MetricCategory, MetricsConfig } from './metricsTypes';
import { MetricsTimer } from './timers';

const DEFAULT_CONFIG: MetricsConfig = {
  enabled: true,
  samplingRate: 1.0,
  maxLocalEvents: 10000,
  flushInterval: 60000, // 1 minute
  anonymize: false,
  excludePersonalData: false,
  reportEndpoint: '/api/metrics/report',
  batchSize: 100,
};

/**
 * Metrics Collector - скрытый модуль сбора метрик
 */
export class MetricsCollector {
  private static instance: MetricsCollector;
  private config: MetricsConfig;
  private sessionId: string;
  private flushTimer: NodeJS.Timeout | null = null;
  private queue: MetricEvent[] = [];

  private constructor() {
    this.config = this.loadConfig();
    this.sessionId = this.generateSessionId();
    
    if (this.config.enabled) {
      this.startFlushTimer();
    }
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  /**
   * Record a metric event
   */
  async record(
    category: MetricCategory,
    data: Partial<MetricEvent>
  ): Promise<void> {
    if (!this.config.enabled) return;
    
    // Sampling
    if (Math.random() > this.config.samplingRate) return;

    const event: MetricEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      category,
      sessionId: this.sessionId,
      userId: data.userId || 'anonymous',
      partnerId: data.partnerId,
      operationType: data.operationType || 'unknown',
      documentId: data.documentId,
      performance: data.performance,
      errors: data.errors,
      ux: data.ux,
      team: data.team,
      metadata: data.metadata,
    };

    // Add to queue
    this.queue.push(event);

    // Save to IndexedDB
    try {
      await this.saveToIndexedDB(event);
    } catch (error) {
      console.error('Failed to save metric to IndexedDB:', error);
    }

    // Auto-flush if queue is large
    if (this.queue.length >= this.config.batchSize) {
      await this.flush();
    }
  }

  /**
   * Start a timer for measuring durations
   */
  startTimer(name: string): MetricsTimer {
    return new MetricsTimer(name);
  }

  /**
   * Record performance metric
   */
  async recordPerformance(data: {
    userId: string;
    partnerId?: string;
    operationType: string;
    documentId?: string;
    duration: number;
    itemsCount: number;
    correctionsCount?: number;
    errorsCount?: number;
  }): Promise<void> {
    const itemsPerHour = data.duration > 0 
      ? (data.itemsCount / (data.duration / 3600000)) 
      : 0;

    await this.record('performance', {
      userId: data.userId,
      partnerId: data.partnerId,
      operationType: data.operationType,
      documentId: data.documentId,
      performance: {
        documentProcessingTime: data.duration,
        skuProcessed: data.itemsCount,
        correctionsCount: data.correctionsCount || 0,
        wrongScansCount: data.errorsCount || 0,
        itemsPerHour,
      },
    });
  }

  /**
   * Record error metric
   */
  async recordError(data: {
    userId: string;
    operationType: string;
    errorType: string;
    documentId?: string;
  }): Promise<void> {
    await this.record('errors', {
      userId: data.userId,
      operationType: data.operationType,
      documentId: data.documentId,
      errors: {
        validationErrors: 1,
      },
      metadata: {
        errorType: data.errorType,
      },
    });
  }

  /**
   * Record UX metric
   */
  async recordUX(data: {
    userId: string;
    action: string;
    duration?: number;
    clicksCount?: number;
  }): Promise<void> {
    await this.record('ux', {
      userId: data.userId,
      operationType: data.action,
      ux: {
        documentSearchTime: data.duration,
        clicksToTarget: data.clicksCount,
      },
    });
  }

  /**
   * ✨ Record UX event - расширенная метрика по паттернам Джеки Рида
   */
  async trackUXEvent(data: {
    userId: string;
    eventType: 'hint_shown' | 'scan_success' | 'scan_error' | 'auto_navigation' | 
               'screen_focus' | 'back_navigation' | 'error_shown' | 'swipe_action' |
               'progressive_disclosure' | 'micro_reward' | 'chunked_view';
    operationType?: string;
    documentId?: string;
    duration?: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.record('ux', {
      userId: data.userId,
      operationType: data.operationType || data.eventType,
      documentId: data.documentId,
      ux: {
        eventType: data.eventType,
        duration: data.duration,
      },
      metadata: data.metadata,
    });
  }

  /**
   * 📊 Track first-scan time (Signal → Action time)
   */
  async trackFirstScanTime(data: {
    userId: string;
    documentId: string;
    operationType: string;
    timeToFirstScan: number;
  }): Promise<void> {
    await this.record('ux', {
      userId: data.userId,
      documentId: data.documentId,
      operationType: data.operationType,
      ux: {
        timeToFirstScan: data.timeToFirstScan,
      },
      metadata: {
        metric: 'first_scan_latency',
      },
    });
  }

  /**
   * 🔍 Track document search efficiency
   */
  async trackDocumentSearch(data: {
    userId: string;
    searchDuration: number;
    clicksToDocument: number;
    searchQuery?: string;
    filtersUsed?: number;
  }): Promise<void> {
    await this.record('ux', {
      userId: data.userId,
      operationType: 'document_search',
      ux: {
        documentSearchTime: data.searchDuration,
        clicksToTarget: data.clicksToDocument,
        filtersUsed: data.filtersUsed,
      },
      metadata: {
        hasQuery: !!data.searchQuery,
      },
    });
  }

  /**
   * 🔄 Track navigation patterns
   */
  async trackNavigation(data: {
    userId: string;
    from: string;
    to: string;
    navigationMethod: 'auto' | 'manual' | 'back';
    duration: number;
  }): Promise<void> {
    await this.record('ux', {
      userId: data.userId,
      operationType: 'navigation',
      ux: {
        navigationMethod: data.navigationMethod,
        navigationTime: data.duration,
      },
      metadata: {
        from: data.from,
        to: data.to,
      },
    });
  }

  /**
   * 💬 Track hint effectiveness
   */
  async trackHintInteraction(data: {
    userId: string;
    hintType: 'micro_hint' | 'error_hint' | 'contextual';
    hintMessage: string;
    operationType: string;
    actionTaken: boolean;
    timeToAction?: number;
  }): Promise<void> {
    await this.record('ux', {
      userId: data.userId,
      operationType: data.operationType,
      ux: {
        hintShown: true,
        hintEffective: data.actionTaken,
        timeToAction: data.timeToAction,
      },
      metadata: {
        hintType: data.hintType,
        hintMessage: data.hintMessage,
      },
    });
  }

  /**
   * ⚠️ Track error patterns
   */
  async trackErrorPattern(data: {
    userId: string;
    errorType: string;
    operationType: string;
    documentId?: string;
    guidanceProvided: boolean;
    errorResolved: boolean;
    timeToResolve?: number;
  }): Promise<void> {
    await this.record('errors', {
      userId: data.userId,
      operationType: data.operationType,
      documentId: data.documentId,
      errors: {
        errorType: data.errorType,
        guidanceProvided: data.guidanceProvided,
        resolved: data.errorResolved,
      },
      ux: {
        errorRecoveryTime: data.timeToResolve,
      },
    });
  }

  /**
   * 📈 Track cognitive load reduction
   */
  async trackCognitiveLoad(data: {
    userId: string;
    operationType: string;
    screenComplexity: 'low' | 'medium' | 'high';
    elementsShown: number;
    elementsHidden: number;
    progressiveDisclosureUsed: boolean;
  }): Promise<void> {
    await this.record('ux', {
      userId: data.userId,
      operationType: data.operationType,
      ux: {
        screenComplexity: data.screenComplexity,
        cognitiveLoadReduction: data.elementsHidden / (data.elementsShown + data.elementsHidden),
      },
      metadata: {
        elementsShown: data.elementsShown,
        elementsHidden: data.elementsHidden,
        progressiveDisclosure: data.progressiveDisclosureUsed,
      },
    });
  }

  /**
   * ⏱️ Track screen focus time
   */
  async trackScreenFocus(data: {
    userId: string;
    screen: string;
    focusTime: number;
    interactionCount: number;
  }): Promise<void> {
    await this.record('ux', {
      userId: data.userId,
      operationType: 'screen_focus',
      ux: {
        screenFocusTime: data.focusTime,
        interactionsPerMinute: (data.interactionCount / data.focusTime) * 60000,
      },
      metadata: {
        screen: data.screen,
      },
    });
  }

  /**
   * 🎯 Track completion efficiency
   */
  async trackCompletionEfficiency(data: {
    userId: string;
    operationType: string;
    documentId: string;
    totalTime: number;
    totalItems: number;
    totalErrors: number;
    totalBackNavigations: number;
    totalHintsShown: number;
  }): Promise<void> {
    const errorRate = data.totalItems > 0 ? data.totalErrors / data.totalItems : 0;
    const hintsPerItem = data.totalItems > 0 ? data.totalHintsShown / data.totalItems : 0;

    await this.record('performance', {
      userId: data.userId,
      operationType: data.operationType,
      documentId: data.documentId,
      performance: {
        documentProcessingTime: data.totalTime,
        skuProcessed: data.totalItems,
        wrongScansCount: data.totalErrors,
        errorRate,
      },
      ux: {
        backNavigationCount: data.totalBackNavigations,
        hintsShownCount: data.totalHintsShown,
        hintsPerItem,
        efficiencyScore: calculateEfficiencyScore(data),
      },
    });
  }

  /**
   * Record team metric
   */
  async recordTeam(data: {
    userId: string;
    partnerId: string;
    operationType: string;
    userContribution: number;
    partnerContribution: number;
    userTime: number;
    partnerTime: number;
  }): Promise<void> {
    await this.record('team', {
      userId: data.userId,
      partnerId: data.partnerId,
      operationType: data.operationType,
      team: {
        operatorAContribution: data.userContribution,
        operatorBContribution: data.partnerContribution,
        operatorATime: data.userTime,
        operatorBTime: data.partnerTime,
      },
    });
  }

  /**
   * Flush metrics to server
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.config.batchSize);

    try {
      const response = await fetch(this.config.reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: batch,
          sessionId: this.sessionId,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to send metrics to server');
        // Put back to queue
        this.queue.unshift(...batch);
      }
    } catch (error) {
      console.error('Error sending metrics:', error);
      // Put back to queue
      this.queue.unshift(...batch);
    }
  }

  /**
   * Get stored metrics from IndexedDB
   */
  async getStoredMetrics(limit: number = 100): Promise<MetricEvent[]> {
    try {
      const metrics = await db.metrics
        .orderBy('timestamp')
        .reverse()
        .limit(limit)
        .toArray();
      
      return metrics as MetricEvent[];
    } catch (error) {
      console.error('Failed to load metrics from IndexedDB:', error);
      return [];
    }
  }

  /**
   * Clear old metrics
   */
  async clearOldMetrics(olderThan: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
    const threshold = Date.now() - olderThan;
    
    try {
      await db.metrics
        .where('timestamp')
        .below(threshold)
        .delete();
    } catch (error) {
      console.error('Failed to clear old metrics:', error);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MetricsConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfig();

    if (this.config.enabled && !this.flushTimer) {
      this.startFlushTimer();
    } else if (!this.config.enabled && this.flushTimer) {
      this.stopFlushTimer();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): MetricsConfig {
    return { ...this.config };
  }

  // Private methods

  private saveToIndexedDB(event: MetricEvent): Promise<void> {
    return db.metrics.add(event as any);
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private loadConfig(): MetricsConfig {
    try {
      const stored = localStorage.getItem('metricsConfig');
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load metrics config:', error);
    }
    return DEFAULT_CONFIG;
  }

  private saveConfig(): void {
    try {
      localStorage.setItem('metricsConfig', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save metrics config:', error);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 🎯 Calculate efficiency score based on UX metrics
 */
function calculateEfficiencyScore(data: {
  totalTime: number;
  totalItems: number;
  totalErrors: number;
  totalBackNavigations: number;
  totalHintsShown: number;
}): number {
  // Базовая эффективность: items per minute
  const baseEfficiency = data.totalItems / (data.totalTime / 60000);
  
  // Штрафы за ошибки и навигацию назад
  const errorPenalty = data.totalErrors * 0.1;
  const navigationPenalty = data.totalBackNavigations * 0.05;
  
  // Бонус за использование подсказок (они помогают)
  const hintBonus = Math.min(data.totalHintsShown * 0.02, 0.5);
  
  const score = Math.max(0, baseEfficiency - errorPenalty - navigationPenalty + hintBonus);
  
  return Math.round(score * 100) / 100;
}

// Export singleton instance
export const metricsCollector = MetricsCollector.getInstance();


