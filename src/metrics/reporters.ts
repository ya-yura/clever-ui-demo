// === 📁 src/metrics/reporters.ts ===
// Metrics reporting and aggregation

import { MetricEvent, MetricsReport, PerformanceMetrics, ErrorMetrics, UXMetrics, TeamMetrics } from './metricsTypes';
import { metricsCollector } from './collector';

/**
 * Generate aggregated metrics report
 */
export async function generateReport(
  userId: string,
  periodStart: number,
  periodEnd: number,
  partnerId?: string
): Promise<MetricsReport> {
  const events = await metricsCollector.getStoredMetrics(10000);
  
  // Filter events for user and period
  const filteredEvents = events.filter(e => 
    e.userId === userId &&
    e.timestamp >= periodStart &&
    e.timestamp <= periodEnd &&
    (!partnerId || e.partnerId === partnerId)
  );

  // Aggregate metrics
  const performance = aggregatePerformance(filteredEvents);
  const errors = aggregateErrors(filteredEvents);
  const ux = aggregateUX(filteredEvents);
  const team = partnerId ? aggregateTeam(filteredEvents) : undefined;

  // Calculate trends
  const midpoint = periodStart + (periodEnd - periodStart) / 2;
  const firstHalf = filteredEvents.filter(e => e.timestamp < midpoint);
  const secondHalf = filteredEvents.filter(e => e.timestamp >= midpoint);

  const trends = calculateTrends(firstHalf, secondHalf);

  return {
    period: {
      start: periodStart,
      end: periodEnd,
    },
    userId,
    partnerId,
    totalEvents: filteredEvents.length,
    performance,
    errors,
    ux,
    team,
    trends,
  };
}

/**
 * Aggregate performance metrics
 */
function aggregatePerformance(events: MetricEvent[]): PerformanceMetrics {
  const perfEvents = events.filter(e => e.performance);
  
  if (perfEvents.length === 0) {
    return {
      documentProcessingTime: 0,
      pickingTime: 0,
      inventoryTime: 0,
      shippingTime: 0,
      skuProcessed: 0,
      correctionsCount: 0,
      wrongScansCount: 0,
      itemsPerHour: 0,
      linesPerHour: 0,
    };
  }

  const totalTime = perfEvents.reduce((sum, e) => sum + (e.performance?.documentProcessingTime || 0), 0);
  const totalSKU = perfEvents.reduce((sum, e) => sum + (e.performance?.skuProcessed || 0), 0);
  const totalCorrections = perfEvents.reduce((sum, e) => sum + (e.performance?.correctionsCount || 0), 0);
  const totalWrongScans = perfEvents.reduce((sum, e) => sum + (e.performance?.wrongScansCount || 0), 0);

  return {
    documentProcessingTime: Math.round(totalTime / perfEvents.length),
    pickingTime: 0, // TODO: filter by operation type
    inventoryTime: 0,
    shippingTime: 0,
    skuProcessed: totalSKU,
    correctionsCount: totalCorrections,
    wrongScansCount: totalWrongScans,
    itemsPerHour: totalTime > 0 ? Math.round((totalSKU / (totalTime / 3600000))) : 0,
    linesPerHour: 0,
  };
}

/**
 * Aggregate error metrics
 */
function aggregateErrors(events: MetricEvent[]): ErrorMetrics {
  const errorEvents = events.filter(e => e.errors);
  
  if (errorEvents.length === 0) {
    return {
      deviationPercent: 0,
      pickingErrorPercent: 0,
      quantityConflictsCount: 0,
      cancellationsCount: 0,
      freezeTime: 0,
      networkErrors: 0,
      validationErrors: 0,
    };
  }

  const totalValidationErrors = errorEvents.reduce((sum, e) => sum + (e.errors?.validationErrors || 0), 0);
  const totalNetworkErrors = errorEvents.reduce((sum, e) => sum + (e.errors?.networkErrors || 0), 0);
  const totalQuantityConflicts = errorEvents.reduce((sum, e) => sum + (e.errors?.quantityConflictsCount || 0), 0);

  return {
    deviationPercent: 0,
    pickingErrorPercent: 0,
    quantityConflictsCount: totalQuantityConflicts,
    cancellationsCount: 0,
    freezeTime: 0,
    networkErrors: totalNetworkErrors,
    validationErrors: totalValidationErrors,
  };
}

/**
 * Aggregate UX metrics
 */
