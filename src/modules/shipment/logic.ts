// === 📁 src/modules/shipment/logic.ts ===
// Business logic for Shipment module

import type { ShipmentLine, ShipmentDocument } from './types';

/**
 * Calculate document completion percentage
 */
export function calculateProgress(doc: ShipmentDocument): number {
  if (doc.totalLines === 0) return 0;
  return Math.round((doc.completedLines / doc.totalLines) * 100);
}

/**
 * Get line priority for sorting
 * Lower number = higher priority
 * Order: In Progress (1) -> Over-shipped/Error (2) -> Not Started (3) -> Completed (4)
 */
export function getLinePriority(line: ShipmentLine): number {
  const fact = line.quantityFact;
  const plan = line.quantityPlan;

  // In progress: started but not finished - HIGHEST PRIORITY (выполняется сейчас)
  if (fact > 0 && fact < plan) return 1;

  // Over-shipped: sent more than planned - ERRORS (с ошибками)
  if (fact > plan) return 2;

  // Not started: nothing shipped yet (предстоит сделать)
  if (fact === 0) return 3;

  // Completed: shipped as planned - LOWEST PRIORITY (уже сделано)
  if (fact === plan && fact > 0) return 4;

  return 5;
}

/**
 * Calculate line status based on quantities
 */
export function calculateLineStatus(
  fact: number,
  plan: number
): 'pending' | 'partial' | 'completed' | 'error' {
  if (fact === 0) return 'pending';
  if (fact > plan) return 'error';
  if (fact >= plan) return 'completed';
  return 'partial';
}

/**
 * Check if line has discrepancy
 */
export function hasDiscrepancy(line: ShipmentLine): boolean {
  return line.quantityFact !== line.quantityPlan;
}

/**
 * Get line discrepancy type
 */
export function getDiscrepancyType(line: ShipmentLine): 'shortage' | 'surplus' | 'exact' {
  const diff = line.quantityFact - line.quantityPlan;
  if (diff < 0) return 'shortage';
  if (diff > 0) return 'surplus';
  return 'exact';
}

/**
 * Sort lines by priority
 */
export function sortLinesByPriority(lines: ShipmentLine[]): ShipmentLine[] {
  return [...lines].sort((a, b) => {
    const priorityDiff = getLinePriority(a) - getLinePriority(b);

    if (priorityDiff === 0) {
      return a.productName.localeCompare(b.productName);
    }

    return priorityDiff;
  });
}

/**
 * Get document summary statistics
 */
export function getDocumentStats(lines: ShipmentLine[]) {
  const totalLines = lines.length;
  const completedExact = lines.filter(l => l.quantityFact === l.quantityPlan && l.quantityFact > 0).length;
  const withShortage = lines.filter(l => l.quantityFact < l.quantityPlan).length;
  const withOvership = lines.filter(l => l.quantityFact > l.quantityPlan).length;
  const notStarted = lines.filter(l => l.quantityFact === 0).length;

  const totalPlan = lines.reduce((sum, l) => sum + l.quantityPlan, 0);
  const totalFact = lines.reduce((sum, l) => sum + l.quantityFact, 0);
  const totalDiff = totalFact - totalPlan;

  const progress = totalPlan > 0 ? (totalFact / totalPlan) * 100 : 0;

  return {
    totalLines,
    completedExact,
    withShortage,
    withOvership,
    notStarted,
    totalPlan,
    totalFact,
    totalDiff,
    progress,
  };
}

/**
 * Validate if document can be completed
 */
export function canCompleteDocument(lines: ShipmentLine[]): {
  canComplete: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const stats = getDocumentStats(lines);

  if (stats.notStarted > 0) {
    warnings.push(`${stats.notStarted} позиций не отгружено`);
  }

  if (stats.withShortage > 0) {
    warnings.push(`${stats.withShortage} позиций с недостачей`);
  }

  if (stats.withOvership > 0) {
    warnings.push(`${stats.withOvership} позиций с излишками`);
  }

  return {
    canComplete: true, // Can always complete, but with warnings
    warnings,
  };
}
