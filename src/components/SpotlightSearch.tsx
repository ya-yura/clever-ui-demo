// === 📁 src/components/SpotlightSearch.tsx ===
// Spotlight-style global search (Ctrl+K / Cmd+K)

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/db';
import { Search, FileText, Package, MapPin, Clock, TrendingUp } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'document' | 'product' | 'cell' | 'recent';
  title: string;
  subtitle?: string;
  action: string;
  icon: React.ReactNode;
  score: number;
}

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpotlightSearch: React.FC<SpotlightSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search on query change
  useEffect(() => {
    if (!query.trim()) {
      loadRecents();
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const loadRecents = async () => {
    setLoading(true);
    try {
      // Load recent documents
      const docs = await db.universalDocuments
        .orderBy('updatedAt')
        .reverse()
        .limit(5)
        .toArray();

      const recentResults: SearchResult[] = docs.map(doc => ({
        id: doc.id,
        type: 'recent',
        title: doc.id,
        subtitle: doc.type || 'Документ',
        action: `/docs/${doc.type}/${doc.id}`,
        icon: <Clock size={20} />,
        score: 0,
      }));

      setResults(recentResults);
    } catch (error) {
      console.error('Failed to load recents:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    const normalized = searchQuery.toLowerCase().trim();
    const searchResults: SearchResult[] = [];

    try {
      // Search documents
      const docs = await db.universalDocuments.toArray();
      docs.forEach(doc => {
        const docIdMatch = doc.id.toLowerCase().includes(normalized);
        const typeMatch = doc.type?.toLowerCase().includes(normalized);
        const statusMatch = doc.status?.toLowerCase().includes(normalized);

        if (docIdMatch || typeMatch || statusMatch) {
          const score = docIdMatch ? 100 : typeMatch ? 50 : 20;
          searchResults.push({
            id: doc.id,
            type: 'document',
            title: doc.id,
            subtitle: `${doc.type || 'Документ'} • ${doc.status || 'new'}`,
            action: `/docs/${doc.type}/${doc.id}`,
            icon: <FileText size={20} className="text-brand-primary" />,
            score,
          });
        }
      });

      // Search products
      const products = await db.products.toArray();
      products.forEach(product => {
        const nameMatch = product.name.toLowerCase().includes(normalized);
        const barcodeMatch = product.barcode?.toLowerCase().includes(normalized);
        const skuMatch = product.sku?.toLowerCase().includes(normalized);

        if (nameMatch || barcodeMatch || skuMatch) {
          const score = barcodeMatch ? 100 : nameMatch ? 80 : 30;
          searchResults.push({
            id: product.id,
            type: 'product',
            title: product.name,
            subtitle: `${product.barcode || product.sku}`,
            action: `/products/${product.id}`,
            icon: <Package size={20} className="text-success" />,
            score,
          });
        }
      });

      // Search cells (if pattern matches cell format like A1-01)
      if (/^[A-Z]\d/i.test(normalized)) {
        searchResults.push({
          id: normalized.toUpperCase(),
          type: 'cell',
          title: normalized.toUpperCase(),
          subtitle: 'Ячейка склада',
          action: `/cells/${normalized.toUpperCase()}`,
          icon: <MapPin size={20} className="text-warning" />,
          score: 90,
        });
      }

      // Sort by score
      searchResults.sort((a, b) => b.score - a.score);
      setResults(searchResults.slice(0, 8));
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.action);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-primary rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border-2 border-brand-primary/20">
        {/* Search Input */}
        <div className="p-4 border-b border-separator flex items-center gap-3">
          <Search size={24} className="text-content-tertiary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск документов, товаров, ячеек..."
            className="flex-1 bg-transparent text-lg outline-none"
          />
          {loading && (
            <div className="animate-spin w-5 h-5 border-2 border-brand-primary rounded-full border-t-transparent" />
          )}
          <kbd className="px-2 py-1 text-xs bg-surface-tertiary rounded border border-separator">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {results.length === 0 && !loading && (
            <div className="p-8 text-center text-content-tertiary">
              {query ? 'Ничего не найдено' : 'Начните вводить для поиска'}
            </div>
          )}

          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full p-4 flex items-center gap-4 text-left transition-colors ${
                index === selectedIndex
                  ? 'bg-brand-primary/10 border-l-4 border-brand-primary'
                  : 'hover:bg-surface-secondary border-l-4 border-transparent'
              }`}
            >
              <div className="flex-shrink-0">{result.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{result.title}</div>
                {result.subtitle && (
                  <div className="text-sm text-content-tertiary truncate">
                    {result.subtitle}
                  </div>
                )}
              </div>
              {index === selectedIndex && (
                <kbd className="px-2 py-1 text-xs bg-surface-tertiary rounded border border-separator">
                  ↵
                </kbd>
              )}
            </button>
          ))}
        </div>

        {/* Footer hint */}
        {results.length > 0 && (
          <div className="p-3 border-t border-separator flex items-center justify-center gap-4 text-xs text-content-tertiary">
            <span><kbd>↑↓</kbd> Навигация</span>
            <span><kbd>↵</kbd> Выбрать</span>
            <span><kbd>ESC</kbd> Закрыть</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Hook to control Spotlight with keyboard shortcut
 */
export const useSpotlight = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  };
};










