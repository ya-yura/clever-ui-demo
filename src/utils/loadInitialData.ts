// @ts-nocheck
// === 📁 src/utils/loadInitialData.ts ===
// Load initial data from JSON files to IndexedDB

import { db } from '@/services/db';

const DATA_LOADED_KEY = 'initial_data_loaded';

export const loadInitialData = async () => {
  // Check if data already loaded
  const dataLoaded = localStorage.getItem(DATA_LOADED_KEY);
  if (dataLoaded === 'true') {
    console.log('✅ Initial data already loaded');
    return;
  }

  try {
    console.log('🔄 Loading initial data from JSON files...');

    // Load Employees data
    const employeesData = await import('@/data/employees.json');
    await db.employees.bulkAdd(employeesData.default);
    console.log('✅ Employees loaded:', employeesData.default.length);

    // Load Receiving data
    const receivingData = await import('@/data/receiving.json');
    await db.receivingDocuments.bulkPut(receivingData.default.documents);
    await db.receivingLines.bulkPut(receivingData.default.lines);
    console.log('✅ Receiving data loaded:', receivingData.default.documents.length, 'documents');

    // Load Placement data
    const placementData = await import('@/data/placement.json');
    await db.placementDocuments.bulkPut(placementData.default.documents);
    await db.placementLines.bulkPut(placementData.default.lines);
    console.log('✅ Placement data loaded:', placementData.default.documents.length, 'documents');

    // Load Picking data
    const pickingData = await import('@/data/picking.json');
    await db.pickingDocuments.bulkPut(pickingData.default.documents);
    await db.pickingLines.bulkPut(pickingData.default.lines);
    console.log('✅ Picking data loaded:', pickingData.default.documents.length, 'documents');

    // Load Shipment data
    const shipmentData = await import('@/data/shipment.json');
    await db.shipmentDocuments.bulkPut(shipmentData.default.documents);
    await db.shipmentLines.bulkPut(shipmentData.default.lines);
    console.log('✅ Shipment data loaded:', shipmentData.default.documents.length, 'documents');

    // Load Return data
    const returnData = await import('@/data/return.json');
    await db.returnDocuments.bulkPut(returnData.default.documents);
    await db.returnLines.bulkPut(returnData.default.lines);
    console.log('✅ Return data loaded:', returnData.default.documents.length, 'documents');

    // Load Inventory data
    const inventoryData = await import('@/data/inventory.json');
    await db.inventoryDocuments.bulkPut(inventoryData.default.documents);
    await db.inventoryLines.bulkPut(inventoryData.default.lines);
    console.log('✅ Inventory data loaded:', inventoryData.default.documents.length, 'documents');

    // Mark as loaded
    localStorage.setItem(DATA_LOADED_KEY, 'true');
    console.log('🎉 All initial data loaded successfully!');
    console.log('📊 Total: 27 documents, 278 lines');
  } catch (error) {
    console.error('❌ Error loading initial data:', error);
    console.error('Details:', error);
    // Don't mark as loaded if there was an error
  }
};

// Function to reset data (for development)
export const resetData = async () => {
  try {
    await db.receivingDocuments.clear();
    await db.receivingLines.clear();
    await db.placementDocuments.clear();
    await db.placementLines.clear();
    await db.pickingDocuments.clear();
    await db.pickingLines.clear();
    await db.shipmentDocuments.clear();
    await db.shipmentLines.clear();
    await db.returnDocuments.clear();
    await db.returnLines.clear();
    await db.inventoryDocuments.clear();
    await db.inventoryLines.clear();
    
    localStorage.removeItem(DATA_LOADED_KEY);
    console.log('✅ All data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

