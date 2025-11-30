// === 📁 src/modules/placement/logic.ts ===
// Business logic for Placement module

import type { PlacementLine, PlacementDocument, CellInfo } from './types';

/**
 * Calculate document completion percentage
 */
export function calculateProgress(doc: PlacementDocument): number {
  if (doc.totalLines === 0) return 0;
  return Math.round((doc.completedLines / doc.totalLines) * 100);
}

/**
 * Check if cell is over capacity
 */
export function isCellOverCapacity(cellInfo: CellInfo): boolean {
  return cellInfo.currentQuantity >= cellInfo.maxCapacity;
}

/**
 * Calculate remaining capacity in cell
 */
export function getRemainingCapacity(cellInfo: CellInfo): number {
  return Math.max(0, cellInfo.maxCapacity - cellInfo.currentQuantity);
}

/**
 * Check if placement is valid for cell
 */
export function canPlaceInCell(
  cellInfo: CellInfo,
  quantity: number,
  allowOverCapacity: boolean = false
): { valid: boolean; reason?: string } {
  if (!allowOverCapacity && cellInfo.currentQuantity + quantity > cellInfo.maxCapacity) {
    return {
      valid: false,
      reason: `Превышение вместимости ячейки (макс: ${cellInfo.maxCapacity})`,
    };
  }
  return { valid: true };
}

/**
 * Get line priority for sorting
 */
export function getLinePriority(line: PlacementLine): number {
  const fact = line.quantityFact;
  const plan = line.quantityPlan;

  // In progress: started but not finished
  if (fact > 0 && fact < plan) return 1;

  // Not started: nothing placed yet
  if (fact === 0) return 2;

  // Completed: placed as planned
  if (fact === plan && fact > 0) return 3;

  return 4; // Fallback
}

/**
 * Sort lines by priority
 */
export function sortLinesByPriority(lines: PlacementLine[]): PlacementLine[] {
  return [...lines].sort((a, b) => {
    const priorityDiff = getLinePriority(a) - getLinePriority(b);

    if (priorityDiff === 0) {
      return a.productName.localeCompare(b.productName);
    }

    return priorityDiff;
  });
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
 * Get document summary statistics
 */
export function getDocumentStats(lines: PlacementLine[]) {
  const totalLines = lines.length;
  const completed = lines.filter(l => l.quantityFact === l.quantityPlan && l.quantityFact > 0).length;
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
export function canCompleteDocument(lines: PlacementLine[]): {
  canComplete: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const stats = getDocumentStats(lines);

  if (stats.notStarted > 0) {
    warnings.push(`${stats.notStarted} позиций не размещено`);
  }

  if (stats.inProgress > 0) {
    warnings.push(`${stats.inProgress} позиций размещено частично`);
  }

  return {
    canComplete: stats.notStarted === 0 && stats.inProgress === 0,
    warnings,
  };
}
