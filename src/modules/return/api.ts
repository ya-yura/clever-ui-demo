// === 📁 src/modules/return/api.ts ===
// API layer for Return/Write-off module with demo/real mode support

import { db } from '@/services/db';
import { calculateLineStatus } from './logic';
import type { ReturnDocument, ReturnLine, ReturnFilters, ReturnSort, ReturnReason } from './types';

export class ReturnAPI {
  private isDemo: boolean;

  constructor(isDemo: boolean = false) {
    this.isDemo = isDemo;
  }

  /**
   * Get all return documents with filters and sorting
   */
  async getDocuments(filters?: ReturnFilters, sort?: ReturnSort): Promise<ReturnDocument[]> {
    if (this.isDemo) {
      return this.getDocumentsDemo(filters, sort);
    }
    return this.getDocumentsReal(filters, sort);
  }

  /**
   * Get single document by ID
   */
  async getDocument(id: string): Promise<ReturnDocument | null> {
    if (this.isDemo) {
      const docs = await db.returnDocuments.where('id').equals(id).toArray();
      return docs[0] || null;
    }
    // TODO: Real API call
    const docs = await db.returnDocuments.where('id').equals(id).toArray();
    return docs[0] || null;
  }

  /**
   * Get document lines
   */
  async getLines(documentId: string): Promise<ReturnLine[]> {
    if (this.isDemo) {
      return await db.returnLines.where('documentId').equals(documentId).toArray();
    }
    // TODO: Real API call
    return await db.returnLines.where('documentId').equals(documentId).toArray();
  }

  /**
   * Update line with quantity, reason, and optional photos
   */
  async updateLine(
    lineId: string,
    quantity: number,
    reason?: ReturnReason,
    photos?: string[]
  ): Promise<void> {
    const line = await db.returnLines.get(lineId);
    if (!line) throw new Error('Line not found');

    const updatedLine: Partial<ReturnLine> = {
      quantityFact: quantity,
      status: calculateLineStatus(quantity, line.quantityPlan),
      addedAt: Date.now(),
    };

    if (reason) {
      updatedLine.reason = reason;
    }

    if (photos && photos.length > 0) {
      updatedLine.photos = photos;
    }

    await db.returnLines.update(lineId, updatedLine);
    
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

    await db.returnDocuments.update(documentId, {
      status: 'completed' as const,
      updatedAt: Date.now(),
    });

    if (!this.isDemo) {
      // TODO: Send to real server
      console.log('Send completion to server:', documentId);
    }
  }

  // Private methods

  private async getDocumentsDemo(filters?: ReturnFilters, sort?: ReturnSort): Promise<ReturnDocument[]> {
    let docs = await db.returnDocuments.toArray();

    if (filters) {
      docs = this.applyFilters(docs, filters);
    }

    if (sort) {
      docs = this.applySorting(docs, sort);
    }

    return docs;
  }

  private async getDocumentsReal(filters?: ReturnFilters, sort?: ReturnSort): Promise<ReturnDocument[]> {
    // TODO: Real API call
    return this.getDocumentsDemo(filters, sort);
  }

  private applyFilters(docs: ReturnDocument[], filters: ReturnFilters): ReturnDocument[] {
    return docs.filter(doc => {
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(doc.status)) return false;
      }

      if (filters.dateFrom && doc.createdAt && doc.createdAt < filters.dateFrom) return false;
      if (filters.dateTo && doc.createdAt && doc.createdAt > filters.dateTo) return false;

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchFields = [
          doc.id,
          doc.type,
        ].filter(Boolean).map(f => f!.toLowerCase());

        if (!searchFields.some(field => field.includes(query))) return false;
      }

      return true;
    });
  }

  private applySorting(docs: ReturnDocument[], sort: ReturnSort): ReturnDocument[] {
    return [...docs].sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'date':
          comparison = (a.createdAt || 0) - (b.createdAt || 0);
          break;
        case 'reason':
          comparison = a.type.localeCompare(b.type);
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
export const returnAPI = new ReturnAPI();
