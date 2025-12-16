import { DocumentType } from '@/types/document';

export type ShiftName = 'morning' | 'day' | 'evening' | 'night';

export interface OperationRecord {
  id: string;
  docType: DocumentType;
  warehouseId: string;
  operatorId: string;
  operatorName: string;
  shift: ShiftName;
  startTime: string;
  endTime: string;
  itemsPlanned: number;
  itemsProcessed: number;
  lines: number;
  discrepancies: number;
  manualCorrections: number;
  falsePositives: number;
  errors: number;
  scans: number;
  offlineSeconds: number;
  featureUsage: {
    wizardFlow: boolean;
    voicePrompts: boolean;
    autoComplete: boolean;
  };
  sync: {
    attempts: number;
    successes: number;
    avgDelaySeconds: number;
  };
  satisfaction?: {
    csat?: number;
    nps?: number;
  };
}

const iso = (date: string) => new Date(date).toISOString();

export const operationRecords: OperationRecord[] = [
  {
    id: 'RCV-1001',
    docType: 'receiving',
    warehouseId: 'WH-1',
    operatorId: 'op-01',
    operatorName: 'Ирина',
    shift: 'morning',
    startTime: iso('2025-11-30T05:10:00Z'),
    endTime: iso('2025-11-30T05:42:00Z'),
    itemsPlanned: 120,
    itemsProcessed: 118,
    lines: 35,
    discrepancies: 2,
    manualCorrections: 3,
    falsePositives: 1,
    errors: 2,
    scans: 146,
    offlineSeconds: 35,
    featureUsage: { wizardFlow: true, voicePrompts: false, autoComplete: true },
    sync: { attempts: 3, successes: 3, avgDelaySeconds: 12 },
    satisfaction: { csat: 4, nps: 9 },
  },
  {
    id: 'RCV-1002',
    docType: 'receiving',
    warehouseId: 'WH-2',
    operatorId: 'op-02',
    operatorName: 'Сергей',
    shift: 'day',
    startTime: iso('2025-11-30T08:05:00Z'),
    endTime: iso('2025-11-30T08:58:00Z'),
    itemsPlanned: 150,
    itemsProcessed: 147,
    lines: 41,
    discrepancies: 1,
    manualCorrections: 1,
    falsePositives: 0,
    errors: 1,
    scans: 182,
    offlineSeconds: 0,
    featureUsage: { wizardFlow: false, voicePrompts: false, autoComplete: false },
    sync: { attempts: 2, successes: 2, avgDelaySeconds: 9 },
    satisfaction: { csat: 5, nps: 10 },
  },
  {
    id: 'PLC-2010',
    docType: 'placement',
    warehouseId: 'WH-1',
    operatorId: 'op-03',
    operatorName: 'Марина',
    shift: 'day',
    startTime: iso('2025-11-29T10:15:00Z'),
    endTime: iso('2025-11-29T10:47:00Z'),
    itemsPlanned: 80,
    itemsProcessed: 80,
    lines: 28,
    discrepancies: 0,
    manualCorrections: 0,
    falsePositives: 1,
    errors: 0,
    scans: 102,
    offlineSeconds: 22,
    featureUsage: { wizardFlow: true, voicePrompts: true, autoComplete: true },
    sync: { attempts: 3, successes: 3, avgDelaySeconds: 14 },
    satisfaction: { csat: 4, nps: 8 },
  },
  {
    id: 'PLK-3055',
    docType: 'picking',
    warehouseId: 'WH-3',
    operatorId: 'op-04',
    operatorName: 'Антон',
    shift: 'evening',
    startTime: iso('2025-11-28T15:40:00Z'),
    endTime: iso('2025-11-28T16:35:00Z'),
    itemsPlanned: 95,
    itemsProcessed: 92,
    lines: 30,
    discrepancies: 3,
    manualCorrections: 5,
    falsePositives: 2,
    errors: 4,
    scans: 120,
    offlineSeconds: 10,
    featureUsage: { wizardFlow: false, voicePrompts: false, autoComplete: false },
    sync: { attempts: 2, successes: 1, avgDelaySeconds: 48 },
    satisfaction: { csat: 3, nps: -10 },
  },
  {
    id: 'PLK-3056',
    docType: 'picking',
    warehouseId: 'WH-3',
    operatorId: 'op-05',
    operatorName: 'Екатерина',
    shift: 'night',
    startTime: iso('2025-11-29T23:05:00Z'),
    endTime: iso('2025-11-29T23:44:00Z'),
    itemsPlanned: 90,
    itemsProcessed: 90,
    lines: 27,
    discrepancies: 0,
    manualCorrections: 1,
    falsePositives: 0,
    errors: 0,
    scans: 111,
    offlineSeconds: 0,
    featureUsage: { wizardFlow: true, voicePrompts: false, autoComplete: true },
    sync: { attempts: 1, successes: 1, avgDelaySeconds: 6 },
    satisfaction: { csat: 5, nps: 8 },
  },
  {
    id: 'SHP-4101',
    docType: 'shipment',
    warehouseId: 'WH-2',
    operatorId: 'op-06',
    operatorName: 'Дмитрий',
    shift: 'day',
    startTime: iso('2025-11-30T12:15:00Z'),
    endTime: iso('2025-11-30T12:49:00Z'),
    itemsPlanned: 60,
    itemsProcessed: 60,
    lines: 18,
    discrepancies: 0,
    manualCorrections: 0,
    falsePositives: 0,
    errors: 0,
    scans: 74,
    offlineSeconds: 5,
    featureUsage: { wizardFlow: true, voicePrompts: true, autoComplete: false },
    sync: { attempts: 2, successes: 2, avgDelaySeconds: 11 },
    satisfaction: { csat: 4, nps: 7 },
  },
  {
    id: 'RET-5102',
    docType: 'return',
    warehouseId: 'WH-1',
    operatorId: 'op-07',
    operatorName: 'Алексей',
    shift: 'morning',
    startTime: iso('2025-11-27T07:10:00Z'),
    endTime: iso('2025-11-27T07:38:00Z'),
    itemsPlanned: 45,
    itemsProcessed: 44,
    lines: 15,
    discrepancies: 1,
    manualCorrections: 2,
    falsePositives: 1,
    errors: 1,
    scans: 58,
    offlineSeconds: 0,
    featureUsage: { wizardFlow: false, voicePrompts: false, autoComplete: false },
    sync: { attempts: 1, successes: 1, avgDelaySeconds: 8 },
    satisfaction: { csat: 3 },
  },
  {
    id: 'INV-6101',
    docType: 'inventory',
    warehouseId: 'WH-4',
    operatorId: 'op-08',
    operatorName: 'Людмила',
    shift: 'day',
    startTime: iso('2025-11-26T09:00:00Z'),
    endTime: iso('2025-11-26T10:20:00Z'),
    itemsPlanned: 300,
    itemsProcessed: 295,
    lines: 85,
    discrepancies: 6,
    manualCorrections: 4,
    falsePositives: 2,
    errors: 5,
    scans: 330,
    offlineSeconds: 120,
    featureUsage: { wizardFlow: false, voicePrompts: true, autoComplete: false },
    sync: { attempts: 4, successes: 3, avgDelaySeconds: 55 },
    satisfaction: { csat: 2, nps: -30 },
  },
  {
    id: 'INV-6102',
    docType: 'inventory',
    warehouseId: 'WH-4',
    operatorId: 'op-08',
    operatorName: 'Людмила',
    shift: 'day',
    startTime: iso('2025-12-01T09:05:00Z'),
    endTime: iso('2025-12-01T10:05:00Z'),
    itemsPlanned: 320,
    itemsProcessed: 320,
    lines: 90,
    discrepancies: 2,
    manualCorrections: 1,
    falsePositives: 1,
    errors: 1,
    scans: 350,
    offlineSeconds: 60,
    featureUsage: { wizardFlow: true, voicePrompts: true, autoComplete: true },
    sync: { attempts: 4, successes: 4, avgDelaySeconds: 22 },
    satisfaction: { csat: 4, nps: 5 },
  },
  {
    id: 'RCV-1003',
    docType: 'receiving',
    warehouseId: 'WH-5',
    operatorId: 'op-09',
    operatorName: 'Павел',
    shift: 'evening',
    startTime: iso('2025-12-01T17:00:00Z'),
    endTime: iso('2025-12-01T17:32:00Z'),
    itemsPlanned: 110,
    itemsProcessed: 110,
    lines: 32,
    discrepancies: 0,
    manualCorrections: 0,
    falsePositives: 1,
    errors: 0,
    scans: 140,
    offlineSeconds: 0,
    featureUsage: { wizardFlow: true, voicePrompts: false, autoComplete: true },
    sync: { attempts: 2, successes: 2, avgDelaySeconds: 10 },
    satisfaction: { csat: 5, nps: 9 },
  },
  {
    id: 'PLC-2011',
    docType: 'placement',
    warehouseId: 'WH-5',
    operatorId: 'op-09',
    operatorName: 'Павел',
    shift: 'evening',
    startTime: iso('2025-12-01T18:05:00Z'),
    endTime: iso('2025-12-01T18:31:00Z'),
    itemsPlanned: 70,
    itemsProcessed: 70,
    lines: 25,
    discrepancies: 0,
    manualCorrections: 0,
    falsePositives: 0,
    errors: 0,
    scans: 95,
    offlineSeconds: 12,
    featureUsage: { wizardFlow: true, voicePrompts: false, autoComplete: true },
    sync: { attempts: 2, successes: 2, avgDelaySeconds: 16 },
    satisfaction: { csat: 4, nps: 6 },
  },
  {
    id: 'PLK-3057',
    docType: 'picking',
    warehouseId: 'WH-6',
    operatorId: 'op-10',
    operatorName: 'Наталья',
    shift: 'day',
    startTime: iso('2025-11-25T11:00:00Z'),
    endTime: iso('2025-11-25T11:48:00Z'),
    itemsPlanned: 105,
    itemsProcessed: 103,
    lines: 33,
    discrepancies: 2,
    manualCorrections: 4,
    falsePositives: 1,
    errors: 2,
    scans: 134,
    offlineSeconds: 45,
    featureUsage: { wizardFlow: false, voicePrompts: true, autoComplete: false },
    sync: { attempts: 3, successes: 2, avgDelaySeconds: 40 },
    satisfaction: { csat: 3, nps: -5 },
  },
  {
    id: 'RET-5103',
    docType: 'return',
    warehouseId: 'WH-2',
    operatorId: 'op-06',
    operatorName: 'Дмитрий',
    shift: 'day',
    startTime: iso('2025-12-02T13:00:00Z'),
    endTime: iso('2025-12-02T13:21:00Z'),
    itemsPlanned: 40,
    itemsProcessed: 39,
    lines: 14,
    discrepancies: 1,
    manualCorrections: 1,
    falsePositives: 0,
    errors: 1,
    scans: 52,
    offlineSeconds: 0,
    featureUsage: { wizardFlow: true, voicePrompts: true, autoComplete: false },
    sync: { attempts: 1, successes: 1, avgDelaySeconds: 7 },
    satisfaction: { csat: 4, nps: 4 },
  },
  {
    id: 'SHP-4102',
    docType: 'shipment',
    warehouseId: 'WH-3',
    operatorId: 'op-05',
    operatorName: 'Екатерина',
    shift: 'night',
    startTime: iso('2025-12-02T01:05:00Z'),
    endTime: iso('2025-12-02T01:33:00Z'),
    itemsPlanned: 55,
    itemsProcessed: 55,
    lines: 16,
    discrepancies: 0,
    manualCorrections: 0,
    falsePositives: 0,
    errors: 0,
    scans: 70,
    offlineSeconds: 0,
    featureUsage: { wizardFlow: true, voicePrompts: false, autoComplete: true },
    sync: { attempts: 1, successes: 1, avgDelaySeconds: 5 },
    satisfaction: { csat: 5, nps: 10 },
  },
];

export interface NpsSample {
  respondentType: 'operator' | 'manager';
  score: number;
  submittedAt: string;
}

export const npsSamples: NpsSample[] = [
  { respondentType: 'operator', score: 9, submittedAt: iso('2025-11-29T07:00:00Z') },
  { respondentType: 'operator', score: 8, submittedAt: iso('2025-11-30T14:00:00Z') },
  { respondentType: 'operator', score: 4, submittedAt: iso('2025-11-27T16:00:00Z') },
  { respondentType: 'manager', score: 6, submittedAt: iso('2025-11-30T08:30:00Z') },
  { respondentType: 'manager', score: 10, submittedAt: iso('2025-12-01T12:45:00Z') },
  { respondentType: 'operator', score: 2, submittedAt: iso('2025-12-01T10:00:00Z') },
];













