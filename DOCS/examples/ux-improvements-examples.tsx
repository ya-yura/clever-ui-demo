// === 📁 examples/ux-improvements-examples.tsx ===
// Practical examples of new UX improvements

import React, { useState, useEffect } from 'react';
import { DocumentList } from '@/components/documents/DocumentList';
import { ProductCard } from '@/components/common/ProductCard';
import { Breadcrumbs, useBreadcrumbs } from '@/components/common/Breadcrumbs';
import { ScanningScreen } from '@/components/scanning/ScanningScreen';
import { PartnerSelection } from '@/components/team/PartnerSelection';
import {
  validateProductScan,
  validateCellScan,
  validateDocumentCompletion,
  showError,
  AutoSaveManager,
} from '@/utils/errorPrevention';
import { teamStats } from '@/utils/teamStats';
import { usePinnedDocuments } from '@/hooks/usePinnedDocuments';

// =============================================================================
// EXAMPLE 1: Grouped Document List with Pinning
// =============================================================================

export const GroupedDocumentsExample = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load documents from API or IndexedDB
    loadDocuments().then(docs => {
      setDocuments(docs);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h1>Мои документы</h1>
      
      {/* Documents automatically grouped by date */}
      <DocumentList
        documents={documents}
        loading={loading}
        groupByDate={true}  // Default: true
      />
    </div>
  );
};

// =============================================================================
// EXAMPLE 2: Product Cards with Swipe Actions
// =============================================================================

export const ProductCardsExample = () => {
  const [products, setProducts] = useState([
    {
      id: '1',
      name: 'Молоко "Простоквашино" 3.2%',
      sku: 'MILK-001',
      barcode: '4607012291234',
      imageUrl: '/images/milk.jpg',
      plannedQuantity: 10,
      actualQuantity: 7,
      status: 'in_progress' as const,
      unit: 'шт',
    },
    {
      id: '2',
      name: 'Хлеб Бородинский',
      sku: 'BREAD-005',
      barcode: '4601234567890',
      plannedQuantity: 20,
      actualQuantity: 20,
      status: 'completed' as const,
      unit: 'шт',
    },
  ]);

  const handleIncrement = (productId: string) => {
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? { ...p, actualQuantity: p.actualQuantity + 1 }
        : p
    ));
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleDecrement = (productId: string) => {
    setProducts(prev => prev.map(p =>
      p.id === productId && p.actualQuantity > 0
        ? { ...p, actualQuantity: p.actualQuantity - 1 }
        : p
    ));
  };

  const handleManualInput = (productId: string) => {
    const product = products.find(p => p.id === productId);
    const quantity = prompt(`Введите количество для "${product?.name}":`);
    
    if (quantity && !isNaN(Number(quantity))) {
      setProducts(prev => prev.map(p =>
        p.id === productId
          ? { ...p, actualQuantity: Number(quantity) }
          : p
      ));
    }
  };

  return (
    <div className="space-y-3 p-4">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => console.log('Open details:', product.id)}
          onIncrement={() => handleIncrement(product.id)}
          onDecrement={() => handleDecrement(product.id)}
          onLongPress={() => handleManualInput(product.id)}
          showImage={true}
          compact={false}
        />
      ))}
    </div>
  );
};

// =============================================================================
// EXAMPLE 3: Scanning Screen with Error Prevention
// =============================================================================

export const ScanningScreenExample = () => {
  const [currentProduct, setCurrentProduct] = useState({
    name: 'Молоко "Простоквашино" 3.2%',
    sku: 'MILK-001',
  });
  const [completedItems, setCompletedItems] = useState(75);
  const [lastScanResult, setLastScanResult] = useState<any>(null);

  const handleScan = (code: string) => {
    // Validate scan
    const validation = validateProductScan(code, documentProducts);
    
    if (!validation.valid) {
      // Show error with multi-modal feedback
      const error = showError('PRODUCT_NOT_IN_DOCUMENT', {
        enableVibration: true,
        enableSound: true,
        enableVoice: true,
      });
      
      setLastScanResult({
        success: false,
        message: error.message,
        timestamp: Date.now(),
      });
      
      return;
    }
    
    // Success
    setLastScanResult({
      success: true,
      message: 'Товар отсканирован',
      timestamp: Date.now(),
    });
    
    setCompletedItems(prev => prev + 1);
  };

  return (
    <ScanningScreen
      documentType="receiving"
      documentNumber="RCV-1120"
      currentProduct={currentProduct}
      totalItems={100}
      completedItems={completedItems}
      isOnline={navigator.onLine}
      hint="Сканируйте следующий товар"
      lastScanResult={lastScanResult}
      onManualInput={() => console.log('Manual input')}
      onCameraInput={() => console.log('Camera scan')}
      onScan={handleScan}
    />
  );
};

