// === 📁 src/modules/receiving/logic.ts ===
// Business logic for Receiving module

import type { ReceivingLine, ReceivingDocument } from './types';

/**
 * Calculate document completion percentage
 */
export function calculateProgress(doc: ReceivingDocument): number {
  if (doc.totalLines === 0) return 0;
  return Math.round((doc.completedLines / doc.totalLines) * 100);
}

/**
 * Check if line has discrepancy
 */
export function hasDiscrepancy(line: ReceivingLine): boolean {
  return line.quantityFact !== line.quantityPlan;
}

/**
 * Get line discrepancy type
 */
export function getDiscrepancyType(line: ReceivingLine): 'shortage' | 'surplus' | 'exact' {
  const diff = line.quantityFact - line.quantityPlan;
  if (diff < 0) return 'shortage';
  if (diff > 0) return 'surplus';
  return 'exact';
}

/**
 * Calculate line priority for sorting
 * Lower number = higher priority
 * Order: In Progress (1) -> Completed (2) -> Not Started (3) -> Over-plan (4)
 */
export function getLinePriority(line: ReceivingLine): number {
  const fact = line.quantityFact;
  const plan = line.quantityPlan;

  // In progress: started but not finished - HIGHEST PRIORITY
  if (fact > 0 && fact < plan) return 1;

  // Completed: received exactly as planned
  if (fact === plan && fact > 0) return 2;

  // Not started: nothing received yet
  if (fact === 0) return 3;

  // Over-plan: received more than planned
  if (fact > plan) return 4;

  return 5; // Fallback
}

/**
 * Calculate line status based on quantities
 */
export function calculateLineStatus(fact: number, plan: number): 'pending' | 'partial' | 'completed' | 'error' {
  if (fact === 0) return 'pending';
  if (fact >= plan) return 'completed';
  return 'partial';
}

/**
 * Sort lines by priority
 */
export function sortLinesByPriority(lines: ReceivingLine[]): ReceivingLine[] {
  return [...lines].sort((a, b) => {
    const priorityDiff = getLinePriority(a) - getLinePriority(b);

    // If same priority, sort alphabetically by product name
    if (priorityDiff === 0) {
      return a.productName.localeCompare(b.productName);
    }

    return priorityDiff;
  });
}

/**
 * Get document summary statistics
 */
export function getDocumentStats(lines: ReceivingLine[]) {
  const totalLines = lines.length;
  const completedExact = lines.filter(l => l.quantityFact === l.quantityPlan && l.quantityFact > 0).length;
  const withShortage = lines.filter(l => l.quantityFact < l.quantityPlan).length;
  const withOverplan = lines.filter(l => l.quantityFact > l.quantityPlan).length;
  const notStarted = lines.filter(l => l.quantityFact === 0).length;

  const totalPlan = lines.reduce((sum, l) => sum + l.quantityPlan, 0);
  const totalFact = lines.reduce((sum, l) => sum + l.quantityFact, 0);
  const totalDiff = totalFact - totalPlan;

  const progress = totalPlan > 0 ? (totalFact / totalPlan) * 100 : 0;

  return {
    totalLines,
    completedExact,
    withShortage,
    withOverplan,
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
export function canCompleteDocument(lines: ReceivingLine[]): {
  canComplete: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const stats = getDocumentStats(lines);

  if (stats.notStarted > 0) {
    warnings.push(`${stats.notStarted} позиций не начато`);
  }

  if (stats.withShortage > 0) {
    warnings.push(`${stats.withShortage} позиций с недостачей`);
  }

  if (stats.withOverplan > 0) {
    warnings.push(`${stats.withOverplan} позиций с излишками`);
  }

  return {
    canComplete: true, // Can always complete, but with warnings
    warnings,
  };
}
