// === 📁 src/modules/picking/api.ts ===
// API layer for Picking module with demo/real mode support

import { db } from '@/services/db';
import { calculateLineStatus, optimizeRoute } from './logic';
import type { PickingDocument, PickingLine, PickingFilters, PickingSort, PickingRoute } from './types';

export class PickingAPI {
  private isDemo: boolean;

  constructor(isDemo: boolean = false) {
    this.isDemo = isDemo;
  }

  /**
   * Get all picking documents with filters and sorting
   */
  async getDocuments(filters?: PickingFilters, sort?: PickingSort): Promise<PickingDocument[]> {
    if (this.isDemo) {
      return this.getDocumentsDemo(filters, sort);
    }
    return this.getDocumentsReal(filters, sort);
  }

  /**
   * Get single document by ID
   */
  async getDocument(id: string): Promise<PickingDocument | null> {
    if (this.isDemo) {
      const docs = await db.pickingDocuments.where('id').equals(id).toArray();
      return docs[0] || null;
    }
    // TODO: Real API call
    const docs = await db.pickingDocuments.where('id').equals(id).toArray();
    return docs[0] || null;
  }

  /**
   * Get document lines
   */
  async getLines(documentId: string): Promise<PickingLine[]> {
    if (this.isDemo) {
      return await db.pickingLines.where('documentId').equals(documentId).toArray();
    }
    // TODO: Real API call
    return await db.pickingLines.where('documentId').equals(documentId).toArray();
  }

  /**
   * Get optimized picking route
   */
  async getRoute(documentId: string): Promise<PickingRoute> {
    const doc = await this.getDocument(documentId);
    if (!doc) throw new Error('Document not found');

    const lines = await this.getLines(documentId);
    const steps = optimizeRoute(lines);
    const currentStepIndex = steps.findIndex(s => !s.completed);

    return {
      documentId,
      steps,
      currentStep: currentStepIndex >= 0 ? currentStepIndex : steps.length,
      totalSteps: steps.length,
    };
  }

  /**
   * Update line quantity
   */
  async updateLineQuantity(lineId: string, quantity: number): Promise<void> {
    const line = await db.pickingLines.get(lineId);
    if (!line) throw new Error('Line not found');

    const updatedLine = {
      ...line,
      quantityFact: quantity,
      status: calculateLineStatus(quantity, line.quantityPlan),
    };

    await db.pickingLines.update(lineId, updatedLine);
    
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

    await db.pickingDocuments.update(documentId, {
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

  private async getDocumentsDemo(filters?: PickingFilters, sort?: PickingSort): Promise<PickingDocument[]> {
    let docs = await db.pickingDocuments.toArray();

    if (filters) {
      docs = this.applyFilters(docs, filters);
    }

    if (sort) {
      docs = this.applySorting(docs, sort);
    }

    return docs;
  }

  private async getDocumentsReal(filters?: PickingFilters, sort?: PickingSort): Promise<PickingDocument[]> {
    // TODO: Real API call
    return this.getDocumentsDemo(filters, sort);
  }

  private applyFilters(docs: PickingDocument[], filters: PickingFilters): PickingDocument[] {
    return docs.filter(doc => {
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(doc.status)) return false;
      }

      if (filters.customer && doc.customer) {
        if (!doc.customer.toLowerCase().includes(filters.customer.toLowerCase())) return false;
      }

      if (filters.dateFrom && doc.createdAt && doc.createdAt < filters.dateFrom) return false;
      if (filters.dateTo && doc.createdAt && doc.createdAt > filters.dateTo) return false;

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchFields = [
          doc.id,
          doc.orderNumber,
          doc.customer,
        ].filter(Boolean).map(f => f!.toLowerCase());

        if (!searchFields.some(field => field.includes(query))) return false;
      }

      return true;
    });
  }

  private applySorting(docs: PickingDocument[], sort: PickingSort): PickingDocument[] {
    return [...docs].sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'date':
          comparison = (a.createdAt || 0) - (b.createdAt || 0);
          break;
        case 'customer':
          comparison = (a.customer || '').localeCompare(b.customer || '');
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
export const pickingAPI = new PickingAPI();
