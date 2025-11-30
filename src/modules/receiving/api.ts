// === 📁 src/modules/receiving/api.ts ===
// API layer for Receiving module with demo/real mode support

import { db } from '@/services/db';
import { demoDataService } from '@/services/demoDataService';
import { calculateLineStatus } from './logic';
import type { ReceivingDocument, ReceivingLine, ReceivingFilters, ReceivingSort } from './types';

export class ReceivingAPI {
  private isDemo: boolean;

  constructor(isDemo: boolean = false) {
    this.isDemo = isDemo;
  }

  /**
   * Get all receiving documents with filters and sorting
   */
  async getDocuments(filters?: ReceivingFilters, sort?: ReceivingSort): Promise<ReceivingDocument[]> {
    if (this.isDemo) {
      return this.getDocumentsDemo(filters, sort);
    }
    return this.getDocumentsReal(filters, sort);
  }

  /**
   * Get single document by ID
   */
  async getDocument(id: string): Promise<ReceivingDocument | null> {
    if (this.isDemo) {
      const docs = await db.receivingDocuments.where('id').equals(id).toArray();
      return docs[0] || null;
    }
    // TODO: Real API call
    const docs = await db.receivingDocuments.where('id').equals(id).toArray();
    return docs[0] || null;
  }

  /**
   * Get document lines
   */
  async getLines(documentId: string): Promise<ReceivingLine[]> {
    if (this.isDemo) {
      return await db.receivingLines.where('documentId').equals(documentId).toArray();
    }
    // TODO: Real API call
    return await db.receivingLines.where('documentId').equals(documentId).toArray();
  }

  /**
   * Update line quantity
   */
  async updateLineQuantity(lineId: string, quantity: number): Promise<void> {
    const line = await db.receivingLines.get(lineId);
    if (!line) throw new Error('Line not found');

    const updatedLine = {
      ...line,
      quantityFact: quantity,
      status: calculateLineStatus(quantity, line.quantityPlan),
      receivedAt: Date.now(),
    };

    await db.receivingLines.update(lineId, updatedLine);
    
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

    await db.receivingDocuments.update(documentId, {
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

  private async getDocumentsDemo(filters?: ReceivingFilters, sort?: ReceivingSort): Promise<ReceivingDocument[]> {
    let docs = await db.receivingDocuments.toArray();

    // Apply filters
    if (filters) {
      docs = this.applyFilters(docs, filters);
    }

    // Apply sorting
    if (sort) {
      docs = this.applySorting(docs, sort);
    }

    return docs;
  }

  private async getDocumentsReal(filters?: ReceivingFilters, sort?: ReceivingSort): Promise<ReceivingDocument[]> {
    // TODO: Real API call
    // For now, use IndexedDB as cache
    return this.getDocumentsDemo(filters, sort);
  }

  private applyFilters(docs: ReceivingDocument[], filters: ReceivingFilters): ReceivingDocument[] {
    return docs.filter(doc => {
      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(doc.status)) return false;
      }

      // Supplier filter
      if (filters.supplier && doc.supplier) {
        if (!doc.supplier.toLowerCase().includes(filters.supplier.toLowerCase())) return false;
      }

      // Date range filter
      if (filters.dateFrom && doc.createdAt && doc.createdAt < filters.dateFrom) return false;
      if (filters.dateTo && doc.createdAt && doc.createdAt > filters.dateTo) return false;

      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchFields = [
          doc.id,
          doc.supplier,
          doc.deliveryNumber,
        ].filter(Boolean).map(f => f!.toLowerCase());

        if (!searchFields.some(field => field.includes(query))) return false;
      }

      return true;
    });
  }

  private applySorting(docs: ReceivingDocument[], sort: ReceivingSort): ReceivingDocument[] {
    return [...docs].sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'date':
          comparison = (a.createdAt || 0) - (b.createdAt || 0);
          break;
        case 'supplier':
          comparison = (a.supplier || '').localeCompare(b.supplier || '');
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
export const receivingAPI = new ReceivingAPI();