// =============================================================================
// EXAMPLE 4: Breadcrumbs Navigation
// =============================================================================

export const BreadcrumbsExample = () => {
  // Auto-generate breadcrumbs
  const breadcrumbs = useBreadcrumbs([
    { label: 'Приёмка', path: '/receiving' },
    { label: 'RCV-1120', path: '/receiving/1120' },
    { label: 'Сканирование' }, // Current page
  ]);

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} className="sticky top-14 z-20" />
      
      <div className="p-4">
        <h1>Страница сканирования</h1>
        {/* Content */}
      </div>
    </div>
  );
};

// =============================================================================
// EXAMPLE 5: Partner Selection with Stats
// =============================================================================

export const PartnerSelectionExample = () => {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>();
  const [lastPartnerId] = useState(localStorage.getItem('lastPartnerId') || undefined);

  // Mock data - replace with real data from API/IndexedDB
  const partners = [
    {
      id: '1',
      name: 'Иванов Иван',
      role: 'Кладовщик',
      department: 'Склад А',
      isOnline: true,
      lastActiveAt: Date.now(),
      stats: {
        tasksCompleted: 45,
        averageTime: 12,
        errorRate: 2.1,
        trend: 'up' as const,
      },
    },
    {
      id: '2',
      name: 'Петров Пётр',
      role: 'Комплектовщик',
      department: 'Склад Б',
      isOnline: false,
      lastActiveAt: Date.now() - 3600000, // 1 hour ago
      stats: {
        tasksCompleted: 38,
        averageTime: 15,
        errorRate: 3.5,
        trend: 'stable' as const,
      },
    },
  ];

  const handleSelect = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    localStorage.setItem('lastPartnerId', partnerId);
    
    console.log('Selected partner:', partnerId);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Выберите напарника</h1>
      
      <PartnerSelection
        partners={partners}
        selectedPartnerId={selectedPartnerId}
        lastPartnerId={lastPartnerId}
        onSelect={handleSelect}
        showStats={true}
      />
    </div>
  );
};

// =============================================================================
// EXAMPLE 6: Auto-Save with Error Prevention
// =============================================================================

export const AutoSaveExample = () => {
  const [document, setDocument] = useState({ id: '1', data: {} });
  const [autoSave, setAutoSave] = useState<AutoSaveManager | null>(null);

  useEffect(() => {
    // Create auto-save manager
    const saveFunction = async () => {
      console.log('Auto-saving document...');
      await fetch('/api/documents/' + document.id, {
        method: 'PUT',
        body: JSON.stringify(document),
      });
      console.log('✓ Document saved');
    };

    const manager = new AutoSaveManager(saveFunction, 30000); // 30 sec
    manager.start();
    setAutoSave(manager);

    return () => manager.stop();
  }, [document.id]);

  const handleExit = async () => {
    if (autoSave) {
      const saved = await autoSave.saveNow();
      if (saved) {
        console.log('Document saved, exiting...');
      }
    }
  };

  return (
    <div>
      <div>Last save: {autoSave?.getTimeSinceLastSave()} ms ago</div>
      <button onClick={handleExit}>Save and Exit</button>
    </div>
  );
};

// =============================================================================
// EXAMPLE 7: Team Statistics Recording
// =============================================================================

export const TeamStatsExample = () => {
  const [operationStartTime] = useState(Date.now());
  const [errorsCount, setErrorsCount] = useState(0);

  const handleComplete = async () => {
    // Record operation statistics
    await teamStats.recordOperation({
      userId: 'user-123',
      partnerId: 'user-456', // Optional
      operationType: 'receiving',
      documentId: 'DOC-1120',
      startTime: operationStartTime,
      endTime: Date.now(),
      duration: Date.now() - operationStartTime,
      itemsProcessed: 50,
      errorsCount: errorsCount,
    });

    console.log('✓ Statistics recorded');
  };

  // Get user stats
  const userStats = teamStats.getUserStats('user-123');

  // Get team comparison
  const teamComparison = teamStats.getTeamComparison();

  return (
    <div className="p-4">
      <h2>Your Stats</h2>
      {userStats && (
        <div>
          <div>Tasks: {userStats.totalOperations}</div>
          <div>Avg Time: {userStats.averageTime} min</div>
          <div>Error Rate: {userStats.errorRate}%</div>
          <div>Trend: {userStats.trend}</div>
        </div>
      )}

      <h2>Team Comparison</h2>
      <div>Average Time: {teamComparison.averageTime} min</div>
      <div>Average Error Rate: {teamComparison.averageErrorRate}%</div>

      <button onClick={handleComplete}>Complete Task</button>
    </div>
  );
};

