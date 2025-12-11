// === 📁 src/pages/Home.tsx ===
// Home page with module selection

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { odataCache } from '@/services/odataCache';
import { ODataDocumentType } from '@/types/odata';
import { MOCK_DOC_TYPES } from '@/data/mockDocTypes';
import { SchemaLoader } from '@/services/schemaLoader';
import { DynamicGridInterface } from '@/components/DynamicGridInterface';
import { HomeSkeleton } from '@/components/HomeSkeleton';
import { api } from '@/services/api';
import { Clock, Mic, MicOff } from 'lucide-react';
import { useSwipe } from '@/hooks/useSwipe';

interface DocTypeCard {
  uni: string;
  displayName: string;
  description: string;
  color: string;
  backgroundColor?: string; // Inline style for arbitrary colors
  icon: string;
  docsCount: number;
}

// Short titles mapping for concise labels on tiles
const SHORT_TITLE_BY_UNI: Record<string, string> = {
  PrihodNaSklad: 'Приход',
  PodborZakaza: 'Подбор',
  Otgruzka: 'Отгрузка',
  Inventarizaciya: 'Инвентаризация',
  RazmeshhenieVYachejki: 'Размещение',
  Vozvrat: 'Возврат',
  Peremeshenie: 'Перемещение',
  Markirovka: 'Маркировка',
};

// Fallback: derive short Russian label from raw/camel-cased name
const toShortTitle = (raw: string): string => {
  if (!raw) return 'Документ';
  // Insert spaces between Camel/PascalCase chunks (Latin or Cyrillic)
  const spaced = raw
    .replace(/([A-Z])([a-z]+)/g, ' $1$2')
    .replace(/([А-ЯЁ])([а-яё]+)/g, ' $1$2')
    .trim();
  const firstWord = spaced.split(/\s+/)[0] || raw;
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
};

const getShortTitleForType = (type: ODataDocumentType): string => {
  const fromMap = SHORT_TITLE_BY_UNI[type.uni];
  if (fromMap) return fromMap;
  const nameRaw = (type.displayName || type.name || type.uni || '').toString();
  return toShortTitle(nameRaw);
};

// Concise, helpful one-liners for when to use each operation
const DESCRIPTION_BY_UNI: Record<string, string> = {
  PrihodNaSklad: 'Принять товар от поставщика и сверить план/факт.',
  PodborZakaza: 'Собрать заказ по маршруту ячеек для отгрузки.',
  Otgruzka: 'Проверить комплектность и оформить отгрузку клиенту.',
  Inventarizaciya: 'Пересчитать остатки и зафиксировать расхождения.',
  RazmeshhenieVYachejki: 'Разместить принятый товар по ячейкам хранения.',
  Vozvrat: 'Оформить возврат или списание с указанием причины.',
  Peremeshenie: 'Переместить товар между ячейками или зонами.',
  Markirovka: 'Нанести или перепечатать этикетки и коды.',
};

const getDescriptionForType = (type: ODataDocumentType): string => {
  return DESCRIPTION_BY_UNI[type.uni] || `Выполнить операцию: ${getShortTitleForType(type)}.`;
};

// Icon mapping removed - no icons/emojis should be displayed

