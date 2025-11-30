// === 📁 src/modules/picking/logic.ts ===
// Business logic for Picking module

import type { PickingLine, PickingDocument, RouteStep, PickingRoute } from './types';

/**
 * Calculate document completion percentage
 */
export function calculateProgress(doc: PickingDocument): number {
  if (doc.totalLines === 0) return 0;
  return Math.round((doc.completedLines / doc.totalLines) * 100);
}

/**
 * Get line priority for sorting
 */
export function getLinePriority(line: PickingLine): number {
  const fact = line.quantityFact;
  const plan = line.quantityPlan;

  // In progress: started but not finished
  if (fact > 0 && fact < plan) return 1;

  // Not started: nothing picked yet
  if (fact === 0) return 2;

  // Completed: picked as planned
  if (fact === plan && fact > 0) return 3;

  return 4;
}

/**
 * Calculate line status based on quantities
 */
export function calculateLineStatus(
  fact: number,
  plan: number
): 'pending' | 'partial' | 'completed' {
  if (fact === 0) return 'pending';
  if (fact >= plan) return 'completed';
  return 'partial';
}

/**
 * Optimize picking route based on cell locations
 * Simple implementation - sorts by cellId
 */
export function optimizeRoute(lines: PickingLine[]): RouteStep[] {
  const sortedLines = [...lines].sort((a, b) => {
    // Sort by cell ID to create logical path
    return (a.cellId || '').localeCompare(b.cellId || '');
  });

  return sortedLines.map((line, index) => ({
    lineId: line.id,
    cellId: line.cellId || '',
    productId: line.productId,
    productName: line.productName,
    quantity: line.quantityPlan,
    order: index + 1,
    completed: line.quantityFact >= line.quantityPlan,
  }));
}

/**
 * Get current picking route for document
 */
export function getPickingRoute(doc: PickingDocument, lines: PickingLine[]): PickingRoute {
  const steps = optimizeRoute(lines);
  const currentStepIndex = steps.findIndex(s => !s.completed);

  return {
    documentId: doc.id,
    steps,
    currentStep: currentStepIndex >= 0 ? currentStepIndex : steps.length,
    totalSteps: steps.length,
  };
}

/**
 * Get next cell to visit
 */
export function getNextCell(route: PickingRoute): RouteStep | null {
  if (route.currentStep >= route.totalSteps) return null;
  return route.steps[route.currentStep];
}

/**
 * Check if picked from correct cell
 */
export function validateCell(scannedCellId: string, expectedCellId: string): boolean {
  return scannedCellId.toLowerCase() === expectedCellId.toLowerCase();
}

/**
 * Check if picked correct product
 */
export function validateProduct(scannedBarcode: string, line: PickingLine): boolean {
  return scannedBarcode === line.barcode || scannedBarcode === line.productSku;
}

/**
 * Check if picked correct quantity
 */
export function validateQuantity(picked: number, required: number): {
  valid: boolean;
  type: 'exact' | 'shortage' | 'surplus';
} {
  if (picked === required) return { valid: true, type: 'exact' };
  if (picked < required) return { valid: false, type: 'shortage' };
  return { valid: false, type: 'surplus' };
}

/**
 * Get document summary statistics
 */
export function getDocumentStats(lines: PickingLine[]) {
  const totalLines = lines.length;
  const completed = lines.filter(l => l.quantityFact >= l.quantityPlan).length;
  const notStarted = lines.filter(l => l.quantityFact === 0).length;
  const inProgress = lines.filter(l => l.quantityFact > 0 && l.quantityFact < l.quantityPlan).length;

  const totalPlan = lines.reduce((sum, l) => sum + l.quantityPlan, 0);
  const totalFact = lines.reduce((sum, l) => sum + l.quantityFact, 0);

  const progress = totalPlan > 0 ? (totalFact / totalPlan) * 100 : 0;

  return {
    totalLines,
    completed,
    notStarted,
    inProgress,
    totalPlan,
    totalFact,
    progress,
  };
}

/**
 * Validate if document can be completed
 */
export function canCompleteDocument(lines: PickingLine[]): {
  canComplete: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const stats = getDocumentStats(lines);

  if (stats.notStarted > 0) {
    warnings.push(`${stats.notStarted} позиций не подобрано`);
  }

  if (stats.inProgress > 0) {
    warnings.push(`${stats.inProgress} позиций подобрано частично`);
  }

  return {
    canComplete: stats.notStarted === 0 && stats.inProgress === 0,
    warnings,
  };
}
