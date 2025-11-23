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
   * Получить документ по ID
   */
  getDocumentById(docTypeUni: string, docId: string): ODataDocument | null {
    const docs = this.documents[docTypeUni] || [];
    return docs.find(doc => doc.id === docId) || null;
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

