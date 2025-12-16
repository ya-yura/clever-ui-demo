import { DocumentPriority } from '@/types/document';

type StatusBucket = 'active' | 'upcoming' | 'priority' | 'completed';

const ACTIVE_STATUSES = new Set(['in_progress']);
const UPCOMING_STATUSES = new Set(['pending', 'draft', 'new', 'planned', 'waiting']);
const COMPLETED_STATUSES = new Set(['completed', 'synced', 'done']);

const STATUS_BUCKET_ORDER: Record<StatusBucket, number> = {
  active: 0,
  upcoming: 1,
  priority: 2,
  completed: 3,
};

const PRIORITY_ORDER: Record<DocumentPriority, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
};

const getStatusBucket = (status?: string): StatusBucket => {
  if (!status) {
    return 'priority';
  }

  const normalized = status.toLowerCase();

  if (ACTIVE_STATUSES.has(normalized)) {
    return 'active';
  }

  if (UPCOMING_STATUSES.has(normalized)) {
    return 'upcoming';
  }

  if (COMPLETED_STATUSES.has(normalized)) {
    return 'completed';
  }

  return 'priority';
};

const shouldSortByPriority = (bucket: StatusBucket) => bucket === 'priority' || bucket === 'completed';

const getPriorityRank = (priority?: DocumentPriority) => {
  if (!priority) {
    // Treat undefined priority slightly lower than explicit "normal"
    return PRIORITY_ORDER.normal + 0.5;
  }

  return PRIORITY_ORDER[priority];
};

/**
 * Compare two documents by operational state (status + priority)
 */
export const compareByOperationalState = <
  T extends { status?: string; priority?: DocumentPriority }
>(
  a: T,
  b: T,
): number => {
  const bucketA = getStatusBucket(a.status);
  const bucketB = getStatusBucket(b.status);

  if (bucketA !== bucketB) {
    return STATUS_BUCKET_ORDER[bucketA] < STATUS_BUCKET_ORDER[bucketB] ? -1 : 1;
  }

  if (shouldSortByPriority(bucketA)) {
    const priorityDiff = getPriorityRank(a.priority) - getPriorityRank(b.priority);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
  }

  return 0;
};

/**
 * Returns a new array sorted by the operational ordering rule-set
 */
export const sortByOperationalState = <
  T extends { status?: string; priority?: DocumentPriority }
>(
  documents: T[],
): T[] => {
  return [...documents].sort(compareByOperationalState);
};













