import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  defaultOpen = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border-light last:border-0">
      <button
        className={`
          flex items-center justify-between w-full py-4 text-left
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-brand-primary transition-colors'}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-content-primary">{title}</span>
        <ChevronDown 
          className={`text-content-tertiary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          size={20}
        />
      </button>
      
      <div 
        className={`
          overflow-hidden transition-all duration-200 ease-in-out
          ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="text-content-secondary text-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Accordion Component
 * 
 * Vertically stacked list of headers that reveal or hide associated content.
 */
export const Accordion: React.FC<AccordionProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`border-t border-border-light ${className}`}>
      {children}
    </div>
  );
};

