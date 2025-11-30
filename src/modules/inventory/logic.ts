// === 📁 src/modules/inventory/logic.ts ===
// Business logic for Inventory module

import type { InventoryLine, InventoryDocument, DiscrepancyReport } from './types';

/**
 * Calculate document completion percentage
 */
export function calculateProgress(doc: InventoryDocument): number {
  if (doc.totalLines === 0) return 0;
  return Math.round((doc.completedLines / doc.totalLines) * 100);
}

/**
 * Calculate line status based on quantities
 */
export function calculateLineStatus(
  actual: number,
  system: number
): 'pending' | 'completed' | 'error' {
  if (actual === 0) return 'pending';
  if (actual === system) return 'completed';
  return 'error';
}

/**
 * Check if line has discrepancy
 */
export function hasDiscrepancy(line: InventoryLine): boolean {
  return line.discrepancy !== 0;
}

/**
 * Get discrepancy type
 */
export function getDiscrepancyType(line: InventoryLine): 'shortage' | 'surplus' | 'exact' {
  if (line.discrepancy < 0) return 'shortage';
  if (line.discrepancy > 0) return 'surplus';
  return 'exact';
}

/**
 * Get line priority for sorting
 * Lower number = higher priority
 * Order: In Progress (with discrepancy) (1) -> Errors (discrepancy) (2) -> Not Counted (3) -> Completed (exact) (4)
 */
export function getLinePriority(line: InventoryLine): number {
  const counted = line.quantityFact > 0;
  const hasDisc = hasDiscrepancy(line);

  // In progress with discrepancy - being counted but has issues - HIGHEST PRIORITY (выполняется сейчас с ошибками)
  if (counted && hasDisc) return 1;

  // Discrepancies - ERRORS (с ошибками)
  if (hasDisc && counted) return 2;
  
  // Not counted yet (предстоит сделать)
  if (!counted) return 3;
  
  // Exact matches - completed - LOWEST PRIORITY (уже сделано)
  if (counted && !hasDisc) return 4;
  
  return 5;
}

/**
 * Sort lines by priority
 */
export function sortLinesByPriority(lines: InventoryLine[]): InventoryLine[] {
  return [...lines].sort((a, b) => {
    const priorityDiff = getLinePriority(a) - getLinePriority(b);

    if (priorityDiff === 0) {
      return a.cellId.localeCompare(b.cellId);
    }

    return priorityDiff;
  });
}

/**
 * Get document summary statistics
 */
export function getDocumentStats(lines: InventoryLine[]) {
  const totalLines = lines.length;
  const exactMatches = lines.filter(l => l.discrepancy === 0 && l.quantityFact > 0).length;
  const withShortage = lines.filter(l => l.discrepancy < 0).length;
  const withSurplus = lines.filter(l => l.discrepancy > 0).length;
  const notCounted = lines.filter(l => l.quantityFact === 0).length;

  const totalSystem = lines.reduce((sum, l) => sum + l.quantitySystem, 0);
  const totalActual = lines.reduce((sum, l) => sum + l.quantityFact, 0);
  const totalDiff = totalActual - totalSystem;

  const progress = totalLines > 0 ? (lines.filter(l => l.quantityFact > 0).length / totalLines) * 100 : 0;

  return {
    totalLines,
    exactMatches,
    withShortage,
    withSurplus,
    notCounted,
    totalSystem,
    totalActual,
    totalDiff,
    progress,
  };
}

/**
 * Generate discrepancy report
 */
export function generateDiscrepancyReport(
  documentId: string,
  lines: InventoryLine[]
): DiscrepancyReport {
  const stats = getDocumentStats(lines);

  const shortages = lines
    .filter(l => l.discrepancy < 0)
    .map(l => ({
      productName: l.productName,
      cellId: l.cellId,
      expected: l.quantitySystem,
      actual: l.quantityFact,
      difference: l.discrepancy,
    }));

  const surpluses = lines
    .filter(l => l.discrepancy > 0)
    .map(l => ({
      productName: l.productName,
      cellId: l.cellId,
      expected: l.quantitySystem,
      actual: l.quantityFact,
      difference: l.discrepancy,
    }));

  return {
    documentId,
    totalLines: stats.totalLines,
    exactMatches: stats.exactMatches,
    shortages,
    surpluses,
    unknownItems: [], // Will be populated when scanning unknown items
  };
}

/**
 * Validate if document can be completed
 */
export function canCompleteDocument(lines: InventoryLine[]): {
  canComplete: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const stats = getDocumentStats(lines);

  if (stats.notCounted > 0) {
    warnings.push(`${stats.notCounted} позиций не пересчитано`);
  }

  if (stats.withShortage > 0) {
    warnings.push(`${stats.withShortage} позиций с недостачей`);
  }

  if (stats.withSurplus > 0) {
    warnings.push(`${stats.withSurplus} позиций с излишками`);
  }

  return {
    canComplete: stats.notCounted === 0,
    warnings,
  };
}
