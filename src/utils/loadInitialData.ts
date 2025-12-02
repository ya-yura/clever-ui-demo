// @ts-nocheck
// === 📁 src/utils/loadInitialData.ts ===
// Load initial data from JSON files to IndexedDB

import { db } from '@/services/db';

const DATA_LOADED_KEY = 'initial_data_loaded';
const DEMO_DATA_LOADED_KEY = 'demo_data_loaded';

export const loadInitialData = async () => {
  // Check if data already loaded
  const dataLoaded = localStorage.getItem(DATA_LOADED_KEY);
  if (dataLoaded === 'true') {
    console.log('✅ Initial data already loaded');
    return;
  }

  try {
    console.log('🔄 Loading initial data from JSON files...');

    // Check if IndexedDB is available
    if (!db.isOpen()) {
      await db.open();
    }

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

// Load demo data from demo folder
export const loadDemoData = async () => {
  // Check if demo data already loaded
  const demoDataLoaded = localStorage.getItem(DEMO_DATA_LOADED_KEY);
  if (demoDataLoaded === 'true') {
    console.log('✅ Demo data already loaded');
    return;
  }

  try {
    console.log('🔄 Loading demo data from JSON files...');

    // Check if IndexedDB is available
    if (!db.isOpen()) {
      await db.open();
    }

    // Clear existing data first
    await resetData();

    // Load Products
    const productsData = await import('@/data/demo/products.json');
    await db.products.bulkAdd(productsData.default);
    console.log('✅ Products loaded:', productsData.default.length);

    // Load Cells
    const cellsData = await import('@/data/demo/cells.json');
    await db.cells.bulkAdd(cellsData.default);
    console.log('✅ Cells loaded:', cellsData.default.length);

    // Load Employees
    const employeesData = await import('@/data/demo/employees.json');
    await db.employees.bulkAdd(employeesData.default as any);
    console.log('✅ Employees loaded:', employeesData.default.length);

    // Load Receiving data
    const receivingData = await import('@/data/demo/receiving.json');
    await db.receivingDocuments.bulkPut(receivingData.default.documents);
    await db.receivingLines.bulkPut(receivingData.default.lines);
    console.log('✅ Receiving data loaded:', receivingData.default.documents.length, 'documents');

    // Load Placement data
    const placementData = await import('@/data/demo/placement.json');
    await db.placementDocuments.bulkPut(placementData.default.documents);
    await db.placementLines.bulkPut(placementData.default.lines);
    console.log('✅ Placement data loaded:', placementData.default.documents.length, 'documents');

    // Load Picking data
    const pickingData = await import('@/data/demo/picking.json');
    await db.pickingDocuments.bulkPut(pickingData.default.documents);
    await db.pickingLines.bulkPut(pickingData.default.lines);
    console.log('✅ Picking data loaded:', pickingData.default.documents.length, 'documents');

    // Load Shipment data
    const shipmentData = await import('@/data/demo/shipment.json');
    await db.shipmentDocuments.bulkPut(shipmentData.default.documents);
    await db.shipmentLines.bulkPut(shipmentData.default.lines);
    console.log('✅ Shipment data loaded:', shipmentData.default.documents.length, 'documents');

    // Load Return data
    const returnData = await import('@/data/demo/return.json');
    await db.returnDocuments.bulkPut(returnData.default.documents);
    await db.returnLines.bulkPut(returnData.default.lines);
    console.log('✅ Return data loaded:', returnData.default.documents.length, 'documents');

    // Load Inventory data
    const inventoryData = await import('@/data/demo/inventory.json');
    await db.inventoryDocuments.bulkPut(inventoryData.default.documents);
    await db.inventoryLines.bulkPut(inventoryData.default.lines);
    console.log('✅ Inventory data loaded:', inventoryData.default.documents.length, 'documents');

    // Mark as loaded
    localStorage.setItem(DEMO_DATA_LOADED_KEY, 'true');
    console.log('🎉 All demo data loaded successfully!');
  } catch (error) {
    console.error('❌ Error loading demo data:', error);
    console.error('Details:', error);
  }
};

// Function to reset data (for development)
export const resetData = async () => {
  try {
    // Check if IndexedDB is available
    if (!db.isOpen()) {
      await db.open();
    }

    await db.products.clear();
    await db.cells.clear();
    await db.employees.clear();
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
    localStorage.removeItem(DEMO_DATA_LOADED_KEY);
    console.log('✅ All data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};