// Color mapping based on index (returns raw color values)
const getColorForIndex = (index: number): string => {
  const colors = [
    'var(--color-accent-yellow)', 
    'var(--color-brand-primary)',
    'var(--color-brand-light)',
    'var(--color-module-placement-bg)',
    'var(--color-accent-green)',
    'var(--color-module-return-bg)',
    'var(--color-accent-cyan)',
    'var(--color-brand-tertiary)',
  ];
  return colors[index % colors.length];
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [docTypes, setDocTypes] = useState<DocTypeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDocs, setTotalDocs] = useState(0);
  const [usingMockData, setUsingMockData] = useState(false);
  const [hasCustomInterface, setHasCustomInterface] = useState(false);
  
  // Последние использованные модули
  const [recentModules, setRecentModules] = useState<string[]>([]);
  
  // Голосовой поиск
  const [isListening, setIsListening] = useState(false);
  const [voiceSearchText, setVoiceSearchText] = useState('');
  const recognitionRef = useRef<any>(null);

  // Жест свайп справа для возврата назад (опционально)
  useSwipe(containerRef, {
    onSwipeRight: () => {
      // На главной странице свайп не уходит назад
      // но можно использовать для других действий
    },
  });

  // Загрузка последних использованных модулей
  useEffect(() => {
    const loadRecent = () => {
      try {
        const stored = localStorage.getItem('recent_modules');
        if (stored) {
          setRecentModules(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load recent modules:', error);
      }
    };
    
    loadRecent();
  }, []);

  // Сохранение использованного модуля
  const trackModuleUsage = (uni: string) => {
    try {
      const recent = [uni, ...recentModules.filter(m => m !== uni)].slice(0, 5);
      setRecentModules(recent);
      localStorage.setItem('recent_modules', JSON.stringify(recent));
    } catch (error) {
      console.error('Failed to save recent module:', error);
    }
  };

  // Инициализация голосового поиска
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'ru-RU';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setVoiceSearchText(transcript);
        
        // Поиск модуля по голосовой команде
        const foundModule = docTypes.find(dt => 
          dt.displayName.toLowerCase().includes(transcript) ||
          dt.description.toLowerCase().includes(transcript)
        );
        
        if (foundModule) {
          trackModuleUsage(foundModule.uni);
          navigate(`/docs/${foundModule.uni}`);
        } else {
          alert(`Модуль "${transcript}" не найден`);
        }
        
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [docTypes, navigate]);

  const toggleVoiceSearch = () => {
    if (!recognitionRef.current) {
      alert('Голосовой поиск не поддерживается в этом браузере');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    // Check if custom interface is installed
    const checkCustomInterface = () => {
      const customSchema = SchemaLoader.loadFromLocalStorage('active');
      if (customSchema) {
        console.log('✅ Custom interface found, rendering custom UI');
        setHasCustomInterface(true);
      } else {
        console.log('ℹ️ No custom interface, loading standard UI');
        setHasCustomInterface(false);
        loadDocTypes();
      }
    };

    // Check on mount
    checkCustomInterface();

    // Listen for custom event when interface is installed
    const handleInterfaceInstalled = () => {
      console.log('🔄 Interface installed event received, reloading...');
      checkCustomInterface();
    };

    window.addEventListener('interface-installed', handleInterfaceInstalled);

    return () => {
      window.removeEventListener('interface-installed', handleInterfaceInstalled);
    };
  }, []);

  // Debug: log docTypes whenever it changes
  useEffect(() => {
    console.log('🔄 [RENDER] docTypes changed:', docTypes);
    console.log('🔄 [RENDER] docTypes.length:', docTypes.length);
    console.log('🔄 [RENDER] usingMockData:', usingMockData);
  }, [docTypes, usingMockData]);

  const loadDocTypes = async () => {
    setLoading(true);
    setError(null);
    setUsingMockData(false);

    try {
      // Try to fetch doc types from cache/API
      let types: ODataDocumentType[] = [];
      let isMockData = false;
      
      try {
        types = await odataCache.getDocTypes();
        console.log('✅ [API] Loaded', types.length, 'doc types');
        console.log('📋 [API] DocTypes:', types);
      } catch (apiError: any) {
        console.warn('⚠️ [API] DocTypes failed:', apiError.message);
        types = [];
      }

      // If no types available, use mock data
      if (!types || types.length === 0) {
        console.warn('⚠️ [FALLBACK] No types from /DocTypes, using mock data');
        types = MOCK_DOC_TYPES;
        isMockData = true;
      }

      // Load document counts for each type
      const typesWithCounts = await Promise.all(
        types.map(async (type, index) => {
          let docsCount = 0;
          
          if (!isMockData) {
            try {
              const docs = await odataCache.getDocsByType(type.uni, {
                names: [type.uni, (type as any).name, (type as any).displayName],
              });
              docsCount = docs.length;
              console.log(`✅ [CACHE/API] Type "${type.uni}": ${docsCount} documents (list)`);
            } catch (err: any) {
              console.warn(`⚠️ [CACHE/API] Failed to load docs list for "${type.uni}":`, err?.message || err);

              try {
                const countResponse = await api.getDocsCount(type.uni);
                if (countResponse.success && typeof countResponse.data === 'number') {
                  docsCount = countResponse.data;
                }
                console.log(`✅ [API] Type "${type.uni}": ${docsCount} documents (count fallback)`);
              } catch (countErr: any) {
                console.error(`❌ [API] Failed to load docs count for "${type.uni}":`, countErr?.message || countErr);
              docsCount = 0;
              }
            }
          }

          // Handle color: use inline style for arbitrary colors
          const rawColor = type.buttonColor || getColorForIndex(index);
          let bgClass = '';
          let bgStyle = '';
          
          // If it's already a Tailwind class, use it
          if (rawColor.startsWith('bg-')) {
            bgClass = rawColor;
          } 
          // If it's a hex color, use inline style
          else if (rawColor.startsWith('#')) {
            bgStyle = rawColor;
          }
          // If it's a named CSS color (sandybrown, Orange, etc.), use inline style
          else {
            bgStyle = rawColor;
          }

          const result = {
            uni: type.uni,
            displayName: getShortTitleForType(type),
            description: getDescriptionForType(type),
            color: bgClass,
            backgroundColor: bgStyle,
            icon: '',
            docsCount,
          };

          console.log(`📦 [TYPE ${index}]`, result.displayName, '→ bgClass:', result.color, 'bgStyle:', result.backgroundColor);

          return result;
        })
      );

      setUsingMockData(isMockData);

      console.log('📊 [STATE] Setting docTypes:', typesWithCounts);
      console.log('📊 [STATE] docTypes.length:', typesWithCounts.length);
      
      setDocTypes(typesWithCounts);
      setTotalDocs(typesWithCounts.reduce((sum, type) => sum + type.docsCount, 0));
      setError(null);  // Clear error if we successfully got data
      
      console.log('✅ [FINAL] Loaded', typesWithCounts.length, 'types with', 
                  typesWithCounts.reduce((sum, t) => sum + t.docsCount, 0), 'total documents');
      console.log('📊 [FINAL] docTypes state should now have', typesWithCounts.length, 'items');
      
    } catch (error: any) {
      console.error('❌ [CRITICAL] Error loading doc types:', error);
      // Even if everything fails, use mock data
      console.warn('⚠️ [FALLBACK] Using mock data due to critical error');
      const mockTypes = MOCK_DOC_TYPES.map((type, index) => {
        // Fix color format: if buttonColor is hex, wrap it in bg-[...]
        let color = type.buttonColor || getColorForIndex(index);
        if (color && !color.startsWith('bg-')) {
          color = `bg-[${color}]`;
        }

        return {
          uni: type.uni,
          displayName: type.displayName || type.name,
          description: `Работа с документами типа "${type.displayName || type.name}"`,
          color: color,
          icon: '',
          docsCount: 0,
        };
      });
      
      console.log('📊 [FALLBACK] Setting mock types:', mockTypes);
      console.log('📊 [FALLBACK] mockTypes.length:', mockTypes.length);
      
      setDocTypes(mockTypes);
      setTotalDocs(0);
      setUsingMockData(true);
      setError(null); // Don't show error, just use mock data
    } finally {
      setLoading(false);
    }
  };

  console.log('🎯 [RENDER] Home render - loading:', loading, 'error:', error, 'docTypes.length:', docTypes.length);

  // Обёртка navigate с трекингом
  const navigateToModule = (uni: string) => {
    trackModuleUsage(uni);
    navigate(`/docs/${uni}`);
  };

  // Получение последних использованных модулей из docTypes (3 штуки для новой области)
  const recentModuleTiles = recentModules
    .map(uni => docTypes.find(dt => dt.uni === uni))
    .filter((x): x is DocTypeCard => Boolean(x))
    .slice(0, 3);

  // Render custom interface if installed
  if (hasCustomInterface) {
    return <DynamicGridInterface schemaName="active" />;
  }

  // Loading state
  if (loading) {
    return <HomeSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-2xl px-4">
          <div className="text-2xl font-bold text-error mb-2">Ошибка загрузки</div>
          <pre className="text-content-tertiary mb-6 text-left bg-surface-primary p-4 rounded-lg whitespace-pre-wrap text-sm">{error}</pre>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={loadDocTypes}
              className="bg-brand-primary hover:bg-brand-primary text-white px-6 py-3 rounded-lg transition-colors"
            >
              Повторить попытку
            </button>
            <button
              onClick={() => window.open('http://localhost:9000/MobileSMARTS/api/v1/DocTypes', '_blank')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Проверить API в браузере
            </button>
            <button
              onClick={() => navigate('/diagnostics')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Диагностика
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prioritization (Android Compact – 22): primary → secondary → tertiary
  const primaryOrder = ['PrihodNaSklad', 'PodborZakaza', 'Otgruzka', 'Inventarizaciya'];
  const secondaryOrder = ['RazmeshhenieVYachejki', 'Vozvrat', 'Peremeshenie', 'Markirovka'];

  const included = new Set<string>();
  const byUni = (uni: string) => docTypes.find((d) => d.uni === uni);

  // Hero-specific tiles (matching Figma mockup layout)
  const tPrihod = byUni('PrihodNaSklad');        // 1. Left large tile (yellow)
  const tOtgruzka = byUni('Otgruzka');           // 2. Right top tile (coral) - "Отгрузка"
  const tPodbor = byUni('PodborZakaza');         // 3. Right bottom tile (orange)
  const tInvent = byUni('Inventarizaciya');      // Full-width below
  const tVozvrat = byUni('Vozvrat');
  const tPlacement = byUni('RazmeshhenieVYachejki');

  [tPrihod, tOtgruzka, tPodbor, tInvent, tVozvrat, tPlacement].forEach((t) => {
    if (t) included.add(t.uni);
  });

  // Keep secondary/tertiary as before for the rest
  const secondaryTiles = secondaryOrder
    .map(byUni)
    .filter((x): x is DocTypeCard => Boolean(x))
    .filter((x) => !included.has(x.uni))
    .map((x) => (included.add(x.uni), x));

  const tertiaryTiles = docTypes.filter((d) => !included.has(d.uni));

  return (
    <div ref={containerRef} className="space-y-3 max-w-7xl mx-auto">
      {/* Голосовой поиск */}
      <div className="bg-surface-secondary rounded-lg p-4">
        <button
          onClick={toggleVoiceSearch}
          className={`w-full py-4 rounded-xl transition-all flex items-center justify-center gap-3 ${
            isListening
              ? 'bg-error text-white animate-pulse'
              : 'bg-brand-primary text-white hover:brightness-110'
          }`}
        >
          {isListening ? (
            <>
              <MicOff size={24} />
              <span className="font-bold">Говорите название модуля...</span>
            </>
          ) : (
            <>
              <Mic size={24} />
              <span className="font-bold">Голосовой поиск модулей</span>
            </>
          )}
        </button>
        {voiceSearchText && (
          <p className="text-xs text-content-tertiary mt-2 text-center">
            Последний запрос: "{voiceSearchText}"
          </p>
        )}
      </div>

      {/* Warning banner if using mock data */}
      {usingMockData && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-yellow-400 font-semibold mb-1">
                Демо-режим
              </h3>
              <p className="text-sm text-yellow-200/90 mb-2">
                API сервер недоступен. Показаны демонстрационные типы документов.
              </p>
              <p className="text-xs text-yellow-200/70">
                Для работы с реальными данными запустите API сервер: <br />
                <code className="bg-black/30 px-2 py-1 rounded mt-1 inline-block">
                  http://localhost:9000/MobileSMARTS/api/v1/
                </code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero layout: 4-column grid */}
      <div className="grid grid-cols-4 gap-1.5 md:gap-2">
        {/* Область 2: Последние операции - Left large area (2x2 grid) */}
        <div className="col-span-2 row-span-2 grid grid-cols-2 gap-1.5">
          {/* Большая кнопка - последняя операция (занимает 2 строки) */}
          {recentModuleTiles[0] && (
            <button
              onClick={() => navigateToModule(recentModuleTiles[0].uni)}
              className="tile-primary tone-strong row-span-2 bg-module-receiving-bg text-module-receiving-text"
            >
              <div>
                <h2 className="tile-title-lg">{recentModuleTiles[0].displayName}</h2>
                <p className="tile-subtext opacity-80">{recentModuleTiles[0].description}</p>
              </div>
            </button>
          )}
          
          {/* Боковые кнопки - более ранние операции */}
          {recentModuleTiles[1] && (
            <button
              onClick={() => navigateToModule(recentModuleTiles[1].uni)}
              className="tile-secondary tone-medium bg-module-picking-bg text-module-picking-text"
            >
              <div>
                <h2 className="tile-title-sm">{recentModuleTiles[1].displayName}</h2>
              </div>
            </button>
          )}
          
          {recentModuleTiles[2] && (
            <button
              onClick={() => navigateToModule(recentModuleTiles[2].uni)}
              className="tile-secondary tone-medium bg-module-inventory-bg text-module-inventory-text"
            >
              <div>
                <h2 className="tile-title-sm">{recentModuleTiles[2].displayName}</h2>
              </div>
            </button>
          )}
          
          {/* Если нет последних операций, показываем Приход по умолчанию */}
          {!recentModuleTiles[0] && tPrihod && (
            <button
              onClick={() => navigateToModule(tPrihod.uni)}
              className="tile-primary tone-strong row-span-2 bg-module-receiving-bg text-module-receiving-text"
            >
              <div>
                <h2 className="tile-title-lg">{tPrihod.displayName}</h2>
                <p className="tile-subtext opacity-80">{tPrihod.description}</p>
              </div>
            </button>
          )}
          {!recentModuleTiles[1] && tPodbor && (
            <button
              onClick={() => navigateToModule(tPodbor.uni)}
              className="tile-secondary tone-medium bg-module-picking-bg text-module-picking-text"
            >
              <div>
                <h2 className="tile-title-sm">{tPodbor.displayName}</h2>
              </div>
            </button>
          )}
          {!recentModuleTiles[2] && tOtgruzka && (
            <button
              onClick={() => navigateToModule(tOtgruzka.uni)}
              className="tile-secondary tone-medium bg-module-inventory-bg text-module-inventory-text"
            >
              <div>
                <h2 className="tile-title-sm">{tOtgruzka.displayName}</h2>
              </div>
            </button>
          )}
        </div>

        {/* 2. Отгрузка - Right top tile (coral) */}
        {tOtgruzka && (
          <button
            key={tOtgruzka.uni}
            onClick={() => navigateToModule(tOtgruzka.uni)}
            className="tile-primary tone-strong col-span-2 bg-module-inventory-bg text-module-inventory-text"
          >
            <div>
              <h2 className="tile-title-lg">{tOtgruzka.displayName}</h2>
              <p className="tile-subtext opacity-80">{tOtgruzka.description}</p>
            </div>
          </button>
        )}

        {/* 3. Подбор - Right bottom tile (orange) */}
        {tPodbor && (
          <button
            key={tPodbor.uni}
            onClick={() => navigateToModule(tPodbor.uni)}
            className="tile-primary tone-strong col-span-2 bg-module-picking-bg text-module-picking-text"
          >
            <div>
              <h2 className="tile-title-lg">{tPodbor.displayName}</h2>
              <p className="tile-subtext opacity-80">{tPodbor.description}</p>
            </div>
          </button>
        )}
      </div>

      {/* Row: Secondary tiles with accent colors from palette */}
      <div className="grid grid-cols-4 gap-1.5 md:gap-2 mt-3">
        {tVozvrat && (
          <button
            key={`${tVozvrat.uni}-small`}
            onClick={() => navigateToModule(tVozvrat.uni)}
            className="tile-secondary tone-medium tile-outline col-span-2 bg-surface-secondary border-borders-default"
          >
            <div>
              <h2 className="tile-title-sm" style={{ color: 'var(--color-accent-cyan)' }}>{tVozvrat.displayName}</h2>
              <p className="tile-subtext text-content-secondary">{tVozvrat.description}</p>
            </div>
          </button>
        )}

        {tPlacement && (
          <button
            key={`${tPlacement.uni}-small`}
            onClick={() => navigateToModule(tPlacement.uni)}
            className="tile-secondary tone-medium tile-outline col-span-2 bg-surface-secondary border-borders-default"
          >
            <div>
              <h2 className="tile-title-sm" style={{ color: 'var(--color-accent-green)' }}>{tPlacement.displayName}</h2>
              <p className="tile-subtext text-content-secondary">{tPlacement.description}</p>
            </div>
          </button>
        )}
      </div>

      {/* Secondary row: Инвентаризация (full-width neutral tile) */}
      {tInvent && (
        <div className="grid grid-cols-4 gap-1.5 md:gap-2 mt-3">
          <button
            key={`${tInvent.uni}-full`}
            onClick={() => navigateToModule(tInvent.uni)}
            className="tile-secondary tone-medium tile-outline col-span-4 bg-surface-secondary border-borders-default"
          >
            <div>
              <h2 className="tile-title-md text-content-primary">{tInvent.displayName}</h2>
              <p className="tile-subtext text-content-secondary">{tInvent.description}</p>
            </div>
          </button>
        </div>
      )}

      {/* Additional tiles with cycling accent colors */}
      {(secondaryTiles.length > 0 || tertiaryTiles.length > 0) && (
        <div className="grid grid-cols-2 gap-1.5 md:gap-2 mt-3">
            {[...secondaryTiles, ...tertiaryTiles].map((docType, index) => {
              // Cycling through accent colors: cyan, green, yellow, orange, pink
              const accentColors = [
                'var(--color-accent-cyan)',    // #4dd0e1
                'var(--color-accent-green)',   // #7ed321
                'var(--color-accent-yellow)',  // #e0b536
                'var(--color-brand-secondary)', // #d89668 orange
                'var(--color-brand-tertiary)',  // #f0a58a pink
              ];
              const accentColor = accentColors[index % accentColors.length];
              
              return (
                <button
                  key={docType.uni}
                  onClick={() => navigateToModule(docType.uni)}
                  className="tile-secondary tone-medium tile-outline bg-surface-secondary border-borders-default"
                >
                  <div>
                    <h2 className="tile-title-sm" style={{ color: accentColor }}>{docType.displayName}</h2>
                    <p className="tile-subtext text-content-secondary">{docType.description}</p>
                  </div>
                </button>
              );
            })}
        </div>
      )}

      {/* Empty state */}
      {docTypes.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl text-content-tertiary mb-2">Нет доступных типов документов</h3>
          <p className="text-sm text-content-tertiary opacity-80">
            Проверьте настройки подключения к серверу
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
