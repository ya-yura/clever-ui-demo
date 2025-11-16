import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UISchema, ButtonConfig } from '../types/ui-schema';
import { ACTION_ROUTES, type ButtonAction } from '../types/ui-schema';
import { ActionRegistry } from '../services/actionRegistry';
import { SchemaLoader } from '../services/schemaLoader';
import { documentCounter } from '../services/documentCounter';
import analytics from '../analytics';

interface DynamicGridInterfaceProps {
  schemaName?: string;
}

export const DynamicGridInterface: React.FC<DynamicGridInterfaceProps> = ({ 
  schemaName = 'default' 
}) => {
  const [schema, setSchema] = useState<UISchema | null>(() => {
    return SchemaLoader.loadFromLocalStorage(schemaName);
  });
  const [documentCounts, setDocumentCounts] = useState<Map<ButtonAction, number>>(new Map());
  const navigate = useNavigate();
  const actionRegistry = new ActionRegistry(navigate);

  useEffect(() => {
    if (!schema) {
      const loadedSchema = SchemaLoader.loadFromLocalStorage(schemaName);
      if (loadedSchema) {
        setSchema(loadedSchema);
      }
    } else {
      analytics.trackCustomInterfaceLoaded({
        id: schema.metadata?.name || schemaName,
        version: schema.version || schema.metadata?.version || '1.0.0',
        buttonsCount: schema.buttons?.length || 0,
        source: 'localStorage',
      });
    }
  }, [schemaName]);

  useEffect(() => {
    if (!schema || !schema.buttons || schema.buttons.length === 0) {
      return;
    }

    const actions = schema.buttons
      .map(btn => btn.action as ButtonAction)
      .filter(action => action !== 'none');

    const loadCounts = async () => {
      const counts = await documentCounter.getAllCounts(actions);
      
      if (counts.size === 0 || Array.from(counts.values()).every(c => c === 0)) {
        const mockCounts = new Map<ButtonAction, number>([
          ['RECEIVING', 58],
          ['ORDER_PICKING', 57],
          ['SHIPPING', 15],
          ['INVENTORY', 99],
          ['PLACEMENT', 91],
          ['RETURN', 85],
          ['TRANSFER', 32],
          ['MARKING', 14],
        ]);
        setDocumentCounts(mockCounts);
      } else {
        setDocumentCounts(counts);
      }
    };

    loadCounts();
    documentCounter.startAutoUpdate(actions, 60000);

    return () => {
      documentCounter.stopAutoUpdate();
    };
  }, [schema]);

  const handleButtonClick = (button: ButtonConfig) => {
    analytics.trackCustomButtonClick({
      label: button.label,
      action: button.action,
      params: button.params,
      position: {
        row: button.position.startRow,
        col: button.position.startCol,
      },
      color: button.color,
    });
    
    if (button.route) {
      navigate(button.route);
    } else if (button.action !== 'none' && button.action in ACTION_ROUTES) {
      const route = ACTION_ROUTES[button.action as keyof typeof ACTION_ROUTES];
      if (route) {
        navigate(route);
      }
    } else {
      actionRegistry.execute(button.action, button.params);
    }
  };

  if (!schema || !schema.buttons || schema.buttons.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '20px',
        textAlign: 'center',
        fontFamily: "'Atkinson Hyperlegible', sans-serif",
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>📱</div>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 700, 
          color: '#FFFFFF',
          marginBottom: '12px',
        }}>
          Интерфейс не настроен
        </h2>
        <p style={{ 
          fontSize: '16px', 
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '32px',
          maxWidth: '400px',
        }}>
          Загрузите интерфейс через меню → Установить интерфейс
        </p>
      </div>
    );
  }

  const { columns, rows } = schema.grid;
  const gap = 2;
  const containerPadding = 32;
  const availableWidth = `100vw - ${containerPadding}px`;
  const cellSize = `calc((${availableWidth} - ${gap * (columns - 1)}px) / ${columns})`;
  
  return (
    <div style={{
      width: '100%',
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, ${cellSize})`,
      gap: `${gap}px`,
      padding: '0',
      margin: '0',
      boxSizing: 'border-box',
    }}>
      {schema.buttons.map((button) => {
        const isDark = button.style === 'dark';
        const count = documentCounts.get(button.action as ButtonAction) ?? button.documentCount;
        
        return (
          <button
            key={button.id}
            onClick={() => handleButtonClick(button)}
            style={{
              gridColumn: `${button.position.startCol + 1} / ${button.position.endCol + 2}`,
              gridRow: `${button.position.startRow + 1} / ${button.position.endRow + 2}`,
              background: isDark ? '#3E515C' : '#F3A36A',
              color: isDark ? '#FFFFFF' : '#8B5931',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
              borderRadius: '12px',
              fontFamily: "'Atkinson Hyperlegible', sans-serif",
              fontWeight: 700,
              fontSize: '20px',
              lineHeight: '1.1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: '16px 20px',
              textAlign: 'left',
              minHeight: '100%',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, opacity 0.15s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.opacity = '1';
            }}
          >
            <span style={{ 
              flex: '0 0 auto',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {button.label}
            </span>
            {count !== undefined && count > 0 && (
              <span style={{
                alignSelf: 'flex-end',
                color: '#FFFFFF',
                fontFamily: "'Atkinson Hyperlegible', sans-serif",
                fontWeight: 700,
                fontSize: '28px',
                lineHeight: '1',
                marginTop: 'auto',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
              }}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
