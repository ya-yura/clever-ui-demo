// === 📁 src/utils/designTokens.ts ===
// Design token utilities for consistent styling

/**
 * Get card status classes based on status
 */
export const getCardStatusClass = (status: 'completed' | 'partial' | 'error' | 'default' | 'in_progress'): string => {
  switch (status) {
    case 'completed':
      return 'card-status card-status-completed';
    case 'partial':
      return 'card-status card-status-partial';
    case 'error':
      return 'card-status card-status-error';
    case 'in_progress':
      return 'card-status card-status-default';
    default:
      return 'card-status card-status-default';
  }
};

/**
 * Get button variant class
 */
export const getButtonClass = (variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' = 'primary'): string => {
  switch (variant) {
    case 'primary':
      return 'btn-primary';
    case 'secondary':
      return 'btn-secondary';
    case 'success':
      return 'btn-success';
    case 'danger':
      return 'btn-danger';
    case 'warning':
      return 'btn-warning';
    default:
      return 'btn-primary';
  }
};

/**
 * Get status color classes for text
 */
export const getStatusTextClass = (status: 'success' | 'warning' | 'error' | 'info'): string => {
  switch (status) {
    case 'success':
      return 'text-success';
    case 'warning':
      return 'text-warning';
    case 'error':
      return 'text-error';
    case 'info':
      return 'text-info';
    default:
      return 'text-content-primary';
  }
};

/**
 * Get status background classes
 */
export const getStatusBgClass = (status: 'success' | 'warning' | 'error' | 'info'): string => {
  switch (status) {
    case 'success':
      return 'bg-success-light';
    case 'warning':
      return 'bg-warning-light';
    case 'error':
      return 'bg-error-light';
    case 'info':
      return 'bg-info-light';
    default:
      return 'bg-surface-secondary';
  }
};