// =============================================================================
// EXAMPLE 8: Complete Receiving Module with All Features
// =============================================================================

export const CompleteReceivingExample = () => {
  const [mode, setMode] = useState<'list' | 'scan'>('list');
  const [document, setDocument] = useState<any>({
    id: '1',
    number: 'RCV-1120',
    type: 'receiving',
    lines: [],
  });
  const [autoSave, setAutoSave] = useState<AutoSaveManager | null>(null);
  
  // Breadcrumbs
  const breadcrumbs = useBreadcrumbs([
    { label: 'Приёмка', path: '/receiving' },
    { label: document.number, path: `/receiving/${document.id}` },
    { label: mode === 'scan' ? 'Сканирование' : 'Список' },
  ]);

  // Auto-save setup
  useEffect(() => {
    const saveDoc = async () => {
      console.log('Saving document...');
      // Save to API/IndexedDB
    };

    const manager = new AutoSaveManager(saveDoc, 30000);
    manager.start();
    setAutoSave(manager);

    return () => manager.stop();
  }, []);

  // Handle scan with validation
  const handleScan = (code: string) => {
    const validation = validateProductScan(code, document.lines);
    
    if (!validation.valid) {
      showError('PRODUCT_NOT_IN_DOCUMENT');
      return;
    }

    // Update quantity
    setDocument(prev => ({
      ...prev,
      lines: prev.lines.map((line: any) =>
        line.barcode === code
          ? { ...line, actualQuantity: line.actualQuantity + 1 }
          : line
      ),
    }));
  };

  // Handle complete with validation
  const handleComplete = async () => {
    const validation = validateDocumentCompletion(document.lines);
    
    if (!validation.valid) {
      showError('INCOMPLETE_DOCUMENT');
      alert(validation.error);
      return;
    }

    // Record stats
    await teamStats.recordOperation({
      userId: 'user-123',
      operationType: 'receiving',
      documentId: document.id,
      startTime: document.startTime,
      endTime: Date.now(),
      duration: Date.now() - document.startTime,
      itemsProcessed: document.lines.length,
      errorsCount: 0,
    });

    // Save and complete
    await autoSave?.saveNow();
    console.log('Document completed!');
  };

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} className="sticky top-14 z-20 bg-surface-primary" />

      {/* Mode Toggle */}
      <div className="p-4 flex gap-2">
        <button
          onClick={() => setMode('list')}
          className={mode === 'list' ? 'btn-primary' : 'btn-secondary'}
        >
          Список
        </button>
        <button
          onClick={() => setMode('scan')}
          className={mode === 'scan' ? 'btn-primary' : 'btn-secondary'}
        >
          Сканирование
        </button>
      </div>

      {/* Content */}
      {mode === 'scan' ? (
        <ScanningScreen
          documentType="receiving"
          documentNumber={document.number}
          currentProduct={document.lines[0]}
          totalItems={document.lines.length}
          completedItems={document.lines.filter((l: any) => l.status === 'completed').length}
          isOnline={navigator.onLine}
          hint="Сканируйте товар"
          onManualInput={() => {}}
          onCameraInput={() => {}}
          onScan={handleScan}
        />
      ) : (
        <div className="p-4 space-y-3">
          {document.lines.map((line: any) => (
            <ProductCard
              key={line.id}
              product={line}
              onIncrement={() => {}}
              onDecrement={() => {}}
              onLongPress={() => {}}
            />
          ))}
        </div>
      )}

      {/* Complete Button */}
      <div className="p-4">
        <button
          onClick={handleComplete}
          className="w-full py-3 bg-success text-white rounded-lg font-semibold"
        >
          Завершить приёмку
        </button>
      </div>
    </div>
  );
};

// Export all examples
export default {
  GroupedDocumentsExample,
  ProductCardsExample,
  ScanningScreenExample,
  BreadcrumbsExample,
  PartnerSelectionExample,
  AutoSaveExample,
  TeamStatsExample,
  CompleteReceivingExample,
};

