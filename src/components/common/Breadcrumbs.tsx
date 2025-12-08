// === 📁 src/components/common/Breadcrumbs.tsx ===
// Breadcrumb navigation component

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const navigate = useNavigate();

  const handleClick = (item: BreadcrumbItem, index: number) => {
    // Don't navigate if it's the last item (current page)
    if (index === items.length - 1) return;
    
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <nav 
      className={`flex items-center gap-2 text-sm overflow-x-auto py-2 ${className}`}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isFirst = index === 0;
        
        return (
          <React.Fragment key={index}>
            {/* Separator */}
            {index > 0 && (
              <ChevronRight 
                size={16} 
                className="text-content-tertiary flex-shrink-0" 
              />
            )}
            
            {/* Breadcrumb Item */}
            <button
              onClick={() => handleClick(item, index)}
              disabled={isLast}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors flex-shrink-0 ${
                isLast
                  ? 'text-content-primary font-semibold cursor-default'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface-tertiary'
              }`}
              aria-current={isLast ? 'page' : undefined}
            >
              {/* Icon */}
              {item.icon ? (
                <span className="flex-shrink-0">{item.icon}</span>
              ) : isFirst ? (
                <Home size={16} className="flex-shrink-0" />
              ) : null}
              
              {/* Label */}
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

/**
 * Hook to generate breadcrumb items based on current route
 */
export function useBreadcrumbs(customItems?: BreadcrumbItem[]): BreadcrumbItem[] {
  const defaultItems: BreadcrumbItem[] = [
    { label: 'Главная', path: '/' },
  ];

  if (customItems) {
    return [...defaultItems, ...customItems];
  }

  return defaultItems;
}


