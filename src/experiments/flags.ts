// === 📁 src/experiments/flags.ts ===
// Feature flags and A/B testing system

export type VariantName = 'control' | 'variant_a' | 'variant_b' | 'variant_c';

export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  active: boolean;
  variants: {
    name: VariantName;
    weight: number; // 0-100, percentage of users
    config: Record<string, any>;
  }[];
}

/**
 * Available experiments
 */
export const EXPERIMENTS: Record<string, ExperimentConfig> = {
  // Гипотеза 1: Карточки vs Таблицы
  CARDS_VS_TABLES: {
    id: 'cards_vs_tables',
    name: 'Карточки товаров vs Таблица',
    description: 'Тестирование формата отображения списка товаров',
    active: true,
    variants: [
      {
        name: 'control',
        weight: 50,
        config: {
          format: 'table',
          showImages: false,
        },
      },
      {
        name: 'variant_a',
        weight: 50,
        config: {
          format: 'cards',
          showImages: true,
          showProgressBars: true,
        },
      },
    ],
  },

  // Гипотеза 2: Быстрые фильтры vs Обычный поиск
  QUICK_FILTERS: {
    id: 'quick_filters',
    name: 'Быстрые фильтры vs Обычный поиск',
    description: 'Тестирование удобства быстрых фильтров',
    active: true,
    variants: [
      {
        name: 'control',
        weight: 50,
        config: {
          filterType: 'standard',
          showQuickFilters: false,
        },
      },
      {
        name: 'variant_a',
        weight: 50,
        config: {
          filterType: 'quick',
          showQuickFilters: true,
          quickFilterOptions: ['Сегодня', 'В работе', 'Срочные'],
        },
      },
    ],
  },

  // Гипотеза 3: Свайпы vs Кнопки
  SWIPES_VS_BUTTONS: {
    id: 'swipes_vs_buttons',
    name: 'Свайпы vs Кнопки',
    description: 'Тестирование удобства свайпов для действий',
    active: true,
    variants: [
      {
        name: 'control',
        weight: 50,
        config: {
          enableSwipes: false,
          showButtons: true,
        },
      },
      {
        name: 'variant_a',
        weight: 50,
        config: {
          enableSwipes: true,
          showButtons: false,
          swipeHint: true,
        },
      },
    ],
  },

  // Гипотеза 4: Авто-переход vs Ручной
  AUTO_NAVIGATION: {
    id: 'auto_navigation',
    name: 'Авто-переход vs Ручной переход',
    description: 'Тестирование автоматической навигации между товарами',
    active: true,
    variants: [
      {
        name: 'control',
        weight: 50,
        config: {
          autoNavigate: false,
          showNextButton: true,
        },
      },
      {
        name: 'variant_a',
        weight: 50,
        config: {
          autoNavigate: true,
          autoNavigateDelay: 500,
        },
      },
    ],
  },

  // Гипотеза 5: Подсказки vs Без подсказок
  HINTS_ENABLED: {
    id: 'hints_enabled',
    name: 'Подсказки vs Без подсказок',
    description: 'Тестирование влияния подсказок на UX',
    active: true,
    variants: [
      {
        name: 'control',
        weight: 50,
        config: {
          showHints: false,
        },
      },
      {
        name: 'variant_a',
        weight: 50,
        config: {
          showHints: true,
          hintType: 'contextual',
        },
      },
      {
        name: 'variant_b',
        weight: 0, // Disabled for now
        config: {
          showHints: true,
          hintType: 'always_on',
        },
      },
    ],
  },

  // Гипотеза 6: Группировка документов
  DOCUMENT_GROUPING: {
    id: 'document_grouping',
    name: 'Группировка документов по датам',
    description: 'Тестирование группировки документов',
    active: true,
    variants: [
      {
        name: 'control',
        weight: 30,
        config: {
          groupBy: 'none',
        },
      },
      {
        name: 'variant_a',
        weight: 70,
        config: {
          groupBy: 'date',
          stickyHeaders: true,
        },
      },
    ],
  },

  // Гипотеза 7: Прогресс-бары
  PROGRESS_DISPLAY: {
    id: 'progress_display',
    name: 'Отображение прогресса',
    description: 'Тестирование визуализации прогресса',
    active: true,
    variants: [
      {
        name: 'control',
        weight: 50,
        config: {
          progressType: 'text',
          showPercentage: true,
        },
      },
      {
        name: 'variant_a',
        weight: 50,
        config: {
          progressType: 'bar',
          showPercentage: true,
          colorCoded: true,
        },
      },
    ],
  },
};

/**
 * Experiments Manager
 */
class ExperimentsManager {
  private static instance: ExperimentsManager;
  private userVariants: Map<string, VariantName> = new Map();

  private constructor() {
    this.loadUserVariants();
  }

  static getInstance(): ExperimentsManager {
    if (!ExperimentsManager.instance) {
      ExperimentsManager.instance = new ExperimentsManager();
    }
    return ExperimentsManager.instance;
  }

  /**
   * Get variant for experiment
   */
  getVariant(experimentId: string): VariantName {
    // Check if user already has assigned variant
    if (this.userVariants.has(experimentId)) {
      return this.userVariants.get(experimentId)!;
    }

    const experiment = EXPERIMENTS[experimentId];
    if (!experiment || !experiment.active) {
      return 'control';
    }

    // Assign random variant based on weights
    const variant = this.selectVariant(experiment);
    this.userVariants.set(experimentId, variant);
    this.saveUserVariants();

    return variant;
  }

  /**
   * Get experiment config for current user
   */
  getConfig(experimentId: string): Record<string, any> {
    const variant = this.getVariant(experimentId);
    const experiment = EXPERIMENTS[experimentId];
    
    if (!experiment) {
      return {};
    }

    const variantConfig = experiment.variants.find(v => v.name === variant);
    return variantConfig?.config || {};
  }

  /**
   * Check if experiment is active
   */
  isActive(experimentId: string): boolean {
    const experiment = EXPERIMENTS[experimentId];
    return experiment?.active || false;
  }

  /**
   * Get all active experiments with user's variants
   */
  getActiveExperiments(): Array<{
    id: string;
    name: string;
    variant: VariantName;
    config: Record<string, any>;
  }> {
    return Object.values(EXPERIMENTS)
      .filter(exp => exp.active)
      .map(exp => ({
        id: exp.id,
        name: exp.name,
        variant: this.getVariant(exp.id),
        config: this.getConfig(exp.id),
      }));
  }

  /**
   * Override variant for testing
   */
  setVariant(experimentId: string, variant: VariantName): void {
    this.userVariants.set(experimentId, variant);
    this.saveUserVariants();
  }

  /**
   * Reset all variants (for testing)
   */
  resetAll(): void {
    this.userVariants.clear();
    localStorage.removeItem('experiment_variants');
  }

  // Private methods

  private selectVariant(experiment: ExperimentConfig): VariantName {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const variant of experiment.variants) {
      cumulative += variant.weight;
      if (random <= cumulative) {
        return variant.name;
      }
    }

    return 'control';
  }

  private loadUserVariants(): void {
    try {
      const stored = localStorage.getItem('experiment_variants');
      if (stored) {
        const data = JSON.parse(stored);
        this.userVariants = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Failed to load experiment variants:', error);
    }
  }

  private saveUserVariants(): void {
    try {
      const data = Object.fromEntries(this.userVariants);
      localStorage.setItem('experiment_variants', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save experiment variants:', error);
    }
  }
}

// Export singleton instance
export const experiments = ExperimentsManager.getInstance();


