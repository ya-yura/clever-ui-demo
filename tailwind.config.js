import { readFileSync } from 'fs';
import { join } from 'path';

// Читаем Design System DNA напрямую из файла источника
const designSystemPath = join(process.cwd(), 'src/theme/design-system.json');
const designSystem = JSON.parse(readFileSync(designSystemPath, 'utf-8'));

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', 'sans-serif'],
      },
      colors: {
        // Semantic colors using CSS variables (theme-switchable)
        surface: {
          primary: 'var(--color-surface-primary)',
          secondary: 'var(--color-surface-secondary)',
          tertiary: 'var(--color-surface-tertiary)',
          inverse: 'var(--color-surface-inverse)',
        },
        content: {
          primary: 'var(--color-content-primary)',
          secondary: 'var(--color-content-secondary)',
          tertiary: 'var(--color-content-tertiary)',
          inverse: 'var(--color-content-inverse)',
        },
        
        // Brand colors (consistent across themes)
        brand: {
          primary: 'var(--color-brand-primary)',
          dark: 'var(--color-brand-dark)',
          secondary: 'var(--color-brand-secondary)',
        },
        
        // Status colors (consistent across themes)
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
        
        // Modules (dynamically loaded from design-system.json)
        modules: {
          receiving: { 
            bg: designSystem.dna.colors.modules.receiving.bg, 
            text: designSystem.dna.colors.modules.receiving.text 
          },
          inventory: { 
            bg: designSystem.dna.colors.modules.inventory.bg, 
            text: designSystem.dna.colors.modules.inventory.text 
          },
          picking: { 
            bg: designSystem.dna.colors.modules.picking.bg, 
            text: designSystem.dna.colors.modules.picking.text 
          },
          placement: { 
            bg: designSystem.dna.colors.modules.placement.bg, 
            text: designSystem.dna.colors.modules.placement.text 
          },
          shipment: { 
            bg: designSystem.dna.colors.modules.shipment.bg, 
            text: designSystem.dna.colors.modules.shipment.text 
          },
          return: { 
            bg: designSystem.dna.colors.modules.return.bg, 
            text: designSystem.dna.colors.modules.return.text 
          },
        },
      },
      borderRadius: {
        DEFAULT: designSystem.dna.borderRadius.md,
        lg: designSystem.dna.borderRadius.lg,
        sm: designSystem.dna.borderRadius.sm,
        full: designSystem.dna.borderRadius.full,
      },
      boxShadow: {
        soft: designSystem.dna.shadows.md,
        card: designSystem.dna.shadows.lg,
      }
    },
  },
  plugins: [],
}