function aggregateUX(events: MetricEvent[]): UXMetrics {
  const uxEvents = events.filter(e => e.ux);
  
  if (uxEvents.length === 0) {
    return {
      documentSearchTime: 0,
      clicksToTarget: 0,
      backNavigationsCount: 0,
      errorDialogsCount: 0,
      helpViewsCount: 0,
      pageLoadTime: 0,
      componentRenderTime: 0,
    };
  }

  const avgSearchTime = uxEvents.reduce((sum, e) => sum + (e.ux?.documentSearchTime || 0), 0) / uxEvents.length;
  const avgClicks = uxEvents.reduce((sum, e) => sum + (e.ux?.clicksToTarget || 0), 0) / uxEvents.length;
  const totalBackNavs = uxEvents.reduce((sum, e) => sum + (e.ux?.backNavigationsCount || 0), 0);
  const totalErrorDialogs = uxEvents.reduce((sum, e) => sum + (e.ux?.errorDialogsCount || 0), 0);

  return {
    documentSearchTime: Math.round(avgSearchTime),
    clicksToTarget: Math.round(avgClicks),
    backNavigationsCount: totalBackNavs,
    errorDialogsCount: totalErrorDialogs,
    helpViewsCount: 0,
    pageLoadTime: 0,
    componentRenderTime: 0,
  };
}

/**
 * Aggregate team metrics
 */
function aggregateTeam(events: MetricEvent[]): TeamMetrics {
  const teamEvents = events.filter(e => e.team);
  
  if (teamEvents.length === 0) {
    return {
      operatorAContribution: 50,
      operatorBContribution: 50,
      operatorATime: 0,
      operatorBTime: 0,
      pairAverageSpeed: 0,
      synergyBonus: 0,
    };
  }

  const avgAContribution = teamEvents.reduce((sum, e) => sum + (e.team?.operatorAContribution || 0), 0) / teamEvents.length;
  const avgBContribution = teamEvents.reduce((sum, e) => sum + (e.team?.operatorBContribution || 0), 0) / teamEvents.length;
  const totalATime = teamEvents.reduce((sum, e) => sum + (e.team?.operatorATime || 0), 0);
  const totalBTime = teamEvents.reduce((sum, e) => sum + (e.team?.operatorBTime || 0), 0);

  return {
    operatorAContribution: Math.round(avgAContribution),
    operatorBContribution: Math.round(avgBContribution),
    operatorATime: totalATime,
    operatorBTime: totalBTime,
    pairAverageSpeed: 0,
    synergyBonus: 0,
  };
}

/**
 * Calculate trends by comparing two periods
 */
function calculateTrends(
  firstHalf: MetricEvent[],
  secondHalf: MetricEvent[]
): {
  performanceChange: number;
  errorRateChange: number;
  efficiencyChange: number;
} {
  const perf1 = aggregatePerformance(firstHalf);
  const perf2 = aggregatePerformance(secondHalf);
  
  const err1 = aggregateErrors(firstHalf);
  const err2 = aggregateErrors(secondHalf);

  const performanceChange = (perf1.itemsPerHour ?? 0) > 0
    ? (((perf2.itemsPerHour ?? 0) - (perf1.itemsPerHour ?? 0)) / (perf1.itemsPerHour ?? 1)) * 100
    : 0;

  const errorRate1 = (err1.validationErrors ?? 0) + (err1.networkErrors ?? 0);
  const errorRate2 = (err2.validationErrors ?? 0) + (err2.networkErrors ?? 0);
  const errorRateChange = errorRate1 > 0
    ? ((errorRate2 - errorRate1) / errorRate1) * 100
    : 0;

  return {
    performanceChange: Math.round(performanceChange * 10) / 10,
    errorRateChange: Math.round(errorRateChange * 10) / 10,
    efficiencyChange: Math.round(performanceChange * 10) / 10, // Simplified
  };
}

/**
 * Export metrics to JSON
 */
export async function exportMetrics(
  userId: string,
  format: 'json' | 'csv' = 'json'
): Promise<string> {
  const events = await metricsCollector.getStoredMetrics(10000);
  const userEvents = events.filter(e => e.userId === userId);

  if (format === 'json') {
    return JSON.stringify(userEvents, null, 2);
  }

  // CSV format
  const headers = ['timestamp', 'category', 'operationType', 'documentId', 'data'];
  const rows = userEvents.map(e => [
    new Date(e.timestamp).toISOString(),
    e.category,
    e.operationType,
    e.documentId || '',
    JSON.stringify({ performance: e.performance, errors: e.errors, ux: e.ux }),
  ]);

  return [
    headers.join(','),
    ...rows.map(r => r.join(',')),
  ].join('\n');
}


