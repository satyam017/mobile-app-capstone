import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../constants/storageKeys';
import { DEFAULT_PREFERENCES, type AppPreferences } from '../types/preferences';

export async function getPreferences(): Promise<AppPreferences> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.preferences);
  if (!raw) {
    return DEFAULT_PREFERENCES;
  }

  try {
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as AppPreferences) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(
  preferences: AppPreferences,
): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.preferences,
    JSON.stringify(preferences),
  );
}
