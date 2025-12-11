/**
 * 🎨 UI COMPONENTS INDEX
 * Централизованный экспорт всех UI-компонентов
 */

export { StatusIcon } from './StatusIcon';
export { MicroHint, MicroHintOverlay } from './MicroHint';
export { ErrorHint, ScannerErrorHint } from './ErrorHint';
export { ActionScreen } from './ActionScreen';
export { ProgressBar, ProgressStats } from './ProgressBar';
export { Reveal, RevealDetails, ConditionalReveal } from './Reveal';
export { SwipeableRow, QuantitySwipeRow } from './SwipeableRow';
export { Breadcrumbs, ContextBreadcrumbs } from './Breadcrumbs';
export { ChunkedList, DocumentChunkedList } from './ChunkedList';
export { DocumentHeader, CompactDocumentHeader } from './DocumentHeader';
export { ItemCard, ItemList } from './ItemCard';
export { ScannerScreen } from './ScannerScreen';
export type { ScanResult } from './ScannerScreen';

// Re-export color system
export { statusColors, getStatusClasses, getStatusBg, getStatusHex, getProgressStatus, getErrorStatus } from '../styles/statusColors';
export type { StatusType } from '../styles/statusColors';
