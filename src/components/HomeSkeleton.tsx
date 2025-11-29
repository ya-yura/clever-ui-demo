// === 📁 src/components/HomeSkeleton.tsx ===
// Skeleton loader for home page

import React from 'react';
import { Skeleton } from '@/design/components';

/**
 * HomeSkeleton
 * 
 * Skeleton for Home page with operation tiles
 */
export const HomeSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="space-y-2">
        <Skeleton variant="text" width="40%" height={32} />
        <Skeleton variant="text" width="60%" height={20} />
      </div>

      {/* Primary Operations (Large Tiles) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface-secondary border-2 border-surface-tertiary rounded-xl p-6 space-y-3 min-h-[120px]"
          >
            {/* Icon */}
            <Skeleton variant="rectangular" width={48} height={48} className="rounded-lg" />
            
            {/* Title */}
            <Skeleton variant="text" width="70%" height={24} />
            
            {/* Subtitle */}
            <Skeleton variant="text" width="50%" height={16} />
            
            {/* Count Badge */}
            <div className="flex justify-end">
              <Skeleton variant="rectangular" width={60} height={24} className="rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Operations (Medium Tiles) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface-secondary border border-surface-tertiary rounded-xl p-4 space-y-2 min-h-[100px]"
          >
            <Skeleton variant="rectangular" width={40} height={40} className="rounded-lg" />
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="50%" height={14} />
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface-secondary border border-surface-tertiary rounded-lg p-4 text-center space-y-2"
          >
            <Skeleton variant="text" width="60%" height={36} className="mx-auto" />
            <Skeleton variant="text" width="70%" height={16} className="mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};

