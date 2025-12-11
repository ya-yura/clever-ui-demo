/**
 * 🧭 USE AUTO NAVIGATION
 * Хук для автоматической навигации с трекингом UX
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  autoNavigateAfterComplete,
  smartNavigate,
  getNextStep,
  buildBreadcrumbs,
  safeGoBack,
  NavigationHistory,
} from '@/utils/autoNavigation';

interface UseAutoNavigationOptions {
  docType?: string;
  docId?: string;
  trackNavigation?: boolean;
}

export function useAutoNavigation(options: UseAutoNavigationOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Track navigation history
  useEffect(() => {
    if (options.trackNavigation) {
      NavigationHistory.push(location.pathname);
    }
  }, [location.pathname, options.trackNavigation]);

  /**
   * Автоматическая навигация после завершения
   */
  const navigateAfterComplete = useCallback(async (
    skipPrompt: boolean = false,
    onBeforeNavigate?: () => void | Promise<void>
  ) => {
    if (!options.docType || !options.docId) {
      console.warn('docType and docId required for auto navigation');
      return;
    }

    await autoNavigateAfterComplete(
      options.docType,
      options.docId,
      navigate,
      {
        userId: user?.id,
        skipPrompt,
        onBeforeNavigate,
      }
    );
  }, [options.docType, options.docId, navigate, user]);

  /**
   * Умная навигация с трекингом
   */
  const navigateTo = useCallback((
    to: string,
    method: 'auto' | 'manual' | 'back' = 'manual',
    state?: any
  ) => {
    smartNavigate(
      location.pathname,
      to,
      navigate,
      {
        userId: user?.id,
        method,
        state,
      }
    );
  }, [location.pathname, navigate, user]);

  /**
   * Безопасная навигация назад
   */
  const goBack = useCallback((fallbackPath?: string) => {
    const previousPath = NavigationHistory.peek();
    
    if (previousPath) {
      navigateTo(previousPath, 'back');
    } else {
      safeGoBack(navigate, fallbackPath);
    }
  }, [navigate, navigateTo]);

  /**
   * Получить информацию о следующем шаге
   */
  const nextStep = options.docType ? getNextStep(options.docType) : null;

  /**
   * Получить breadcrumbs
   */
  const breadcrumbs = options.docType
    ? buildBreadcrumbs(options.docType, options.docId)
    : [];

  /**
   * Навигация к списку документов
   */
  const navigateToList = useCallback(() => {
    if (options.docType) {
      navigateTo(`/${options.docType}`, 'manual');
    } else {
      navigateTo('/', 'manual');
    }
  }, [options.docType, navigateTo]);

  /**
   * Навигация к документу
   */
  const navigateToDocument = useCallback((docId: string) => {
    if (options.docType) {
      navigateTo(`/${options.docType}/${docId}`, 'manual');
    }
  }, [options.docType, navigateTo]);

  return {
    // Основные функции
    navigateAfterComplete,
    navigateTo,
    goBack,
    navigateToList,
    navigateToDocument,

    // Информация
    nextStep,
    breadcrumbs,
    currentPath: location.pathname,
    previousPath: NavigationHistory.peek(),
    
    // История
    history: NavigationHistory.getHistory(),
  };
}

