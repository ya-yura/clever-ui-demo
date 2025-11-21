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
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-surface-secondary border border-surface-tertiary rounded-lg p-4 space-y-3"
        >
          {/* Header: Icon + Title + Badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              {/* Icon */}
              <Skeleton variant="rectangular" width={48} height={48} className="shrink-0" />
              
              {/* Title & Metadata */}
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={16} />
              </div>
            </div>
            
            {/* Badge */}
            <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
          </div>

          {/* Partner & Date */}
          <div className="flex items-center justify-between">
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="text" width="30%" />
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <Skeleton variant="text" width="20%" height={14} />
              <Skeleton variant="text" width="15%" height={14} />
            </div>
            <Skeleton variant="rectangular" className="w-full h-2 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

