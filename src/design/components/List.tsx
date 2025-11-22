import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  showChevron?: boolean;
  active?: boolean;
  disabled?: boolean;
}

/**
 * ListItem Component
 * 
 * Single item in a list with optional icons and actions.
 */
export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  icon,
  endIcon,
  showChevron = false,
  active = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) => {
  const isInteractive = Boolean(onClick);

  return (
    <div
      className={`
        flex items-center gap-3
        px-4 py-3
        rounded-lg
        transition-all duration-200
        ${isInteractive && !disabled ? 'cursor-pointer hover:bg-surface-tertiary active:scale-[0.99]' : ''}
        ${active ? 'bg-surface-tertiary border border-brand-primary/30' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={disabled ? undefined : onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive && !disabled ? 0 : undefined}
      {...props}
    >
      {icon && (
        <div className="shrink-0 text-content-secondary">
          {icon}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className={`font-medium ${active ? 'text-content-primary' : 'text-content-secondary'}`}>
          {title}
        </div>
        {subtitle && (
          <div className="text-sm text-content-tertiary truncate">
            {subtitle}
          </div>
        )}
      </div>

      {endIcon && (
        <div className="shrink-0 text-content-tertiary">
          {endIcon}
        </div>
      )}

      {showChevron && (
        <ChevronRight size={20} className="shrink-0 text-content-tertiary" />
      )}
    </div>
  );
};

interface ListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  divider?: boolean;
  compact?: boolean;
}

/**
 * List Component
 * 
 * Container for ListItem components.
 */
export const List: React.FC<ListProps> = ({
  children,
  divider = false,
  compact = false,
  className = '',
  ...props
}) => {
  const childArray = React.Children.toArray(children);

  return (
    <div
      className={`
        ${compact ? 'space-y-1' : 'space-y-2'}
        ${className}
      `}
      role="list"
      {...props}
    >
      {divider
        ? childArray.map((child, index) => (
            <React.Fragment key={index}>
              {child}
              {index < childArray.length - 1 && (
                <div className="border-t border-border-default my-2" />
              )}
            </React.Fragment>
          ))
        : children
      }
    </div>
  );
};

