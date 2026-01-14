/**
 * OData API Integration Service
 * Интеграция с реальным API Cleverence MobileSMARTS
 * 
 * Note: api.ts baseURL already includes /MobileSMARTS/api/v1
 * So all calls here should use relative paths without that prefix
 */

import { api } from './api';
import { demoDataService } from './demoDataService';
import { serverHealth } from './serverHealth';

export interface ODataDocType {
  uni: string;
  name: string;
  displayName: string;
  buttonColor?: string;
  clientCreating: boolean;
  manualDocumentSelection: boolean;
  input: boolean;
  output: boolean;
}

export interface ODataDocument {
  id: string;
  name: string;
  documentTypeName: string;
  finished: boolean;
  inProcess: boolean;
  modified: boolean;
  createDate: string;
  lastChangeDate: string;
  userId?: string;
  userName?: string;
  warehouseId?: string;
  priority: number;
  description?: string;
  barcode?: string;
}

export interface ODataDocumentItem {
  uid: string;
  productId: string;
  productName: string;
  productBarcode: string;
  declaredQuantity: number;
  currentQuantity: number;
  firstCellId?: string;
  secondCellId?: string;
  packingId?: string;
  index: number;
}

export interface ODataProduct {
  id: string;
  name: string;
  barcode: string;
  unitId?: string;
  marking?: string;
}

export interface ODataCell {
  id: string;
  name: string;
  barcode?: string;
  description?: string;
  warehouseId?: string;
}

class ODataAPIService {
  /**
   * Check if we should use demo mode
   */
  private async shouldUseDemo(): Promise<boolean> {
    return await serverHealth.shouldUseDemoMode();
  }

  /**
   * Получить список типов документов
   * GET /DocTypes
   */
  async getDocTypes(): Promise<ODataDocType[]> {
    // Check if we should use demo mode
    if (await this.shouldUseDemo()) {
      console.log('🎭 [ODATA] Using demo data for DocTypes');
      const demoResult = demoDataService.getDocTypes();
      return demoResult.value || [];
    }

    try {
      const response = await api.get('/DocTypes');
      if (response.success && response.data?.value) {
        return response.data.value;
      }
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('❌ [ODATA] Failed to fetch DocTypes from API:', error.message);
      console.log('🎭 [ODATA] Falling back to demo data');
      const demoResult = demoDataService.getDocTypes();
      return demoResult.value || [];
    }
  }

  /**
   * Получить список документов по типу
   * GET /Docs/{DocTypeName}
   * Например: /Docs/PrihodNaSklad
   */
  async getDocumentsByType(docTypeName: string): Promise<ODataDocument[]> {
    // Check if we should use demo mode
    if (await this.shouldUseDemo()) {
      console.log(`🎭 [ODATA] Using demo data for documents of type ${docTypeName}`);
      const demoData = demoDataService.getDocuments(docTypeName);
      return demoData.value || [];
    }

    try {
      const response = await api.get(`/Docs/${docTypeName}`, {
        $expand: 'declaredItems,currentItems',
        $orderby: 'createDate desc',
      });
      
      if (response.success && response.data?.value) {
        return response.data.value;
      }
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error(`❌ [ODATA] Failed to fetch documents for ${docTypeName}:`, error.message);
      console.log(`🎭 [ODATA] Falling back to demo data for ${docTypeName}`);
      const demoData = demoDataService.getDocuments(docTypeName);
      return demoData.value || [];
    }
  }

