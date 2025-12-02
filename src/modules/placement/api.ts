// === 📁 src/modules/placement/api.ts ===
// API layer for Placement module with demo/real mode support

import { db } from '@/services/db';
import { calculateLineStatus } from './logic';
import type { PlacementDocument, PlacementLine, PlacementFilters, PlacementSort, CellInfo } from './types';

export class PlacementAPI {
  private isDemo: boolean;

  constructor(isDemo: boolean = false) {
    this.isDemo = isDemo;
  }

  /**
   * Get all placement documents with filters and sorting
   */
  async getDocuments(filters?: PlacementFilters, sort?: PlacementSort): Promise<PlacementDocument[]> {
    if (this.isDemo) {
      return this.getDocumentsDemo(filters, sort);
    }
    return this.getDocumentsReal(filters, sort);
  }

  /**
   * Get single document by ID
   */
  async getDocument(id: string): Promise<PlacementDocument | null> {
    if (this.isDemo) {
      const docs = await db.placementDocuments.where('id').equals(id).toArray();
      return docs[0] || null;
    }
    // TODO: Real API call
    const docs = await db.placementDocuments.where('id').equals(id).toArray();
    return docs[0] || null;
  }

  /**
   * Get document lines
   */
  async getLines(documentId: string): Promise<PlacementLine[]> {
    if (this.isDemo) {
      return await db.placementLines.where('documentId').equals(documentId).toArray();
    }
    // TODO: Real API call
    return await db.placementLines.where('documentId').equals(documentId).toArray();
  }

  /**
   * Get cell information
   */
  async getCellInfo(cellId: string): Promise<CellInfo | null> {
    if (this.isDemo) {
      // TODO: Get from IndexedDB cells and inventory
      return {
        cellId,
        currentQuantity: 0,
        maxCapacity: 100,
        products: [],
      };
    }
    // TODO: Real API call
    return null;
  }

  /**
   * Validate cell for placement
   */
  async validateCell(cellId: string): Promise<{ valid: boolean; message?: string }> {
    const cellInfo = await this.getCellInfo(cellId);
    
    if (!cellInfo) {
      return { valid: false, message: 'Ячейка не найдена' };
    }

    return { valid: true };
  }

  /**
   * Update line quantity and cell
   */
  async updateLineQuantity(lineId: string, quantity: number, cellId?: string): Promise<void> {
    const line = await db.placementLines.get(lineId);
    if (!line) throw new Error('Line not found');

    const updatedLine: Partial<PlacementLine> = {
      quantityFact: quantity,
      status: calculateLineStatus(quantity, line.quantityPlan),
    };

    if (cellId) {
      updatedLine.cellId = cellId;
    }

    await db.placementLines.update(lineId, updatedLine);
    
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

    await db.placementDocuments.update(documentId, {
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

  private async getDocumentsDemo(filters?: PlacementFilters, sort?: PlacementSort): Promise<PlacementDocument[]> {
    let docs = await db.placementDocuments.toArray();

    if (filters) {
      docs = this.applyFilters(docs, filters);
    }

    if (sort) {
      docs = this.applySorting(docs, sort);
    }

    return docs;
  }

  private async getDocumentsReal(filters?: PlacementFilters, sort?: PlacementSort): Promise<PlacementDocument[]> {
    // TODO: Real API call
    return this.getDocumentsDemo(filters, sort);
  }

  private applyFilters(docs: PlacementDocument[], filters: PlacementFilters): PlacementDocument[] {
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
          doc.sourceDocument,
        ].filter(Boolean).map(f => f!.toLowerCase());

        if (!searchFields.some(field => field.includes(query))) return false;
      }

      return true;
    });
  }

  private applySorting(docs: PlacementDocument[], sort: PlacementSort): PlacementDocument[] {
    return [...docs].sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'date':
          comparison = (a.createdAt || 0) - (b.createdAt || 0);
          break;
        case 'cell':
          comparison = (a.sourceDocument || '').localeCompare(b.sourceDocument || '');
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
export const placementAPI = new PlacementAPI();
