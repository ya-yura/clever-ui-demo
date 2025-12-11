const receiving = require('../src/data/receiving.json');
const picking = require('../src/data/picking.json');
const shipment = require('../src/data/shipment.json');
const inventory = require('../src/data/inventory.json');
const placement = require('../src/data/placement.json');
const returnDoc = require('../src/data/return.json');
const fs = require('fs');
const path = require('path');

// Convert format: {documents: [...], lines: [...]} to OData documents
function convertToOData(data, docTypeName) {
  return data.documents.map(doc => {
    const descParts = [];
    for (const [key, val] of Object.entries(doc)) {
      if (!['id', 'status', 'createdAt', 'updatedAt', 'totalLines', 'completedLines'].includes(key)) {
        descParts.push(`${key}: ${val}`);
      }
    }
    
    return {
      id: doc.id,
      name: doc.id,
      documentTypeName: docTypeName,
      createDate: new Date(doc.createdAt).toISOString(),
      lastChangeDate: new Date(doc.updatedAt).toISOString(),
      finished: doc.status === 'completed',
      inProcess: doc.status === 'in_progress',
      priority: doc.priority === 'urgent' ? 3 : doc.priority === 'high' ? 2 : 1,
      barcode: doc.deliveryNumber || doc.orderNumber || doc.id,
      partnerName: doc.supplier || doc.customer || 'Контрагент',
      userName: 'Демо оператор',
      userId: 'demo-user',
      warehouseId: 'WAREHOUSE-001',
      description: descParts.join(', ')
    };
  });
}

const result = {
  PrihodNaSklad: convertToOData(receiving, 'ПриходНаСклад'),
  PodborZakaza: convertToOData(picking, 'ПодборЗаказа'),
  Otgruzka: convertToOData(shipment, 'Отгрузка'),
  Inventarizaciya: convertToOData(inventory, 'Инвентаризация'),
  RazmeshhenieVYachejki: convertToOData(placement, 'РазмещениеВЯчейки'),
  Vozvrat: convertToOData(returnDoc, 'Возврат')
};

const outputPath = path.join(__dirname, '../src/data/demo/documents.json');
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log('✅ Created demo/documents.json with all data');

// Log statistics
let totalDocs = 0;
for (const [key, docs] of Object.entries(result)) {
  console.log(`   ${key}: ${docs.length} документов`);
  totalDocs += docs.length;
}
console.log(`📊 Всего документов: ${totalDocs}`);

