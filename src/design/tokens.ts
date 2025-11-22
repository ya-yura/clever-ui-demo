import designSystem from '../theme/design-system.json';

/**
 * Design Tokens extracted from design-system.json
 * 
 * Single source of truth for the application's design language.
 * Usage: import { tokens } from '@/design/tokens';
 * 
 * Theme switching is handled via CSS variables in index.css.
 * These tokens reference the CSS variables for surface/content colors,
 * which change based on [data-theme='light'|'dark'] attribute.
 */

export const tokens = {
  colors: {
    // Surface: Backgrounds and containers (theme-switchable via CSS variables)
    surface: {
      primary: 'var(--color-surface-primary)',
      secondary: 'var(--color-surface-secondary)',
      tertiary: 'var(--color-surface-tertiary)',
      inverse: 'var(--color-surface-inverse)',
      overlay: 'var(--color-surface-overlay)',
      disabled: 'var(--color-surface-disabled)',
    },
    // Content: Text and icons (theme-switchable via CSS variables)
    content: {
      primary: 'var(--color-content-primary)',
      secondary: 'var(--color-content-secondary)',
      tertiary: 'var(--color-content-tertiary)',
      inverse: 'var(--color-content-inverse)',
      disabled: 'var(--color-content-disabled)',
    },
    // Border colors (theme-switchable)
    border: {
      default: 'var(--color-border-default)',
      light: 'var(--color-border-light)',
      strong: 'var(--color-border-strong)',
      focus: 'var(--color-border-focus)',
    },
    // Brand: Main brand colors (consistent across themes)
    brand: {
      primary: designSystem.dna.colors.brand.primary,
      primaryDark: designSystem.dna.colors.brand.primaryDark,
      primaryLight: designSystem.dna.colors.brand.primaryLight,
      secondary: designSystem.dna.colors.brand.secondary,
      secondaryDark: designSystem.dna.colors.brand.secondaryDark,
      secondaryLight: designSystem.dna.colors.brand.secondaryLight,
      accent: designSystem.dna.colors.brand.accent,
      accentDark: designSystem.dna.colors.brand.accentDark,
    },
    // Status: Semantic feedback colors (consistent across themes)
    status: {
      success: designSystem.dna.colors.status.success,
      successDark: designSystem.dna.colors.status.successDark,
      successLight: designSystem.dna.colors.status.successLight,
      warning: designSystem.dna.colors.status.warning,
      warningDark: designSystem.dna.colors.status.warningDark,
      warningLight: designSystem.dna.colors.status.warningLight,
      error: designSystem.dna.colors.status.error,
      errorDark: designSystem.dna.colors.status.errorDark,
      errorLight: designSystem.dna.colors.status.errorLight,
      info: designSystem.dna.colors.status.info,
      infoDark: designSystem.dna.colors.status.infoDark,
      infoLight: designSystem.dna.colors.status.infoLight,
    },
    // Module colors (for different warehouse operations)
    modules: designSystem.dna.colors.modules,
    // Utility palette
    palette: designSystem.dna.colors.palette,
  },
  
  radii: {
    none: designSystem.dna.borderRadius.none,
    xs: designSystem.dna.borderRadius.xs,
    sm: designSystem.dna.borderRadius.sm,
    md: designSystem.dna.borderRadius.md,
    lg: designSystem.dna.borderRadius.lg,
    xl: designSystem.dna.borderRadius.xl,
    '2xl': designSystem.dna.borderRadius['2xl'],
    '3xl': designSystem.dna.borderRadius['3xl'],
    full: designSystem.dna.borderRadius.full,
  },

  borderWidth: designSystem.dna.borderWidth,

  shadows: {
    none: designSystem.dna.shadows.none,
    xs: designSystem.dna.shadows.xs,
    sm: designSystem.dna.shadows.sm,
    md: designSystem.dna.shadows.md,
    lg: designSystem.dna.shadows.lg,
    xl: designSystem.dna.shadows.xl,
    '2xl': designSystem.dna.shadows['2xl'],
    inner: designSystem.dna.shadows.inner,
    focus: designSystem.dna.shadows.focus,
  },

  typography: {
    family: designSystem.dna.typography.family,
    sizes: designSystem.dna.typography.sizes,
    weights: designSystem.dna.typography.weights,
    lineHeights: designSystem.dna.typography.lineHeights,
    letterSpacing: designSystem.dna.typography.letterSpacing,
  },

  spacing: designSystem.dna.spacing.scale,
  touch: designSystem.dna.spacing.touch,

  /**
   * Motion & Animation
   * Consistent timing and easing for all UI interactions
   */
  motion: {
    duration: designSystem.dna.motion.duration,
    easing: designSystem.dna.motion.easing,
  },

  /**
   * Breakpoints for responsive design
   */
  breakpoints: designSystem.dna.breakpoints,

  /**
   * Z-index scale for layering
   */
  zIndex: designSystem.dna.zIndex,

  /**
   * Icon sizes
   */
  iconSizes: designSystem.dna.iconSizes,

  /**
   * Component-specific tokens
   */
  components: designSystem.dna.components,

  /**
   * Theme-specific values (for reference/documentation)
   * Actual colors are set via CSS variables in index.css
   */
  themes: {
    dark: designSystem.dna.colors.dark,
    light: designSystem.dna.colors.light,
  },
} as const;

export type DesignTokens = typeof tokens;

/**
 * Utility function to get token value
 * @example getToken('colors.brand.primary') => '#daa420'
 */
export function getToken(path: string): any {
  const keys = path.split('.');
  let value: any = tokens;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) return undefined;
  }
  
  return value;
}
