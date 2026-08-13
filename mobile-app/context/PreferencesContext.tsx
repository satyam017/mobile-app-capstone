import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { DEFAULT_PREFERENCES, type AppPreferences } from '../types/preferences';
import { getPreferences, savePreferences } from '../utils/preferencesStorage';
import { ThemeProvider, useTheme, useThemeColors } from './ThemeContext';
import type { ThemeColors } from '../constants/theme';

type PreferencesContextValue = {
  ready: boolean;
  prefs: AppPreferences;
  colors: ThemeColors;
  darkMode: boolean;
  setPrefs: (next: AppPreferences) => void;
  updatePrefs: (partial: Partial<AppPreferences>) => Promise<void>;
  persistPrefs: (next?: AppPreferences) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function PreferencesStateProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const [ready, setReady] = useState(false);
  const [prefs, setPrefs] = useState<AppPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    void (async () => {
      const stored = await getPreferences();
      setPrefs(stored);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    setPrefs((current) =>
      current.darkMode === theme.isDarkMode
        ? current
        : { ...current, darkMode: theme.isDarkMode },
    );
  }, [theme.isDarkMode]);

  const persistPrefs = useCallback(
    async (next?: AppPreferences) => {
      const value = next ?? prefs;
      await savePreferences(value);
      setPrefs(value);
      if (value.darkMode !== theme.isDarkMode) {
        await theme.setDarkMode(value.darkMode);
      }
    },
    [prefs, theme],
  );

  const updatePrefs = useCallback(
    async (partial: Partial<AppPreferences>) => {
      const next = { ...prefs, ...partial };
      setPrefs(next);
      await savePreferences(next);
      if (
        typeof partial.darkMode === 'boolean' &&
        partial.darkMode !== theme.isDarkMode
      ) {
        await theme.setDarkMode(partial.darkMode);
      }
    },
    [prefs, theme],
  );

  const value = useMemo<PreferencesContextValue>(
    () => ({
      ready: ready && theme.ready,
      prefs: { ...prefs, darkMode: theme.isDarkMode },
      colors: theme.colors,
      darkMode: theme.isDarkMode,
      setPrefs,
      updatePrefs,
      persistPrefs,
      toggleTheme: theme.toggleTheme,
    }),
    [ready, prefs, theme, updatePrefs, persistPrefs],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <PreferencesStateProvider>{children}</PreferencesStateProvider>
    </ThemeProvider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return ctx;
}

export { useThemeColors };
