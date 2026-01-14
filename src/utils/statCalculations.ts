import { operationRecords, OperationRecord, ShiftName, npsSamples } from '@/data/mockStats';
import { DocumentType } from '@/types/document';

export interface DashboardFilters {
  docType: DocumentType | 'all';
  shift: ShiftName | 'all';
  days: number;
}

export interface TimeStats {
  median: number;
  mean: number;
  p90: number;
  perType: Record<string, number>;
  perItem: number;
  perScan: number;
}

export interface QualityStats {
  errorRate: number;
  discrepancyRate: number;
  reworkRate: number;
  falsePositiveRate: number;
}

export interface ThroughputStats {
  docsPerHour: number;
  itemsPerHour: number;
  bestOperators: Array<{ operator: string; itemsPerHour: number }>;
}

export interface AdoptionStats {
  wizard: number;
  autoComplete: number;
  voice: number;
}

export interface SyncStats {
  successRate: number;
  avgDelay: number;
  offlineShare: number;
}

export interface SatisfactionStats {
  csatAvg: number;
  nps: number;
}

const minutesBetween = (start: string, end: string) =>
  (new Date(end).getTime() - new Date(start).getTime()) / 60000;

const percentile = (values: number[], p: number) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[idx];
};

const average = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);

export const filterRecords = (filters: DashboardFilters): OperationRecord[] => {
  const cutoff = Date.now() - filters.days * 24 * 60 * 60 * 1000;
  return operationRecords.filter((record) => {
    const byType = filters.docType === 'all' || record.docType === filters.docType;
    const byShift = filters.shift === 'all' || record.shift === filters.shift;
    const byDate = new Date(record.endTime).getTime() >= cutoff;
    return byType && byShift && byDate;
  });
};

export const calculateTimeStats = (records: OperationRecord[]): TimeStats => {
  const durations = records.map((r) => minutesBetween(r.startTime, r.endTime));
  const perType = records.reduce<Record<string, { total: number; count: number }>>((acc, record) => {
    const duration = minutesBetween(record.startTime, record.endTime);
    if (!acc[record.docType]) {
      acc[record.docType] = { total: 0, count: 0 };
    }
    acc[record.docType].total += duration;
    acc[record.docType].count += 1;
    return acc;
  }, {});

  const perTypeAverages = Object.fromEntries(
    Object.entries(perType).map(([docType, { total, count }]) => [docType, count ? total / count : 0]),
  );

  const totalItems = records.reduce((sum, r) => sum + r.itemsProcessed, 0);
  const totalScans = records.reduce((sum, r) => sum + r.scans, 0);
  const totalMinutes = durations.reduce((sum, d) => sum + d, 0);

  return {
    median: percentile(durations, 50),
    mean: average(durations),
    p90: percentile(durations, 90),
    perType: perTypeAverages,
    perItem: totalItems ? totalMinutes / totalItems : 0,
    perScan: totalScans > 1 ? (totalMinutes * 60) / totalScans : 0,
  };
};

export const calculateQualityStats = (records: OperationRecord[]): QualityStats => {
  const totals = records.reduce(
    (acc, record) => {
      acc.items += record.itemsProcessed;
      acc.discrepancies += record.discrepancies;
      acc.errors += record.errors;
      acc.corrections += record.manualCorrections;
      acc.falsePositives += record.falsePositives;
      return acc;
    },
    { items: 0, discrepancies: 0, errors: 0, corrections: 0, falsePositives: 0 },
  );

  const rate = (num: number, den: number) => (den ? (num / den) * 100 : 0);

  return {
    errorRate: rate(totals.errors, totals.items),
    discrepancyRate: rate(totals.discrepancies, totals.items),
    reworkRate: rate(totals.corrections, totals.items),
    falsePositiveRate: rate(totals.falsePositives, totals.items),
  };
};

export const calculateThroughputStats = (records: OperationRecord[]): ThroughputStats => {
  if (!records.length) {
    return { docsPerHour: 0, itemsPerHour: 0, bestOperators: [] };
  }

  const totalDurationHours =
    records.reduce((sum, record) => sum + minutesBetween(record.startTime, record.endTime), 0) / 60;

  const docsPerHour = totalDurationHours ? records.length / totalDurationHours : 0;
  const itemsPerHour =
    totalDurationHours && records.length
      ? records.reduce((sum, r) => sum + r.itemsProcessed, 0) / totalDurationHours
      : 0;

  const operatorMap = records.reduce<Record<string, { name: string; duration: number; items: number }>>(
    (acc, record) => {
      if (!acc[record.operatorId]) {
        acc[record.operatorId] = { name: record.operatorName, duration: 0, items: 0 };
      }
      acc[record.operatorId].duration += minutesBetween(record.startTime, record.endTime) / 60;
      acc[record.operatorId].items += record.itemsProcessed;
      return acc;
    },
    {},
  );

  const bestOperators = Object.values(operatorMap)
    .map((entry) => ({
      operator: entry.name,
      itemsPerHour: entry.duration ? entry.items / entry.duration : 0,
    }))
    .sort((a, b) => b.itemsPerHour - a.itemsPerHour)
    .slice(0, 3);

  return { docsPerHour, itemsPerHour, bestOperators };
};

export const calculateAdoptionStats = (records: OperationRecord[]): AdoptionStats => {
  if (!records.length) {
    return { wizard: 0, autoComplete: 0, voice: 0 };
  }

  const wizard = records.filter((r) => r.featureUsage.wizardFlow).length / records.length;
  const autoComplete = records.filter((r) => r.featureUsage.autoComplete).length / records.length;
  const voice = records.filter((r) => r.featureUsage.voicePrompts).length / records.length;

  return {
    wizard: wizard * 100,
    autoComplete: autoComplete * 100,
    voice: voice * 100,
  };
};

export const calculateSyncStats = (records: OperationRecord[]): SyncStats => {
  const totals = records.reduce(
    (acc, record) => {
      acc.attempts += record.sync.attempts;
      acc.successes += record.sync.successes;
      acc.delaySum += record.sync.avgDelaySeconds * record.sync.attempts;
      acc.offlineSeconds += record.offlineSeconds;
      acc.totalSeconds += minutesBetween(record.startTime, record.endTime) * 60;
      return acc;
    },
    { attempts: 0, successes: 0, delaySum: 0, offlineSeconds: 0, totalSeconds: 0 },
  );

  return {
    successRate: totals.attempts ? (totals.successes / totals.attempts) * 100 : 0,
    avgDelay: totals.attempts ? totals.delaySum / totals.attempts : 0,
    offlineShare: totals.totalSeconds ? (totals.offlineSeconds / totals.totalSeconds) * 100 : 0,
  };
};

export const calculateSatisfactionStats = (records: OperationRecord[]): SatisfactionStats => {
  const csatValues = records
    .map((r) => r.satisfaction?.csat)
    .filter((value): value is number => typeof value === 'number');

  const csatAvg = csatValues.length ? average(csatValues) : 0;

  const scores = npsSamples.map((sample) => sample.score);
  const promoters = scores.filter((score) => score >= 9).length;
  const detractors = scores.filter((score) => score <= 6).length;
  const nps = scores.length ? ((promoters - detractors) / scores.length) * 100 : 0;

  return { csatAvg, nps };
};

export const defaultFilters: DashboardFilters = {
  docType: 'all',
  shift: 'all',
  days: 30,
};

























