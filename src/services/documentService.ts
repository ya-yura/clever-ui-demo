// === 📁 src/services/documentService.ts ===
// Service for working with documents from all modules

import { db } from './db';
import { 
  UniversalDocument, 
  DocumentType,
  DocumentFilter,
  DocumentSort,
} from '@/types/document';

/**
 * Document Service
 * Provides unified access to all document types
 */
export class DocumentService {
  /**
   * Get all documents from all modules
   */
  async getAllDocuments(): Promise<UniversalDocument[]> {
    try {
      const [
        receiving,
        placement,
        picking,
        shipment,
        returnDocs,
        inventory,
      ] = await Promise.all([
        this.getReceivingDocuments(),
        this.getPlacementDocuments(),
        this.getPickingDocuments(),
        this.getShipmentDocuments(),
        this.getReturnDocuments(),
        this.getInventoryDocuments(),
      ]);

      return [
        ...receiving,
        ...placement,
        ...picking,
        ...shipment,
        ...returnDocs,
        ...inventory,
      ];
    } catch (error) {
      console.error('Error fetching all documents:', error);
      return [];
    }
  }

  /**
   * Get receiving documents
   */
  private async getReceivingDocuments(): Promise<UniversalDocument[]> {
    const docs = await db.receivingDocuments.toArray();
    return Promise.all(docs.map(async (doc) => {
      const lines = await db.receivingLines
        .where('documentId')
        .equals(doc.id)
        .toArray();

      const totalLines = lines.length;
      const completedLines = lines.filter(l => l.status === 'completed').length;
      const totalQuantity = lines.reduce((sum, l) => sum + l.quantityPlan, 0);
      const completedQuantity = lines.reduce((sum, l) => sum + l.quantityFact, 0);

      return {
        id: doc.id,
        type: 'receiving' as DocumentType,
        status: doc.status,
        externalId: doc.deliveryNumber,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        syncedAt: doc.syncedAt,
        partnerName: doc.supplier,
        userId: doc.userId,
        notes: doc.notes,
        totalLines: doc.totalLines || totalLines,
        completedLines: doc.completedLines || completedLines,
        totalQuantity,
        completedQuantity,
      } as UniversalDocument;
    }));
  }

  /**
   * Get placement documents
   */
  private async getPlacementDocuments(): Promise<UniversalDocument[]> {
    const docs = await db.placementDocuments.toArray();
    return Promise.all(docs.map(async (doc) => {
      const lines = await db.placementLines
        .where('documentId')
        .equals(doc.id)
        .toArray();

      const totalLines = lines.length;
      const completedLines = lines.filter(l => l.status === 'completed').length;
      const totalQuantity = lines.reduce((sum, l) => sum + l.quantityPlan, 0);
      const completedQuantity = lines.reduce((sum, l) => sum + l.quantityFact, 0);

      return {
        id: doc.id,
        type: 'placement' as DocumentType,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        syncedAt: doc.syncedAt,
        userId: doc.userId,
        notes: doc.notes,
        sourceDocument: doc.sourceDocumentId,
        totalLines: doc.totalLines || totalLines,
        completedLines: doc.completedLines || completedLines,
        totalQuantity,
        completedQuantity,
      } as UniversalDocument;
    }));
  }

  /**
   * Get picking documents
   */
  private async getPickingDocuments(): Promise<UniversalDocument[]> {
    const docs = await db.pickingDocuments.toArray();
    return Promise.all(docs.map(async (doc) => {
      const lines = await db.pickingLines
        .where('documentId')
        .equals(doc.id)
        .toArray();

      const totalLines = lines.length;
      const completedLines = lines.filter(l => l.status === 'completed').length;
      const totalQuantity = lines.reduce((sum, l) => sum + l.quantityPlan, 0);
      const completedQuantity = lines.reduce((sum, l) => sum + l.quantityFact, 0);

      return {
        id: doc.id,
        type: 'picking' as DocumentType,
        status: doc.status,
        number: doc.orderNumber,
        externalId: doc.orderId,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        syncedAt: doc.syncedAt,
        partnerName: doc.customer,
        userId: doc.userId,
        notes: doc.notes,
        route: doc.route ? `${doc.route.length} ячеек` : undefined,
        totalLines: doc.totalLines || totalLines,
        completedLines: doc.completedLines || completedLines,
        totalQuantity,
        completedQuantity,
      } as UniversalDocument;
    }));
  }

  /**
   * Get shipment documents
   */
  private async getShipmentDocuments(): Promise<UniversalDocument[]> {
    const docs = await db.shipmentDocuments.toArray();
    return Promise.all(docs.map(async (doc) => {
      const lines = await db.shipmentLines
        .where('documentId')
        .equals(doc.id)
        .toArray();

      const totalLines = lines.length;
      const completedLines = lines.filter(l => l.status === 'completed').length;
      const totalQuantity = lines.reduce((sum, l) => sum + l.quantityPlan, 0);
      const completedQuantity = lines.reduce((sum, l) => sum + l.quantityFact, 0);

      return {
        id: doc.id,
        type: 'shipment' as DocumentType,
        status: doc.status,
        number: doc.orderNumber,
        externalId: doc.orderId,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        syncedAt: doc.syncedAt,
        partnerName: doc.customer,
        userId: doc.userId,
        notes: doc.notes,
        vehicle: doc.carrier,
        totalLines: doc.totalLines || totalLines,
        completedLines: doc.completedLines || completedLines,
        totalQuantity,
        completedQuantity,
      } as UniversalDocument;
    }));
  }

