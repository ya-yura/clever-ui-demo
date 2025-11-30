// === 📁 src/components/documents/DocumentListSkeleton.tsx ===
// Skeleton loader for document list

import React from 'react';
import { Skeleton } from '@/design/components';

interface DocumentListSkeletonProps {
  count?: number;
}

/**
 * DocumentListSkeleton
 * 
 * Skeleton placeholder for document list while loading.
 * Shows animated placeholders matching document card layout.
 */
export const DocumentListSkeleton: React.FC<DocumentListSkeletonProps> = ({
  count = 6,
}) => {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-surface-secondary border border-borders-default rounded-lg px-3 py-2.5 space-y-1.5"
        >
          {/* Top Row: Title and Status */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1">
              <Skeleton variant="text" width="70%" height={16} />
              <Skeleton variant="text" width="40%" height={12} />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton variant="text" width={60} height={12} />
              <Skeleton variant="rectangular" width={70} height={18} className="rounded" />
            </div>
          </div>

          {/* Bottom Row: User info */}
          <div className="flex items-center gap-2">
            <Skeleton variant="text" width="30%" height={14} />
          </div>
        </div>
      ))}
    </div>
  );
};

