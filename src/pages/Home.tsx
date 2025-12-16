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
    <div ref={containerRef} className="space-y-1 max-w-md mx-auto px-2">
      {/* Главная сетка: 3 основные кнопки */}
      <div className="grid grid-cols-2 gap-1.5">
        {/* Приход - большая кнопка (2 ряда) */}
        {tPrihod && (
          <button
            onClick={() => navigateToModule(tPrihod.uni)}
            className="row-span-2 rounded-lg p-4 flex flex-col justify-between shadow-sm"
            style={{ backgroundColor: '#DAA320', color: '#715918', minHeight: '180px' }}
          >
            <div className="text-left">
              <h2 className="text-2xl font-bold mb-2">{tPrihod.displayName}</h2>
              <p className="text-xs opacity-80">Перемещение товаров между ячейками</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-normal text-white">{tPrihod.docsCount || 139}</div>
              <p className="text-xs">Документов:</p>
            </div>
          </button>
        )}

        {/* Остатки - верхняя правая */}
        {tInvent && (
          <button
            onClick={() => navigateToModule(tInvent.uni)}
            className="rounded-lg p-3 flex flex-col justify-between shadow-sm"
            style={{ backgroundColor: '#FEA079', color: '#8C5338', minHeight: '88px' }}
          >
            <div className="text-left">
              <h2 className="text-xl font-bold">{tInvent.displayName}</h2>
              <p className="text-xs opacity-80 mt-1">Перемещение товаров между ячейками</p>
            </div>
            <div className="text-right text-2xl font-normal text-white">{tInvent.docsCount || 73}</div>
          </button>
        )}

        {/* Подбор - нижняя правая */}
        {tPodbor && (
          <button
            onClick={() => navigateToModule(tPodbor.uni)}
            className="rounded-lg p-3 flex flex-col justify-between shadow-sm"
            style={{ backgroundColor: '#F3A361', color: '#8B5931', minHeight: '88px' }}
          >
            <div className="text-left">
              <h2 className="text-xl font-bold">{tPodbor.displayName}</h2>
              <p className="text-xs opacity-80 mt-1">Перемещение товаров между ячейками</p>
            </div>
            <div className="text-right text-2xl font-normal text-white">{tPodbor.docsCount || 11}</div>
          </button>
        )}
      </div>

      {/* Второстепенные кнопки */}
      <div className="grid grid-cols-2 gap-1.5 mt-1.5">
        {/* Учёт */}
        {docTypes.find(d => d.uni === 'Inventarizaciya' || d.displayName?.includes('Учёт')) && (
          <button
            onClick={() => navigateToModule(docTypes.find(d => d.uni === 'Inventarizaciya' || d.displayName?.includes('Учёт'))!.uni)}
            className="rounded-lg p-3 border border-gray-600 bg-surface-primary shadow-sm"
            style={{ minHeight: '62px' }}
          >
            <div className="text-left">
              <h2 className="text-base font-bold" style={{ color: '#86E0CB' }}>Учёт</h2>
              <div className="flex justify-between items-end mt-1">
                <p className="text-[8px] text-gray-400">Перемещение товаров<br/>между ячейками</p>
                <span className="text-lg text-gray-500">3</span>
              </div>
            </div>
          </button>
        )}

        {/* Документооборот */}
        {docTypes.find(d => d.displayName?.includes('Документ')) && (
          <button
            onClick={() => navigateToModule(docTypes.find(d => d.displayName?.includes('Документ'))!.uni)}
            className="rounded-lg p-3 border border-gray-600 bg-surface-primary shadow-sm"
            style={{ minHeight: '62px' }}
          >
            <div className="text-left">
              <h2 className="text-base font-bold" style={{ color: '#91EDC1' }}>Документооборот</h2>
              <div className="flex justify-between items-end mt-1">
                <p className="text-[8px] text-gray-400">Перемещение товаров<br/>между ячейками</p>
                <span className="text-lg text-gray-500">99</span>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Штрихкоды */}
      <div className="mt-1.5">
        <button
          onClick={() => navigate('/docs/SborShK')}
          className="w-full rounded-lg p-3 border border-gray-600 bg-surface-primary shadow-sm text-left"
          style={{ minHeight: '52px' }}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-normal text-gray-400">Штрихкоды</h2>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[8px] text-gray-400">Перемещение товаров между ячейками</p>
                <span className="text-lg text-gray-500 text-right block">101</span>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Перемещения */}
      <div className="mt-1.5">
        <button
          className="w-full rounded-lg p-3 border border-gray-600 bg-surface-primary shadow-sm text-left"
          style={{ minHeight: '80px' }}
        >
          <div>
            <h2 className="text-lg font-normal text-gray-400 mb-2">Перемещения</h2>
            <div className="flex justify-between">
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: '#F0E78D' }}>По складам</p>
                <p className="text-[8px] text-gray-400 mt-0.5">Перемещение товаров<br/>между ячейками</p>
                <span className="text-lg text-gray-500 block mt-1">72</span>
              </div>
              <div className="w-px bg-gray-600 mx-2"></div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: '#DEB88E' }}>По ячейкам</p>
                <p className="text-[8px] text-gray-400 mt-0.5">Перемещение товаров<br/>между ячейками</p>
                <span className="text-lg text-gray-500 block mt-1">1</span>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Остальные операции второстепенными мелкими кнопками */}
      {(secondaryTiles.length > 0 || tertiaryTiles.length > 0) && (
        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
          {[...secondaryTiles, ...tertiaryTiles]
            .filter(d => !['PrihodNaSklad', 'PodborZakaza', 'Inventarizaciya'].includes(d.uni))
            .slice(0, 6)
            .map((docType, index) => {
              const colors = ['#4dd0e1', '#7ed321', '#e0b536', '#d89668', '#f0a58a', '#91EDC1'];
              const color = colors[index % colors.length];
              
              return (
                <button
                  key={docType.uni}
                  onClick={() => navigateToModule(docType.uni)}
                  className="rounded-lg p-2.5 border border-gray-600 bg-surface-primary shadow-sm text-left"
                  style={{ minHeight: '48px' }}
                >
                  <h3 className="text-xs font-bold mb-1" style={{ color }}>{docType.displayName}</h3>
                  <div className="flex justify-between items-end">
                    <p className="text-[7px] text-gray-400 leading-tight">{docType.description?.slice(0, 30)}...</p>
                    <span className="text-sm text-gray-500">{docType.docsCount || 0}</span>
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
