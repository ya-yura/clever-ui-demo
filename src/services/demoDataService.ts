// === 📁 src/services/demoDataService.ts ===
// Сервис для работы с демо-данными (локальные JSON файлы)

import demoDocTypes from '@/data/demo/doctypes.json';
import demoDocuments from '@/data/demo/documents.json';
import { ODataDocumentType, ODataDocument } from '@/types/odata';

/**
 * Сервис для работы с демо-данными
 * Имитирует работу API сервера, используя локальные JSON файлы
 */
class DemoDataService {
  private docTypes: ODataDocumentType[] = [];
  private documents: Record<string, ODataDocument[]> = {};
  
  constructor() {
    this.loadData();
  }

  /**
   * Загрузить демо-данные из JSON файлов
   */
  private loadData() {
    try {
      // Загрузить типы документов
      if (demoDocTypes && (demoDocTypes as any).value) {
        this.docTypes = (demoDocTypes as any).value as ODataDocumentType[];
        console.log('📦 [DEMO] Загружено типов документов:', this.docTypes.length);
      }

      // Загрузить документы
      if (demoDocuments) {
        this.documents = demoDocuments as any as Record<string, ODataDocument[]>;
        
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
      }
    } catch (error) {
      console.error('❌ [DEMO] Ошибка загрузки демо-данных:', error);
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
   */
  getDocumentById(docId: string, expand?: string[]): { value: ODataDocument[] } | ODataDocument | null {
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
      return null;
    }
    
    // Если запрошен expand, добавить демо-товары
    if (expand && expand.length > 0) {
      // Генерировать демо-товары для демонстрации
      const demoItems = this.generateDemoItems();
      
      if (expand.some(e => e.includes('declaredItems'))) {
        (foundDoc as any).declaredItems = demoItems.map(item => ({
          ...item,
          declaredQuantity: item.quantityPlan,
        }));
      }
      if (expand.some(e => e.includes('currentItems'))) {
        (foundDoc as any).currentItems = demoItems.map((item, index) => ({
          ...item,
          currentQuantity: index < 2 ? item.quantityPlan : Math.floor(item.quantityPlan * 0.7),
          currentQuantityWithBinding: index < 2 ? item.quantityPlan : Math.floor(item.quantityPlan * 0.7),
        }));
      }
      if (expand.some(e => e.includes('combinedItems'))) {
        (foundDoc as any).combinedItems = demoItems.map((item, index) => ({
          ...item,
          declaredQuantity: item.quantityPlan,
          currentQuantity: index < 2 ? item.quantityPlan : Math.floor(item.quantityPlan * 0.7),
          currentQuantityWithBinding: index < 2 ? item.quantityPlan : Math.floor(item.quantityPlan * 0.7),
        }));
      }
    }
    
    return foundDoc;
  }

  /**
   * Генерировать демо-товары для демонстрации
   */
  private generateDemoItems() {
    return [
      {
        uid: 'item-1',
        index: 1,
        productId: 'prod-001',
        productName: 'Ноутбук Dell XPS 15',
        productMarking: 'DELL-XPS15-2024',
        productBarcode: '4607182920012',
        quantityPlan: 10,
        quantityFact: 10,
        firstCellId: 'A-01-01',
        firstStorageBarcode: 'CELL-A0101',
        product: {
          id: 'prod-001',
          name: 'Ноутбук Dell XPS 15',
          marking: 'DELL-XPS15-2024',
          barcode: '4607182920012',
        }
      },
      {
        uid: 'item-2',
        index: 2,
        productId: 'prod-002',
        productName: 'Монитор Samsung 27"',
        productMarking: 'SAM-MON27-2024',
        productBarcode: '8801643578947',
        quantityPlan: 15,
        quantityFact: 15,
        firstCellId: 'A-01-02',
        firstStorageBarcode: 'CELL-A0102',
        product: {
          id: 'prod-002',
          name: 'Монитор Samsung 27"',
          marking: 'SAM-MON27-2024',
          barcode: '8801643578947',
        }
      },
      {
        uid: 'item-3',
        index: 3,
        productId: 'prod-003',
        productName: 'Клавиатура Logitech MX Keys',
        productMarking: 'LOG-MXKEYS-2024',
        productBarcode: '5099206089471',
        quantityPlan: 25,
        quantityFact: 18,
        firstCellId: 'A-02-01',
        firstStorageBarcode: 'CELL-A0201',
        product: {
          id: 'prod-003',
          name: 'Клавиатура Logitech MX Keys',
          marking: 'LOG-MXKEYS-2024',
          barcode: '5099206089471',
        }
      },
      {
        uid: 'item-4',
        index: 4,
        productId: 'prod-004',
        productName: 'Мышь Logitech MX Master 3',
        productMarking: 'LOG-MXMAS3-2024',
        productBarcode: '5099206090477',
        quantityPlan: 20,
        quantityFact: 12,
        firstCellId: 'A-02-02',
        firstStorageBarcode: 'CELL-A0202',
        product: {
          id: 'prod-004',
          name: 'Мышь Logitech MX Master 3',
          marking: 'LOG-MXMAS3-2024',
          barcode: '5099206090477',
        }
      },
      {
        uid: 'item-5',
        index: 5,
        productId: 'prod-005',
        productName: 'Наушники Sony WH-1000XM5',
        productMarking: 'SONY-WH1000XM5',
        productBarcode: '4548736133594',
        quantityPlan: 12,
        quantityFact: 8,
        firstCellId: 'B-01-01',
        firstStorageBarcode: 'CELL-B0101',
        product: {
          id: 'prod-005',
          name: 'Наушники Sony WH-1000XM5',
          marking: 'SONY-WH1000XM5',
          barcode: '4548736133594',
        }
      }
    ];
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

