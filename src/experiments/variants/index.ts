// === 📁 src/experiments/variants/index.ts ===
// Variant implementations for different experiments

import { experiments } from '../flags';

/**
 * Hook to use experiment variant
 */
export function useExperiment(experimentId: string) {
  const variant = experiments.getVariant(experimentId);
  const config = experiments.getConfig(experimentId);
  const isActive = experiments.isActive(experimentId);

  return {
    variant,
    config,
    isActive,
    isControl: variant === 'control',
    isVariantA: variant === 'variant_a',
    isVariantB: variant === 'variant_b',
    isVariantC: variant === 'variant_c',
  };
}

/**
 * Hook for cards vs tables experiment
 */
export function useCardsVsTablesExperiment() {
  const exp = useExperiment('CARDS_VS_TABLES');
  
  return {
    ...exp,
    shouldUseCards: exp.config.format === 'cards',
    shouldUseTable: exp.config.format === 'table',
    showImages: exp.config.showImages === true,
    showProgressBars: exp.config.showProgressBars === true,
  };
}

/**
 * Hook for quick filters experiment
 */
export function useQuickFiltersExperiment() {
  const exp = useExperiment('QUICK_FILTERS');
  
  return {
    ...exp,
    showQuickFilters: exp.config.showQuickFilters === true,
    quickFilterOptions: exp.config.quickFilterOptions || [],
  };
}

/**
 * Hook for swipes vs buttons experiment
 */
export function useSwipesVsButtonsExperiment() {
  const exp = useExperiment('SWIPES_VS_BUTTONS');
  
  return {
    ...exp,
    enableSwipes: exp.config.enableSwipes === true,
    showButtons: exp.config.showButtons !== false,
    showSwipeHint: exp.config.swipeHint === true,
  };
}

/**
 * Hook for auto navigation experiment
 */
export function useAutoNavigationExperiment() {
  const exp = useExperiment('AUTO_NAVIGATION');
  
  return {
    ...exp,
    autoNavigate: exp.config.autoNavigate === true,
    autoNavigateDelay: exp.config.autoNavigateDelay || 500,
    showNextButton: exp.config.showNextButton !== false,
  };
}

/**
 * Hook for hints experiment
 */
export function useHintsExperiment() {
  const exp = useExperiment('HINTS_ENABLED');
  
  return {
    ...exp,
    showHints: exp.config.showHints === true,
    hintType: exp.config.hintType || 'contextual',
  };
}

/**
 * Hook for document grouping experiment
 */
export function useDocumentGroupingExperiment() {
  const exp = useExperiment('DOCUMENT_GROUPING');
  
  return {
    ...exp,
    groupBy: exp.config.groupBy || 'none',
    stickyHeaders: exp.config.stickyHeaders === true,
    shouldGroup: exp.config.groupBy !== 'none',
  };
}

/**
 * Hook for progress display experiment
 */
export function useProgressDisplayExperiment() {
  const exp = useExperiment('PROGRESS_DISPLAY');
  
  return {
    ...exp,
    progressType: exp.config.progressType || 'text',
    showPercentage: exp.config.showPercentage !== false,
    colorCoded: exp.config.colorCoded === true,
    shouldUseProgressBar: exp.config.progressType === 'bar',
  };
}


