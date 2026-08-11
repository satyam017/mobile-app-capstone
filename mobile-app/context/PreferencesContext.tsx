import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { darkColors, lightColors, type ThemeColors } from '../constants/theme';
import { DEFAULT_PREFERENCES, type AppPreferences } from '../types/preferences';
import { getPreferences, savePreferences } from '../utils/preferencesStorage';

type PreferencesContextValue = {
  ready: boolean;
  prefs: AppPreferences;
  colors: ThemeColors;
  darkMode: boolean;
  setPrefs: (next: AppPreferences) => void;
  updatePrefs: (partial: Partial<AppPreferences>) => Promise<void>;
  persistPrefs: (next?: AppPreferences) => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [prefs, setPrefs] = useState<AppPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    void (async () => {
      const stored = await getPreferences();
      setPrefs(stored);
      setReady(true);
    })();
  }, []);

  const persistPrefs = useCallback(
    async (next?: AppPreferences) => {
      const value = next ?? prefs;
      await savePreferences(value);
      setPrefs(value);
    },
    [prefs],
  );

  const updatePrefs = useCallback(async (partial: Partial<AppPreferences>) => {
    setPrefs((current) => {
      const next = { ...current, ...partial };
      void savePreferences(next);
      return next;
    });
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      ready,
      prefs,
      colors: prefs.darkMode ? darkColors : lightColors,
      darkMode: prefs.darkMode,
      setPrefs,
      updatePrefs,
      persistPrefs,
    }),
    [ready, prefs, updatePrefs, persistPrefs],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return ctx;
}

export function useThemeColors(): ThemeColors {
  const ctx = useContext(PreferencesContext);
  return ctx?.colors ?? lightColors;
}
