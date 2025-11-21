// === 📁 src/components/documents/DocumentsByTypeSkeleton.tsx ===
// Skeleton loader for documents by type page

import React from 'react';
import { Skeleton } from '@/design/components';

/**
 * DocumentsByTypeSkeleton
 * 
 * Skeleton for DocumentsByType page with tile grid layout
 */
export const DocumentsByTypeSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface-secondary border border-surface-tertiary rounded-lg p-4 space-y-2"
          >
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" height={32} />
          </div>
        ))}
      </div>

      {/* Document Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-surface-secondary border border-surface-tertiary rounded-xl p-5 space-y-3"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <Skeleton variant="text" width="70%" height={24} />
              <Skeleton variant="rectangular" width={60} height={20} className="rounded-full" />
            </div>

            {/* Metadata */}
            <div className="space-y-2">
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="text" width="40%" />
            </div>

            {/* Progress */}
            <div className="space-y-1">
              <Skeleton variant="text" width="30%" height={14} />
              <Skeleton variant="rectangular" className="w-full h-2 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

