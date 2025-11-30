// === 📁 src/modules/return/logic.ts ===
// Business logic for Return/Write-off module

import type { ReturnLine, ReturnDocument, ReturnReason } from './types';

/**
 * Calculate document completion percentage
 */
export function calculateProgress(lines: ReturnLine[]): number {
  if (lines.length === 0) return 0;
  const completed = lines.filter(l => l.quantityFact >= l.quantityPlan).length;
  return Math.round((completed / lines.length) * 100);
}

/**
 * Get line priority for sorting
 */
export function getLinePriority(line: ReturnLine): number {
  const fact = line.quantityFact;
  const plan = line.quantityPlan;

  // In progress: started but not finished
  if (fact > 0 && fact < plan) return 1;

  // Not started: nothing processed yet
  if (fact === 0) return 2;

  // Completed: processed as planned
  if (fact >= plan) return 3;

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
 * Get human-readable reason text
 */
export function getReasonText(reason: ReturnReason): string {
  const reasonMap: Record<ReturnReason, string> = {
    damaged: 'Брак',
    expired: 'Просрочка',
    customer_return: 'Возврат клиента',
    wrong_item: 'Пересорт',
    other: 'Прочее',
  };
  return reasonMap[reason] || reason;
}

/**
 * Sort lines by priority
 */
export function sortLinesByPriority(lines: ReturnLine[]): ReturnLine[] {
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
export function getDocumentStats(lines: ReturnLine[]) {
  const totalLines = lines.length;
  const completed = lines.filter(l => l.quantityFact >= l.quantityPlan).length;
  const notStarted = lines.filter(l => l.quantityFact === 0).length;
  const inProgress = lines.filter(l => l.quantityFact > 0 && l.quantityFact < l.quantityPlan).length;

  const totalPlan = lines.reduce((sum, l) => sum + l.quantityPlan, 0);
  const totalFact = lines.reduce((sum, l) => sum + l.quantityFact, 0);

  const progress = totalPlan > 0 ? (totalFact / totalPlan) * 100 : 0;

  // Group by reason
  const byReason: Record<ReturnReason, number> = {
    damaged: 0,
    expired: 0,
    customer_return: 0,
    wrong_item: 0,
    other: 0,
  };

  lines.forEach(line => {
    if (line.reason) {
      byReason[line.reason] = (byReason[line.reason] || 0) + line.quantityFact;
    }
  });

  return {
    totalLines,
    completed,
    notStarted,
    inProgress,
    totalPlan,
    totalFact,
    progress,
    byReason,
  };
}

/**
 * Validate if document can be completed
 */
export function canCompleteDocument(lines: ReturnLine[]): {
  canComplete: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const stats = getDocumentStats(lines);

  if (stats.notStarted > 0) {
    warnings.push(`${stats.notStarted} позиций не обработано`);
  }

  if (stats.inProgress > 0) {
    warnings.push(`${stats.inProgress} позиций обработано частично`);
  }

  // Check if all lines have reasons
  const linesWithoutReason = lines.filter(l => l.quantityFact > 0 && !l.reason);
  if (linesWithoutReason.length > 0) {
    warnings.push(`${linesWithoutReason.length} позиций без указания причины`);
  }

  return {
    canComplete: stats.notStarted === 0 && stats.inProgress === 0 && linesWithoutReason.length === 0,
    warnings,
  };
}
