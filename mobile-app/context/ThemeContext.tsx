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
import { getPreferences, savePreferences } from '../utils/preferencesStorage';

type ThemeContextValue = {
  ready: boolean;
  isDarkMode: boolean;
  colors: ThemeColors;
  setDarkMode: (value: boolean) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isDarkMode, setIsDarkModeState] = useState(false);

  useEffect(() => {
    void (async () => {
      const stored = await getPreferences();
      setIsDarkModeState(Boolean(stored.darkMode));
      setReady(true);
    })();
  }, []);

  const setDarkMode = useCallback(async (value: boolean) => {
    setIsDarkModeState(value);
    const stored = await getPreferences();
    await savePreferences({ ...stored, darkMode: value });
  }, []);

  const toggleTheme = useCallback(async () => {
    await setDarkMode(!isDarkMode);
  }, [isDarkMode, setDarkMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      ready,
      isDarkMode,
      colors: isDarkMode ? darkColors : lightColors,
      setDarkMode,
      toggleTheme,
    }),
    [ready, isDarkMode, setDarkMode, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

export function useThemeColors(): ThemeColors {
  const ctx = useContext(ThemeContext);
  return ctx?.colors ?? lightColors;
}
