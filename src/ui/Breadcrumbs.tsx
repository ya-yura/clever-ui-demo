/**
 * 🧭 BREADCRUMBS
 * Контекстная навигация для понимания текущей позиции
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items, 
  showHome = true 
}) => {
  return (
    <nav className="flex items-center gap-2 text-sm overflow-x-auto py-2 px-4">
      {showHome && (
        <>
          <Link 
            to="/" 
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <HomeIcon className="w-4 h-4" />
          </Link>
          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
        </>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ) : (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1 font-medium text-gray-900 whitespace-nowrap"
              >
                {item.icon}
                <span>{item.label}</span>
              </motion.span>
            )}
            
            {!isLast && (
              <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

/**
 * 🎯 CONTEXT BREADCRUMBS
 * Умные хлебные крошки с автоматическим определением контекста
 */
interface ContextBreadcrumbsProps {
  documentType: string;
  documentNumber?: string;
  step?: string;
}

export const ContextBreadcrumbs: React.FC<ContextBreadcrumbsProps> = ({
  documentType,
  documentNumber,
  step,
}) => {
  const items: BreadcrumbItem[] = [
    { label: documentType, path: `/${documentType.toLowerCase()}` },
  ];

  if (documentNumber) {
    items.push({ 
      label: `№${documentNumber}`,
      path: documentNumber ? `/${documentType.toLowerCase()}/${documentNumber}` : undefined,
    });
  }

  if (step) {
    items.push({ label: step });
  }

  return <Breadcrumbs items={items} />;
};

