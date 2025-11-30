// === 📁 src/services/demoDataService.ts ===
// Сервис для работы с демо-данными (локальные JSON файлы)

import serverDocTypes from '@/data/demo/server-doctypes.json';
import receivingData from '@/data/demo/receiving.json';
import pickingData from '@/data/demo/picking.json';
import placementData from '@/data/demo/placement.json';
import shipmentData from '@/data/demo/shipment.json';
import returnData from '@/data/demo/return.json';
import inventoryData from '@/data/demo/inventory.json';
import productsData from '@/data/demo/products.json';
import cellsData from '@/data/demo/cells.json';
import employeesData from '@/data/demo/employees.json';
import { ODataDocumentType, ODataDocument } from '@/types/odata';

// Типы для структуры данных модулей
interface ModuleData {
  documents: any[];
  lines: any[];
}

interface Product {
  id: string;
  name: string;
  marking?: string;
  barcode?: string;
}

interface Cell {
  id: string;
  barcode: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
}

/**
 * Сервис для работы с демо-данными
 * Имитирует работу API сервера, используя локальные JSON файлы
 */
class DemoDataService {
  private docTypes: ODataDocumentType[] = [];
  private documents: Record<string, ODataDocument[]> = {};
  private documentLines: Record<string, any[]> = {}; // Строки документов по ID документа
  private products: Map<string, Product> = new Map();
  private cells: Map<string, Cell> = new Map();
  private employees: Map<string, Employee> = new Map();
  
  constructor() {
    this.loadData();
  }

  /**
   * Загрузить демо-данные из JSON файлов
   */
  private loadData() {
    try {
      // Загрузить типы документов
      if (serverDocTypes && Array.isArray(serverDocTypes)) {
        this.docTypes = serverDocTypes as ODataDocumentType[];
        console.log('📦 [DEMO] Загружено типов документов:', this.docTypes.length);
      }

      // Загрузить справочники
      this.loadReferences();

      // Загрузить документы из модулей (используем uni из server-doctypes.json)
      this.loadModuleDocuments('PrihodNaSklad', receivingData as ModuleData);
      this.loadModuleDocuments('Komplektaciya', pickingData as ModuleData);
      this.loadModuleDocuments('RazmeshhenieVYachejki', placementData as ModuleData);
      this.loadModuleDocuments('Otgruzka', shipmentData as ModuleData);
      this.loadModuleDocuments('Vozvrat', returnData as ModuleData);
      this.loadModuleDocuments('Inventarizaciya', inventoryData as ModuleData);

      // Подсчитать общее количество документов
      let totalDocs = 0;
      Object.keys(this.documents).forEach(key => {
        const count = this.documents[key]?.length || 0;
        totalDocs += count;
        if (count > 0) {
          console.log(`📄 [DEMO] ${key}: ${count} документов`);
        }
      });
      
      console.log('📊 [DEMO] Всего документов:', totalDocs);
      console.log('📦 [DEMO] Загружено товаров:', this.products.size);
      console.log('📦 [DEMO] Загружено ячеек:', this.cells.size);
      console.log('📦 [DEMO] Загружено сотрудников:', this.employees.size);
    } catch (error) {
      console.error('❌ [DEMO] Ошибка загрузки демо-данных:', error);
    }
  }

  /**
   * Загрузить справочники
   */
  private loadReferences() {
    // Загрузить товары
    if (Array.isArray(productsData)) {
      productsData.forEach((product: any) => {
        this.products.set(product.id, {
          id: product.id,
          name: product.name,
          marking: product.marking,
          barcode: product.barcode
        });
      });
    }

    // Загрузить ячейки
    if (Array.isArray(cellsData)) {
      cellsData.forEach((cell: any) => {
        this.cells.set(cell.id, {
          id: cell.id,
          barcode: cell.barcode,
          name: cell.name
        });
      });
    }

    // Загрузить сотрудников
    if (Array.isArray(employeesData)) {
      employeesData.forEach((employee: any) => {
        this.employees.set(employee.id, {
          id: employee.id,
          name: employee.name
        });
      });
    }
  }

  /**
   * Загрузить документы из данных модуля
   */
  private loadModuleDocuments(moduleKey: string, moduleData: ModuleData) {
    if (!moduleData || !moduleData.documents) {
      console.warn(`⚠️ [DEMO] Нет данных для модуля ${moduleKey}`);
      return;
    }

    console.log(`🎭 [DEMO] Loading documents for ${moduleKey}`);

    // Загрузить документы
    const documents = moduleData.documents.map((doc: any) => {
      // Преобразовать документ в формат OData
      const oDataDoc: ODataDocument = {
        id: doc.id,
        number: doc.number || doc.id,
        date: doc.date || doc.createdAt,
        status: doc.status,
        docTypeUni: moduleKey,
        ...doc
      };

      return oDataDoc;
    });

    this.documents[moduleKey] = documents;

    // Загрузить строки документов
    if (moduleData.lines && Array.isArray(moduleData.lines)) {
      moduleData.lines.forEach((line: any) => {
        const docId = line.documentId;
        if (!this.documentLines[docId]) {
          this.documentLines[docId] = [];
        }
        this.documentLines[docId].push(line);
      });
    }
  }

