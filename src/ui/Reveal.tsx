/**
 * 👁️ REVEAL
 * Прогрессивное раскрытие информации (Progressive Disclosure)
 * Показываем только то, что нужно на текущем шаге
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

interface RevealProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  showIcon?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export const Reveal: React.FC<RevealProps> = ({
  trigger,
  children,
  defaultOpen = false,
  showIcon = true,
  onToggle,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  return (
    <div className="w-full">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1">{trigger}</div>
        {showIcon && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * 📋 REVEAL DETAILS
 * Специализированный компонент для раскрытия деталей строки
 */
interface RevealDetailsProps {
  summary: React.ReactNode;
  details: React.ReactNode;
  badge?: React.ReactNode;
}

export const RevealDetails: React.FC<RevealDetailsProps> = ({
  summary,
  details,
  badge,
}) => {
  return (
    <Reveal
      trigger={
        <div className="flex items-center gap-3">
          {summary}
          {badge && <div className="ml-auto">{badge}</div>}
        </div>
      }
    >
      <div className="bg-gray-50 rounded-lg p-4 mt-2">{details}</div>
    </Reveal>
  );
};

/**
 * 🎯 CONDITIONAL REVEAL
 * Показывает контент только при выполнении условия
 */
interface ConditionalRevealProps {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ConditionalReveal: React.FC<ConditionalRevealProps> = ({
  condition,
  children,
  fallback,
}) => {
  return (
    <AnimatePresence mode="wait">
      {condition ? (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {children}
        </motion.div>
      ) : fallback ? (
        <motion.div
          key="fallback"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {fallback}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