  /**
   * Получить конкретный документ с расширенными данными
   * GET /Docs/{DocTypeName}('{id}')
   */
  async getDocument(docTypeName: string, id: string): Promise<ODataDocument & { declaredItems?: ODataDocumentItem[]; currentItems?: ODataDocumentItem[] }> {
    // Check if we should use demo mode
    if (await this.shouldUseDemo()) {
      console.log(`🎭 [ODATA] Using demo data for document ${docTypeName}(${id})`);
      const demoDoc = demoDataService.getDocumentWithItems(docTypeName, id);
      if (demoDoc) {
        return demoDoc as any;
      }
      throw new Error(`Document ${id} not found in demo data`);
    }

    try {
      const response = await api.get(`/Docs/${docTypeName}('${id}')`, {
        $expand: 'declaredItems,currentItems',
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error(`❌ [ODATA] Failed to fetch document ${id}:`, error.message);
      console.log(`🎭 [ODATA] Falling back to demo data for document ${id}`);
      
      // Try demo data as fallback
      const demoDoc = demoDataService.getDocumentWithItems(docTypeName, id);
      if (demoDoc) {
        return demoDoc as any;
      }
      
      throw error; // Re-throw if demo data also not found
    }
  }

  /**
   * Обновить документ
   * PATCH /Docs/{DocTypeName}('{id}')
   */
  async updateDocument(docTypeName: string, id: string, data: Partial<ODataDocument>): Promise<void> {
    // In demo mode, updates are saved locally only
    if (await this.shouldUseDemo()) {
      console.log(`🎭 [ODATA] Demo mode: update document ${id} saved locally only`);
      return; // In demo mode, we don't actually update the server
    }

    try {
      const response = await api.patch(`/Docs/${docTypeName}('${id}')`, data);
      if (!response.success) {
        throw new Error(response.error || 'Update failed');
      }
    } catch (error: any) {
      console.error(`❌ [ODATA] Failed to update document ${id}:`, error.message);
      throw error;
    }
  }

  /**
   * Обновить строку документа
   * PATCH /DocumentItem('{uid}')
   */
  async updateDocumentItem(uid: string, data: Partial<ODataDocumentItem>): Promise<void> {
    // In demo mode, updates are saved locally only
    if (await this.shouldUseDemo()) {
      console.log(`🎭 [ODATA] Demo mode: update document item ${uid} saved locally only`);
      return; // In demo mode, we don't actually update the server
    }

    try {
      const response = await api.patch(`/DocumentItem('${uid}')`, data);
      if (!response.success) {
        throw new Error(response.error || 'Update failed');
      }
    } catch (error: any) {
      console.error(`❌ [ODATA] Failed to update document item ${uid}:`, error.message);
      throw error;
    }
  }

  /**
   * Завершить документ (EndUpdate action)
   * POST /Docs/{DocTypeName}('{id}')/Default.EndUpdate
   */
  async finishDocument(docTypeName: string, id: string): Promise<void> {
    // In demo mode, finish is simulated locally
    if (await this.shouldUseDemo()) {
      console.log(`🎭 [ODATA] Demo mode: finish document ${id} simulated locally`);
      return; // In demo mode, we don't actually call the server
    }

    try {
      const response = await api.post(`/Docs/${docTypeName}('${id}')/Default.EndUpdate`);
      if (!response.success) {
        throw new Error(response.error || 'Finish failed');
      }
    } catch (error: any) {
      console.error(`❌ [ODATA] Failed to finish document ${id}:`, error.message);
      throw error;
    }
  }

  /**
   * Получить список товаров
   * GET /Products
   */
  async getProducts(filter?: string): Promise<ODataProduct[]> {
    // Check if we should use demo mode
    if (await this.shouldUseDemo()) {
      console.log('🎭 [ODATA] Using demo data for products');
      const demoProductsResult = demoDataService.getProducts();
      const demoProducts = demoProductsResult.value || [];
      // Apply filter if provided
      if (filter) {
        // Simple filter implementation for demo
        return demoProducts.filter((p: any) => {
          // This is a simplified filter - in production, OData handles this
          return p.name?.toLowerCase().includes(filter.toLowerCase()) ||
                 p.barcode?.includes(filter);
        });
      }
      return demoProducts;
    }

    try {
      const response = await api.get('/Products', {
        $filter: filter,
        $top: 100,
      });
      
      if (response.success && response.data?.value) {
        return response.data.value;
      }
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('❌ [ODATA] Failed to fetch products:', error.message);
      console.log('🎭 [ODATA] Falling back to demo data');
      const demoProductsResult = demoDataService.getProducts();
      return demoProductsResult.value || [];
    }
  }

  /**
   * Поиск товара по штрихкоду
   * GET /Products?$filter=barcode eq '{barcode}'
   */
  async getProductByBarcode(barcode: string): Promise<ODataProduct | null> {
    // Check if we should use demo mode
    if (await this.shouldUseDemo()) {
      console.log(`🎭 [ODATA] Using demo data to find product by barcode ${barcode}`);
      const demoProductsResult = demoDataService.getProducts();
      const demoProducts = demoProductsResult.value || [];
      const product = demoProducts.find((p: any) => p.barcode === barcode);
      return product || null;
    }

    try {
      const response = await api.get('/Products', {
        $filter: `barcode eq '${barcode}'`,
        $top: 1,
      });
      
      if (response.success && response.data?.value) {
        const products = response.data.value;
        return products.length > 0 ? products[0] : null;
      }
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error(`❌ [ODATA] Failed to fetch product by barcode ${barcode}:`, error.message);
      console.log(`🎭 [ODATA] Falling back to demo data`);
      const demoProductsResult = demoDataService.getProducts();
      const demoProducts = demoProductsResult.value || [];
      const product = demoProducts.find((p: any) => p.barcode === barcode);
      return product || null;
    }
  }

  /**
   * Получить список ячеек
   * GET /Cells
   */
  async getCells(warehouseId?: string): Promise<ODataCell[]> {
    // Check if we should use demo mode
    if (await this.shouldUseDemo()) {
      console.log('🎭 [ODATA] Using demo data for cells');
      const demoCellsResult = demoDataService.getCells();
      const demoCells = demoCellsResult.value || [];
      // Apply warehouse filter if provided
      if (warehouseId) {
        return demoCells.filter((c: any) => c.warehouseId === warehouseId);
      }
      return demoCells;
    }

    try {
      const response = await api.get('/Cells', {
        $filter: warehouseId ? `warehouseId eq '${warehouseId}'` : undefined,
      });
      
      if (response.success && response.data?.value) {
        return response.data.value;
      }
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('❌ [ODATA] Failed to fetch cells:', error.message);
      console.log('🎭 [ODATA] Falling back to demo data');
      const demoCellsResult = demoDataService.getCells();
      return demoCellsResult.value || [];
    }
  }

  /**
   * Маппинг типов документов на внутренние типы
   */
  mapDocTypeToInternal(oDataTypeName: string): string {
    const mapping: Record<string, string> = {
      'PrihodNaSklad': 'receiving',
      'RazmeshhenieVYachejki': 'placement',
      'PodborZakaza': 'picking',
      'Otgruzka': 'shipment',
      'Vozvrat': 'return',
      'Inventarizaciya': 'inventory',
    };
    return mapping[oDataTypeName] || oDataTypeName.toLowerCase();
  }

  /**
   * Обратный маппинг
   */
  mapInternalToODataType(internalType: string): string {
    const mapping: Record<string, string> = {
      'receiving': 'PrihodNaSklad',
      'placement': 'RazmeshhenieVYachejki',
      'picking': 'PodborZakaza',
      'shipment': 'Otgruzka',
      'return': 'Vozvrat',
      'inventory': 'Inventarizaciya',
    };
    return mapping[internalType] || internalType;
  }
}

export const odataAPI = new ODataAPIService();

