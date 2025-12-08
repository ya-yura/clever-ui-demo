// === 📁 src/hooks/usePinnedDocuments.ts ===
// Hook for managing pinned (favorite) documents

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'pinnedDocuments';

export function usePinnedDocuments() {
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  // Load pinned IDs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        setPinnedIds(new Set(ids));
      }
    } catch (error) {
      console.error('Failed to load pinned documents:', error);
    }
  }, []);

  // Save pinned IDs to localStorage whenever they change
  const savePinnedIds = (ids: Set<string>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
    } catch (error) {
      console.error('Failed to save pinned documents:', error);
    }
  };

  const togglePin = (documentId: string) => {
    setPinnedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(documentId)) {
        newSet.delete(documentId);
      } else {
        newSet.add(documentId);
      }
      savePinnedIds(newSet);
      return newSet;
    });
  };

  const isPinned = (documentId: string): boolean => {
    return pinnedIds.has(documentId);
  };

  const pinDocument = (documentId: string) => {
    setPinnedIds(prev => {
      const newSet = new Set(prev);
      newSet.add(documentId);
      savePinnedIds(newSet);
      return newSet;
    });
  };

  const unpinDocument = (documentId: string) => {
    setPinnedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(documentId);
      savePinnedIds(newSet);
      return newSet;
    });
  };

  const clearAll = () => {
    setPinnedIds(new Set());
    savePinnedIds(new Set());
  };

  return {
    pinnedIds,
    isPinned,
    togglePin,
    pinDocument,
    unpinDocument,
    clearAll,
  };
}


