// === 📁 src/contexts/UXModeContext.tsx ===
// Context for UX Mode (Beginner/Professional)

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UXMode, UserPreferencesService } from '@/utils/userPreferences';

interface UXModeContextType {
  mode: UXMode;
  setMode: (mode: UXMode) => void;
  showTooltips: boolean;
  enableAnimations: boolean;
  compactMode: boolean;
  streamScanningDefault: boolean;
  toggleMode: () => void;
}

const UXModeContext = createContext<UXModeContextType | undefined>(undefined);

export const UXModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<UXMode>('beginner');
  const [preferences, setPreferences] = useState(UserPreferencesService.load());

  useEffect(() => {
    const prefs = UserPreferencesService.load();
    setModeState(prefs.uxMode);
    setPreferences(prefs);
  }, []);

  const setMode = (newMode: UXMode) => {
    UserPreferencesService.setUXMode(newMode);
    setModeState(newMode);
    setPreferences(UserPreferencesService.load());
  };

  const toggleMode = () => {
    const newMode = mode === 'beginner' ? 'professional' : 'beginner';
    setMode(newMode);
  };

  return (
    <UXModeContext.Provider
      value={{
        mode,
        setMode,
        showTooltips: preferences.showTooltips,
        enableAnimations: preferences.enableAnimations,
        compactMode: preferences.compactMode,
        streamScanningDefault: preferences.streamScanningDefault,
        toggleMode,
      }}
    >
      {children}
    </UXModeContext.Provider>
  );
};

export const useUXMode = (): UXModeContextType => {
  const context = useContext(UXModeContext);
  if (!context) {
    throw new Error('useUXMode must be used within UXModeProvider');
  }
  return context;
};
