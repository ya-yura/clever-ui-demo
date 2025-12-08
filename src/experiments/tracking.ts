// === 📁 src/experiments/tracking.ts ===
// Tracking for A/B test results

import { metricsCollector } from '@/metrics';

export interface ExperimentEvent {
  experimentId: string;
  variant: string;
  eventType: 'impression' | 'interaction' | 'conversion' | 'error';
  metadata?: Record<string, any>;
}

/**
 * Track experiment impression (user saw the variant)
 */
export function trackExperimentImpression(
  experimentId: string,
  variant: string,
  metadata?: Record<string, any>
): void {
  metricsCollector.record('ux', {
    userId: getCurrentUserId(),
    operationType: 'experiment_impression',
    metadata: {
      experimentId,
      variant,
      ...metadata,
    },
  });
}

/**
 * Track experiment interaction (user interacted with variant)
 */
export function trackExperimentInteraction(
  experimentId: string,
  variant: string,
  action: string,
  metadata?: Record<string, any>
): void {
  metricsCollector.record('ux', {
    userId: getCurrentUserId(),
    operationType: 'experiment_interaction',
    metadata: {
      experimentId,
      variant,
      action,
      ...metadata,
    },
  });
}

/**
 * Track experiment conversion (desired outcome achieved)
 */
export function trackExperimentConversion(
  experimentId: string,
  variant: string,
  conversionType: string,
  value?: number,
  metadata?: Record<string, any>
): void {
  metricsCollector.record('ux', {
    userId: getCurrentUserId(),
    operationType: 'experiment_conversion',
    metadata: {
      experimentId,
      variant,
      conversionType,
      value,
      ...metadata,
    },
  });
}

/**
 * Track experiment error
 */
export function trackExperimentError(
  experimentId: string,
  variant: string,
  errorType: string,
  metadata?: Record<string, any>
): void {
  metricsCollector.recordError({
    userId: getCurrentUserId(),
    operationType: 'experiment',
    errorType: `${experimentId}_${errorType}`,
    metadata: {
      experimentId,
      variant,
      ...metadata,
    },
  });
}

/**
 * Get current user ID from context
 */
function getCurrentUserId(): string {
  // TODO: Get from auth context
  return localStorage.getItem('userId') || 'anonymous';
}


