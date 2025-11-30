// === 📁 src/modules/shipment/api.ts ===
// API layer for Shipment module with demo/real mode support

import { db } from '@/services/db';
import { calculateLineStatus } from './logic';
import type { ShipmentDocument, ShipmentLine, ShipmentFilters, ShipmentSort } from './types';

export class ShipmentAPI {
  private isDemo: boolean;

  constructor(isDemo: boolean = false) {
    this.isDemo = isDemo;
  }

  /**
   * Get all shipment documents with filters and sorting
   */
  async getDocuments(filters?: ShipmentFilters, sort?: ShipmentSort): Promise<ShipmentDocument[]> {
    if (this.isDemo) {
      return this.getDocumentsDemo(filters, sort);
    }
    return this.getDocumentsReal(filters, sort);
  }

  /**
   * Get single document by ID
   */
  async getDocument(id: string): Promise<ShipmentDocument | null> {
    if (this.isDemo) {
      const docs = await db.shipmentDocuments.where('id').equals(id).toArray();
      return docs[0] || null;
    }
    // TODO: Real API call
    const docs = await db.shipmentDocuments.where('id').equals(id).toArray();
    return docs[0] || null;
  }

  /**
   * Get document lines
   */
  async getLines(documentId: string): Promise<ShipmentLine[]> {
    if (this.isDemo) {
      return await db.shipmentLines.where('documentId').equals(documentId).toArray();
    }
    // TODO: Real API call
    return await db.shipmentLines.where('documentId').equals(documentId).toArray();
  }

  /**
   * Update line quantity
   */
  async updateLineQuantity(lineId: string, quantity: number): Promise<void> {
    const line = await db.shipmentLines.get(lineId);
    if (!line) throw new Error('Line not found');

    const updatedLine = {
      ...line,
      quantityFact: quantity,
      status: calculateLineStatus(quantity, line.quantityPlan),
      shippedAt: Date.now(),
    };

    await db.shipmentLines.update(lineId, updatedLine);
    
    if (!this.isDemo) {
      // TODO: Queue for sync with real server
      console.log('Queue sync:', updatedLine);
    }
  }

  /**
   * Complete document
   */
  async completeDocument(documentId: string): Promise<void> {
    const doc = await this.getDocument(documentId);
    if (!doc) throw new Error('Document not found');

    const lines = await this.getLines(documentId);
    const completedLines = lines.filter(l => l.quantityFact >= l.quantityPlan).length;

    await db.shipmentDocuments.update(documentId, {
      status: 'completed' as const,
      completedLines,
      updatedAt: Date.now(),
    });

    if (!this.isDemo) {
      // TODO: Send to real server
      console.log('Send completion to server:', documentId);
    }
  }

  // Private methods

  private async getDocumentsDemo(filters?: ShipmentFilters, sort?: ShipmentSort): Promise<ShipmentDocument[]> {
    let docs = await db.shipmentDocuments.toArray();

    if (filters) {
      docs = this.applyFilters(docs, filters);
    }

    if (sort) {
      docs = this.applySorting(docs, sort);
    }

    return docs;
  }

  private async getDocumentsReal(filters?: ShipmentFilters, sort?: ShipmentSort): Promise<ShipmentDocument[]> {
    // TODO: Real API call
    return this.getDocumentsDemo(filters, sort);
  }

  private applyFilters(docs: ShipmentDocument[], filters: ShipmentFilters): ShipmentDocument[] {
    return docs.filter(doc => {
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(doc.status)) return false;
      }

      if (filters.carrier && doc.carrier) {
        if (!doc.carrier.toLowerCase().includes(filters.carrier.toLowerCase())) return false;
      }

      if (filters.dateFrom && doc.createdAt && doc.createdAt < filters.dateFrom) return false;
      if (filters.dateTo && doc.createdAt && doc.createdAt > filters.dateTo) return false;

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchFields = [
          doc.id,
          doc.carrier,
          doc.trackingNumber,
        ].filter(Boolean).map(f => f!.toLowerCase());

        if (!searchFields.some(field => field.includes(query))) return false;
      }

      return true;
    });
  }

  private applySorting(docs: ShipmentDocument[], sort: ShipmentSort): ShipmentDocument[] {
    return [...docs].sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'date':
          comparison = (a.createdAt || 0) - (b.createdAt || 0);
          break;
        case 'carrier':
          comparison = (a.carrier || '').localeCompare(b.carrier || '');
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }
}

// Export singleton instance
export const shipmentAPI = new ShipmentAPI();
