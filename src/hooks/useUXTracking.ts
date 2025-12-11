/**
 * 📊 USE UX TRACKING
 * Хук для автоматического трекинга UX-метрик по паттернам Джеки Рида
 */

import { useEffect, useRef, useCallback } from 'react';
import { metricsCollector } from '../metrics/collector';

interface UseUXTrackingOptions {
  userId: string;
  screen: string;
  operationType?: string;
  documentId?: string;
}

/**
 * Автоматический трекинг времени фокуса на экране
 */
export function useScreenFocusTracking(options: UseUXTrackingOptions) {
  const startTimeRef = useRef<number>(Date.now());
  const interactionCountRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
    interactionCountRef.current = 0;

    return () => {
      const focusTime = Date.now() - startTimeRef.current;
      metricsCollector.trackScreenFocus({
        userId: options.userId,
        screen: options.screen,
        focusTime,
        interactionCount: interactionCountRef.current,
      });
    };
  }, [options.userId, options.screen]);

  const trackInteraction = useCallback(() => {
    interactionCountRef.current++;
  }, []);

  return { trackInteraction };
}

/**
 * Трекинг времени до первого скана
 */
export function useFirstScanTracking(options: UseUXTrackingOptions) {
  const startTimeRef = useRef<number>(Date.now());
  const trackedRef = useRef<boolean>(false);

  const trackFirstScan = useCallback(() => {
    if (trackedRef.current) return;
    
    const timeToFirstScan = Date.now() - startTimeRef.current;
    metricsCollector.trackFirstScanTime({
      userId: options.userId,
      documentId: options.documentId || '',
      operationType: options.operationType || 'scan',
      timeToFirstScan,
    });

    trackedRef.current = true;
  }, [options.userId, options.documentId, options.operationType]);

  return { trackFirstScan };
}

/**
 * Трекинг навигации
 */
export function useNavigationTracking(options: UseUXTrackingOptions) {
  const navigationStartRef = useRef<number>(Date.now());

  const trackNavigation = useCallback((to: string, method: 'auto' | 'manual' | 'back' = 'manual') => {
    const duration = Date.now() - navigationStartRef.current;
    
    metricsCollector.trackNavigation({
      userId: options.userId,
      from: options.screen,
      to,
      navigationMethod: method,
      duration,
    });

    navigationStartRef.current = Date.now();
  }, [options.userId, options.screen]);

  return { trackNavigation };
}

/**
 * Трекинг эффективности подсказок
 */
export function useHintTracking(options: UseUXTrackingOptions) {
  const hintShownTimeRef = useRef<number>(0);

  const trackHintShown = useCallback((hintType: 'micro_hint' | 'error_hint' | 'contextual', hintMessage: string) => {
    hintShownTimeRef.current = Date.now();
    
    metricsCollector.trackUXEvent({
      userId: options.userId,
      eventType: 'hint_shown',
      operationType: options.operationType,
      documentId: options.documentId,
      metadata: {
        hintType,
        hintMessage,
      },
    });
  }, [options.userId, options.operationType, options.documentId]);

  const trackHintAction = useCallback((hintMessage: string, hintType: 'micro_hint' | 'error_hint' | 'contextual') => {
    const timeToAction = hintShownTimeRef.current > 0 
      ? Date.now() - hintShownTimeRef.current 
      : undefined;

    metricsCollector.trackHintInteraction({
      userId: options.userId,
      hintType,
      hintMessage,
      operationType: options.operationType || 'unknown',
      actionTaken: true,
      timeToAction,
    });

    hintShownTimeRef.current = 0;
  }, [options.userId, options.operationType]);

  return { trackHintShown, trackHintAction };
}

/**
 * Трекинг паттерна ошибок
 */
export function useErrorTracking(options: UseUXTrackingOptions) {
  const errorStartTimeRef = useRef<Record<string, number>>({});

  const trackError = useCallback((errorType: string, guidanceProvided: boolean = true) => {
    errorStartTimeRef.current[errorType] = Date.now();

    metricsCollector.trackUXEvent({
      userId: options.userId,
      eventType: 'error_shown',
      operationType: options.operationType,
      documentId: options.documentId,
      metadata: {
        errorType,
        guidanceProvided,
      },
    });
  }, [options.userId, options.operationType, options.documentId]);

  const trackErrorResolution = useCallback((errorType: string, resolved: boolean = true) => {
    const startTime = errorStartTimeRef.current[errorType];
    const timeToResolve = startTime ? Date.now() - startTime : undefined;

    metricsCollector.trackErrorPattern({
      userId: options.userId,
      errorType,
      operationType: options.operationType || 'unknown',
      documentId: options.documentId,
      guidanceProvided: true,
      errorResolved: resolved,
      timeToResolve,
    });

    delete errorStartTimeRef.current[errorType];
  }, [options.userId, options.operationType, options.documentId]);

  return { trackError, trackErrorResolution };
}

/**
 * Комплексный трекинг UX-событий
 */
export function useUXTracking(options: UseUXTrackingOptions) {
  const screenFocus = useScreenFocusTracking(options);
  const firstScan = useFirstScanTracking(options);
  const navigation = useNavigationTracking(options);
  const hints = useHintTracking(options);
  const errors = useErrorTracking(options);

  const trackEvent = useCallback((
    eventType: 'hint_shown' | 'scan_success' | 'scan_error' | 'auto_navigation' | 
               'swipe_action' | 'progressive_disclosure' | 'micro_reward' | 'chunked_view',
    metadata?: Record<string, any>
  ) => {
    metricsCollector.trackUXEvent({
      userId: options.userId,
      eventType,
      operationType: options.operationType,
      documentId: options.documentId,
      metadata,
    });
  }, [options.userId, options.operationType, options.documentId]);

  return {
    ...screenFocus,
    ...firstScan,
    ...navigation,
    ...hints,
    ...errors,
    trackEvent,
  };
}