  /**
   * Get return documents
   */
  private async getReturnDocuments(): Promise<UniversalDocument[]> {
    const docs = await db.returnDocuments.toArray();
    return Promise.all(docs.map(async (doc) => {
      const lines = await db.returnLines
        .where('documentId')
        .equals(doc.id)
        .toArray();

      const totalLines = lines.length;
      const completedLines = lines.filter(l => l.status === 'completed').length;
      const totalQuantity = lines.reduce((sum, l) => sum + l.quantityPlan, 0);
      const completedQuantity = lines.reduce((sum, l) => sum + l.quantityFact, 0);

      return {
        id: doc.id,
        type: 'return' as DocumentType,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        syncedAt: doc.syncedAt,
        userId: doc.userId,
        notes: doc.notes,
        returnReason: doc.type === 'return' ? 'Возврат' : 'Списание',
        totalLines: doc.totalLines || totalLines,
        completedLines,
        totalQuantity,
        completedQuantity,
      } as UniversalDocument;
    }));
  }

  /**
   * Get inventory documents
   */
  private async getInventoryDocuments(): Promise<UniversalDocument[]> {
    const docs = await db.inventoryDocuments.toArray();
    return Promise.all(docs.map(async (doc) => {
      const lines = await db.inventoryLines
        .where('documentId')
        .equals(doc.id)
        .toArray();

      const totalLines = lines.length;
      const completedLines = lines.filter(l => l.status === 'completed').length;
      const totalQuantity = lines.reduce((sum, l) => sum + l.quantityPlan, 0);
      const completedQuantity = lines.reduce((sum, l) => sum + l.quantityFact, 0);

      return {
        id: doc.id,
        type: 'inventory' as DocumentType,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        syncedAt: doc.syncedAt,
        userId: doc.userId,
        notes: doc.notes,
        inventoryType: doc.type,
        totalLines: doc.totalLines || totalLines,
        completedLines: doc.completedLines || completedLines,
        totalQuantity,
        completedQuantity,
      } as UniversalDocument;
    }));
  }

  /**
   * Filter documents
   */
  filterDocuments(
    documents: UniversalDocument[],
    filter: DocumentFilter
  ): UniversalDocument[] {
    let filtered = [...documents];

    // Filter by types
    if (filter.types && filter.types.length > 0) {
      filtered = filtered.filter(doc => filter.types!.includes(doc.type));
    }

    // Filter by statuses
    if (filter.statuses && filter.statuses.length > 0) {
      filtered = filtered.filter(doc => filter.statuses!.includes(doc.status));
    }

    // Filter by priorities
    if (filter.priorities && filter.priorities.length > 0) {
      filtered = filtered.filter(doc => 
        doc.priority && filter.priorities!.includes(doc.priority)
      );
    }

    // Filter by date range
    if (filter.dateFrom) {
      filtered = filtered.filter(doc => doc.createdAt >= filter.dateFrom!);
    }
    if (filter.dateTo) {
      filtered = filtered.filter(doc => doc.createdAt <= filter.dateTo!);
    }

    // Filter by partner
    if (filter.partnerId) {
      filtered = filtered.filter(doc => doc.partnerId === filter.partnerId);
    }

    // Filter by user
    if (filter.userId) {
      filtered = filtered.filter(doc => doc.userId === filter.userId);
    }

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(doc => 
        doc.tags && doc.tags.some(tag => filter.tags!.includes(tag))
      );
    }

    // Search query
    if (filter.searchQuery && filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(doc => 
        doc.number?.toLowerCase().includes(query) ||
        doc.partnerName?.toLowerCase().includes(query) ||
        doc.notes?.toLowerCase().includes(query) ||
        doc.externalId?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  /**
   * Sort documents
   */
  sortDocuments(
    documents: UniversalDocument[],
    sort: DocumentSort
  ): UniversalDocument[] {
    const sorted = [...documents];
    const direction = sort.direction === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      let valueA: any = a[sort.field];
      let valueB: any = b[sort.field];

      // Handle undefined values
      if (valueA === undefined && valueB === undefined) return 0;
      if (valueA === undefined) return direction;
      if (valueB === undefined) return -direction;

      // String comparison
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction * valueA.localeCompare(valueB);
      }

      // Numeric comparison
      if (valueA < valueB) return -direction;
      if (valueA > valueB) return direction;
      return 0;
    });

    return sorted;
  }

  /**
   * Get document URL by type and id
   */
  getDocumentUrl(doc: UniversalDocument): string {
    return `/${doc.type}/${doc.id}`;
  }

  /**
   * Calculate completion percentage
   */
  getCompletionPercentage(doc: UniversalDocument): number {
    if (!doc.totalQuantity || doc.totalQuantity === 0) return 0;
    return Math.round((doc.completedQuantity || 0) / doc.totalQuantity * 100);
  }
}

// Export singleton instance
export const documentService = new DocumentService();