  /**
   * Получить все типы документов
   */
  getDocTypes(): { value: ODataDocumentType[] } {
    return {
      value: this.docTypes
    };
  }

  /**
   * Получить документы по типу
   */
  getDocuments(docTypeUni: string): { value: ODataDocument[] } {
    const docs = this.documents[docTypeUni] || [];
    return {
      value: docs
    };
  }

  /**
   * Получить количество документов по типу
   */
  getDocumentsCount(docTypeUni: string): number {
    return this.documents[docTypeUni]?.length || 0;
  }

  /**
   * Получить документ по ID с расширенными данными
   * Возвращает в OData формате для совместимости с API
   */
  getDocumentById(docId: string, expand?: string[]): { success: boolean; data: ODataDocument } | null {
    // Найти документ во всех типах
    let foundDoc: ODataDocument | null = null;
    
    for (const key in this.documents) {
      const docs = this.documents[key] || [];
      const doc = docs.find(d => d.id === docId);
      if (doc) {
        foundDoc = { ...doc };
        break;
      }
    }
    
    if (!foundDoc) {
      console.warn(`⚠️ [DEMO] Document not found: ${docId}`);
      return null;
    }
    
    console.log(`📄 [DEMO] Found document ${docId}, expanding fields:`, expand);
    
    // Если запрошен expand, добавить реальные строки документа
    if (expand && expand.length > 0) {
      const lines = this.documentLines[docId] || [];
      console.log(`📋 [DEMO] Found ${lines.length} lines for document ${docId}`);
      
      // Обогатить строки данными о товарах
      const enrichedLines = lines.map((line: any, index: number) => {
        const product = this.products.get(line.productId);
        const cell = line.cellId ? this.cells.get(line.cellId) : null;
        
        return {
          uid: line.id || `line-${index}`,
          index: index + 1,
          productId: line.productId,
          productName: product?.name || line.productName || 'Неизвестный товар',
          productMarking: product?.marking || line.productMarking || '',
          productBarcode: product?.barcode || line.productBarcode || '',
          quantityPlan: line.quantityPlan || line.quantity || 0,
          quantityFact: line.quantityFact || line.quantity || 0,
          declaredQuantity: line.quantityPlan || line.quantity || 0,
          currentQuantity: line.quantityFact || line.quantity || 0,
          currentQuantityWithBinding: line.quantityFact || line.quantity || 0,
          firstCellId: line.cellId || cell?.id || '',
          firstStorageBarcode: cell?.barcode || '',
          product: product ? {
            id: product.id,
            name: product.name,
            marking: product.marking || '',
            barcode: product.barcode || '',
          } : null,
          ...line
        };
      });

      // Добавить expand поля
      if (expand.some(e => e.includes('declaredItems'))) {
        (foundDoc as any).declaredItems = enrichedLines;
      }
      if (expand.some(e => e.includes('currentItems'))) {
        (foundDoc as any).currentItems = enrichedLines;
      }
      if (expand.some(e => e.includes('combinedItems'))) {
        (foundDoc as any).combinedItems = enrichedLines;
      }
    }
    
    // Возвращаем в формате ApiResponse для совместимости
    return {
      success: true,
      data: foundDoc
    };
  }

  /**
   * Получить справочники для использования в других сервисах
   */
  getReferences() {
    return {
      products: Array.from(this.products.values()),
      cells: Array.from(this.cells.values()),
      employees: Array.from(this.employees.values())
    };
  }

  /**
   * Получить все документы (для страницы Documents)
   */
  getAllDocuments(): ODataDocument[] {
    const allDocs: ODataDocument[] = [];
    
    Object.keys(this.documents).forEach(key => {
      const docs = this.documents[key] || [];
      allDocs.push(...docs);
    });
    
    return allDocs;
  }

  /**
   * Проверить, доступны ли демо-данные
   */
  isAvailable(): boolean {
    return this.docTypes.length > 0;
  }

  /**
   * Получить статистику по демо-данным
   */
  getStats() {
    const stats = {
      docTypesCount: this.docTypes.length,
      totalDocuments: 0,
      byType: {} as Record<string, number>
    };

    Object.keys(this.documents).forEach(key => {
      const count = this.documents[key]?.length || 0;
      stats.byType[key] = count;
      stats.totalDocuments += count;
    });

    return stats;
  }
}

// Singleton instance
export const demoDataService = new DemoDataService();

