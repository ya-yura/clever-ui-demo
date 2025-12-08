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

// Export singleton instance
export const metricsCollector = MetricsCollector.getInstance();


