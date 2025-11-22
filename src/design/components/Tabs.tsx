import React, { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
  className?: string;
}

/**
 * Tabs Component
 * 
 * Navigation between different content sections.
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
  variant = 'default',
  fullWidth = false,
  className = '',
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id);
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabClick = (tabId: string) => {
    if (!controlledActiveTab) {
      setInternalActiveTab(tabId);
    }
    onChange?.(tabId);
  };

  const baseTabStyles = 'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-border-focus disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    default: {
      container: 'bg-surface-tertiary rounded-lg p-1',
      tab: 'rounded-md',
      active: 'bg-surface-secondary text-content-primary shadow-sm',
      inactive: 'text-content-tertiary hover:text-content-secondary hover:bg-surface-secondary/50',
    },
    pills: {
      container: 'gap-2',
      tab: 'rounded-full border border-border-default',
      active: 'bg-brand-primary text-brand-primaryDark border-brand-primary',
      inactive: 'text-content-secondary hover:border-border-strong hover:bg-surface-tertiary',
    },
    underline: {
      container: 'border-b border-border-default',
      tab: 'border-b-2 border-transparent rounded-none',
      active: 'border-brand-primary text-content-primary',
      inactive: 'text-content-tertiary hover:text-content-secondary hover:border-border-light',
    },
  };

  const styles = variantStyles[variant];
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`${widthClass} ${className}`}>
      <div className={`flex ${styles.container} ${fullWidth ? 'justify-stretch' : ''}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && handleTabClick(tab.id)}
              disabled={tab.disabled}
              className={`
                ${baseTabStyles}
                ${styles.tab}
                ${isActive ? styles.active : styles.inactive}
                ${fullWidth ? 'flex-1' : ''}
              `}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`
                  ml-1 px-2 py-0.5 text-xs rounded-full
                  ${isActive ? 'bg-brand-primaryDark/20' : 'bg-surface-tertiary'}
                `}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

