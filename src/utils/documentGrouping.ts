// === 📁 src/utils/documentGrouping.ts ===
// Utilities for grouping documents by date

import { UniversalDocument } from '@/types/document';

export type DateGroup = 
  | 'favorites'   // Закреплённые
  | 'today'       // Сегодня
  | 'yesterday'   // Вчера
  | 'thisWeek'    // Эта неделя
  | 'older';      // Старые

export interface GroupedDocuments {
  group: DateGroup;
  label: string;
  documents: UniversalDocument[];
}

/**
 * Group labels for UI
 */
export const DATE_GROUP_LABELS: Record<DateGroup, string> = {
  favorites: '⭐ Фавориты',
  today: '📅 Сегодня',
  yesterday: '📆 Вчера',
  thisWeek: '📋 Эта неделя',
  older: '📂 Старые',
};

/**
 * Determine which date group a document belongs to
 */
export function getDateGroup(document: UniversalDocument): DateGroup {
  // Check if pinned/favorite
  if (document.isPinned) {
    return 'favorites';
  }

  const now = new Date();
  const docDate = new Date(document.updatedAt);
  
  // Reset time to midnight for accurate day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - now.getDay()); // Start of this week (Sunday)
  
  const docDay = new Date(docDate.getFullYear(), docDate.getMonth(), docDate.getDate());
  
  // Today
  if (docDay.getTime() === today.getTime()) {
    return 'today';
  }
  
  // Yesterday
  if (docDay.getTime() === yesterday.getTime()) {
    return 'yesterday';
  }
  
  // This week
  if (docDay >= weekStart && docDay < today) {
    return 'thisWeek';
  }
  
  // Older
  return 'older';
}

/**
 * Group documents by date
 * @param documents - Array of documents to group
 * @returns Array of grouped documents with labels
 */
export function groupDocumentsByDate(documents: UniversalDocument[]): GroupedDocuments[] {
  // Create groups map
  const groupsMap = new Map<DateGroup, UniversalDocument[]>();
  
  // Initialize all groups
  const allGroups: DateGroup[] = ['favorites', 'today', 'yesterday', 'thisWeek', 'older'];
  allGroups.forEach(group => groupsMap.set(group, []));
  
  // Distribute documents into groups
  documents.forEach(doc => {
    const group = getDateGroup(doc);
    groupsMap.get(group)?.push(doc);
  });
  
  // Convert to array and filter empty groups
  const result: GroupedDocuments[] = allGroups
    .map(group => ({
      group,
      label: DATE_GROUP_LABELS[group],
      documents: groupsMap.get(group) || [],
    }))
    .filter(item => item.documents.length > 0);
  
  return result;
}

/**
 * Sort documents within each group (by updatedAt, descending)
 */
export function sortDocumentsInGroups(groups: GroupedDocuments[]): GroupedDocuments[] {
  return groups.map(group => ({
    ...group,
    documents: [...group.documents].sort((a, b) => b.updatedAt - a.updatedAt),
  }));
}


