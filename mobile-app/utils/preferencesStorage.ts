import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../constants/storageKeys';
import {
  DAILY_GOAL_MAX,
  DAILY_GOAL_MIN,
  DEFAULT_PREFERENCES,
  type AppPreferences,
} from '../types/preferences';

function normalizePreferences(
  value: Partial<AppPreferences>,
): AppPreferences {
  const merged = { ...DEFAULT_PREFERENCES, ...value };
  const goal = Number(merged.dailyGoalMinutes);
  const dailyGoalMinutes = Number.isFinite(goal)
    ? Math.min(DAILY_GOAL_MAX, Math.max(DAILY_GOAL_MIN, Math.round(goal)))
    : DEFAULT_PREFERENCES.dailyGoalMinutes;

  return {
    ...merged,
    dailyGoalMinutes,
  };
}

export async function getPreferences(): Promise<AppPreferences> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.preferences);
  if (!raw) {
    return DEFAULT_PREFERENCES;
  }

  try {
    return normalizePreferences(JSON.parse(raw) as Partial<AppPreferences>);
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(
  preferences: AppPreferences,
): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.preferences,
    JSON.stringify(normalizePreferences(preferences)),
  );
}
