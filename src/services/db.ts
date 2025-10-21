// === 📁 src/services/db.ts ===
import Dexie, { Table } from 'dexie';
import type {
  ReceivingDocument,
  PlacementDocument,
  PickingDocument,
  ShipmentDocument,
  ReturnDocument,
  InventoryDocument,
} from '@/types';
import type { BarcodeSession } from '@/types/barcode';
import type { PrintJob } from '@/types/label';

export class WarehouseDB extends Dexie {
  // Документы
  receivingDocs!: Table<ReceivingDocument, string>;
  placementDocs!: Table<PlacementDocument, string>;
  pickingDocs!: Table<PickingDocument, string>;
  shipmentDocs!: Table<ShipmentDocument, string>;
  returnDocs!: Table<ReturnDocument, string>;
  inventoryDocs!: Table<InventoryDocument, string>;

  // Сессии сканирования
  barcodeSessions!: Table<BarcodeSession, string>;

  // Задания печати
  printJobs!: Table<PrintJob, string>;

  // Очередь синхронизации
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super('WarehouseDB');

    this.version(1).stores({
      receivingDocs: 'id, number, date, status, syncStatus',
      placementDocs: 'id, number, date, status, syncStatus',
      pickingDocs: 'id, number, date, status, syncStatus',
      shipmentDocs: 'id, number, date, status, syncStatus',
      returnDocs: 'id, number, date, status, syncStatus, type',
      inventoryDocs: 'id, number, date, status, syncStatus',
      barcodeSessions: 'id, startTime, exported',
      printJobs: 'id, status, createdAt',
      syncQueue: 'id, type, timestamp, retries'
    });
  }
}

export interface SyncQueueItem {
  id: string;
  type: 'receiving' | 'placement' | 'picking' | 'shipment' | 'return' | 'inventory';
  documentId: string;
  action: 'create' | 'update' | 'complete';
  data: any;
  timestamp: number;
  retries: number;
  lastError?: string;
}

export const db = new WarehouseDB();



