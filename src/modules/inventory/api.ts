// === 📁 src/modules/inventory/api.ts ===
// API layer for Inventory module with demo/real mode support

import { db } from '@/services/db';
import { calculateLineStatus, generateDiscrepancyReport } from './logic';
import type { InventoryDocument, InventoryLine, InventoryFilters, InventorySort, DiscrepancyReport } from './types';

export class InventoryAPI {
  private isDemo: boolean;

  constructor(isDemo: boolean = false) {
    this.isDemo = isDemo;
  }

  /**
   * Get all inventory documents with filters and sorting
   */
  async getDocuments(filters?: InventoryFilters, sort?: InventorySort): Promise<InventoryDocument[]> {
    if (this.isDemo) {
      return this.getDocumentsDemo(filters, sort);
    }
    return this.getDocumentsReal(filters, sort);
  }

  /**
   * Get single document by ID
   */
  async getDocument(id: string): Promise<InventoryDocument | null> {
    if (this.isDemo) {
      const docs = await db.inventoryDocuments.where('id').equals(id).toArray();
      return docs[0] || null;
    }
    // TODO: Real API call
    const docs = await db.inventoryDocuments.where('id').equals(id).toArray();
    return docs[0] || null;
  }

  /**
   * Get document lines
   */
  async getLines(documentId: string): Promise<InventoryLine[]> {
    if (this.isDemo) {
      return await db.inventoryLines.where('documentId').equals(documentId).toArray();
    }
    // TODO: Real API call
    return await db.inventoryLines.where('documentId').equals(documentId).toArray();
  }

  /**
   * Get lines for specific cell
   */
  async getLinesByCell(documentId: string, cellId: string): Promise<InventoryLine[]> {
    const allLines = await this.getLines(documentId);
    return allLines.filter(line => line.cellId === cellId);
  }

  /**
   * Update line actual quantity
   */
  async updateLineQuantity(lineId: string, quantity: number): Promise<void> {
    const line = await db.inventoryLines.get(lineId);
    if (!line) throw new Error('Line not found');

    const discrepancy = quantity - line.quantitySystem;
    const updatedLine = {
      ...line,
      quantityFact: quantity,
      discrepancy,
      status: calculateLineStatus(quantity, line.quantitySystem),
      countedAt: Date.now(),
    };

    await db.inventoryLines.update(lineId, updatedLine);
    
    if (!this.isDemo) {
      // TODO: Queue for sync with real server
      console.log('Queue sync:', updatedLine);
    }
  }

  /**
   * Generate discrepancy report for document
   */
  async getDiscrepancyReport(documentId: string): Promise<DiscrepancyReport> {
    const lines = await this.getLines(documentId);
    return generateDiscrepancyReport(documentId, lines);
  }

  /**
   * Complete document
   */
  async completeDocument(documentId: string): Promise<void> {
    const doc = await this.getDocument(documentId);
    if (!doc) throw new Error('Document not found');

    const lines = await this.getLines(documentId);
    const completedLines = lines.filter(l => l.quantityFact > 0).length;
    const discrepanciesCount = lines.filter(l => l.discrepancy !== 0).length;

    await db.inventoryDocuments.update(documentId, {
      status: 'completed' as const,
      completedLines,
      discrepanciesCount,
      updatedAt: Date.now(),
    });

    if (!this.isDemo) {
      // TODO: Send to real server
      console.log('Send completion to server:', documentId);
    }
  }

  // Private methods

  private async getDocumentsDemo(filters?: InventoryFilters, sort?: InventorySort): Promise<InventoryDocument[]> {
    let docs = await db.inventoryDocuments.toArray();

    if (filters) {
      docs = this.applyFilters(docs, filters);
    }

    if (sort) {
      docs = this.applySorting(docs, sort);
    }

    return docs;
  }

  private async getDocumentsReal(filters?: InventoryFilters, sort?: InventorySort): Promise<InventoryDocument[]> {
    // TODO: Real API call
    return this.getDocumentsDemo(filters, sort);
  }

  private applyFilters(docs: InventoryDocument[], filters: InventoryFilters): InventoryDocument[] {
    return docs.filter(doc => {
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(doc.status)) return false;
      }

      if (filters.type && filters.type.length > 0 && doc.type) {
        if (!filters.type.includes(doc.type)) return false;
      }

      if (filters.zone && doc.zone) {
        if (!doc.zone.toLowerCase().includes(filters.zone.toLowerCase())) return false;
      }

      if (filters.dateFrom && doc.createdAt && doc.createdAt < filters.dateFrom) return false;
      if (filters.dateTo && doc.createdAt && doc.createdAt > filters.dateTo) return false;

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchFields = [
          doc.id,
          doc.type,
          doc.zone,
        ].filter(Boolean).map(f => f!.toLowerCase());

        if (!searchFields.some(field => field.includes(query))) return false;
      }

      return true;
    });
  }

  private applySorting(docs: InventoryDocument[], sort: InventorySort): InventoryDocument[] {
    return [...docs].sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'date':
          comparison = (a.createdAt || 0) - (b.createdAt || 0);
          break;
        case 'type':
          comparison = (a.type || '').localeCompare(b.type || '');
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
export const inventoryAPI = new InventoryAPI();
