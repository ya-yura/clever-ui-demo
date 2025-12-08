// === 📁 src/onboarding/selector.ts ===
// Random selector for onboarding sets

import { SET1_SCREENS } from './set1/screens';
import { SET2_SCREENS } from './set2/screens';
import { SET3_SCREENS } from './set3/screens';
import { OnboardingScreen } from './set1/screens';

const ONBOARDING_SETS = [
  { id: 'set1', name: 'Professional', screens: SET1_SCREENS },
  { id: 'set2', name: 'Friendly', screens: SET2_SCREENS },
  { id: 'set3', name: 'Interactive', screens: SET3_SCREENS },
];

const STORAGE_KEY = 'onboardingSet';
const COMPLETED_KEY = 'onboardingCompleted';

/**
 * Get onboarding screens for user
 * Randomly selects set on first run, then remembers choice
 */
export function getOnboardingScreens(): {
  setId: string;
  setName: string;
  screens: OnboardingScreen[];
} {
  let setId = localStorage.getItem(STORAGE_KEY);

  // If no set assigned, pick random one
  if (!setId) {
    const randomIndex = Math.floor(Math.random() * ONBOARDING_SETS.length);
    const selectedSet = ONBOARDING_SETS[randomIndex];
    setId = selectedSet.id;
    localStorage.setItem(STORAGE_KEY, setId);
  }

  // Find set by ID
  const set = ONBOARDING_SETS.find(s => s.id === setId) || ONBOARDING_SETS[0];

  return {
    setId: set.id,
    setName: set.name,
    screens: set.screens,
  };
}

/**
 * Check if user has completed onboarding
 */
export function isOnboardingCompleted(): boolean {
  return localStorage.getItem(COMPLETED_KEY) === 'true';
}

/**
 * Mark onboarding as completed
 */
export function markOnboardingCompleted(): void {
  localStorage.setItem(COMPLETED_KEY, 'true');
}

/**
 * Reset onboarding (for testing)
 */
export function resetOnboarding(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(COMPLETED_KEY);
}

/**
 * Force specific onboarding set (for testing)
 */
export function setOnboardingSet(setId: 'set1' | 'set2' | 'set3'): void {
  localStorage.setItem(STORAGE_KEY, setId);
}

/**
 * Get all available sets
 */
export function getAllOnboardingSets() {
  return ONBOARDING_SETS;
}


