import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../constants/storageKeys';
import { DEFAULT_REMINDERS, type Reminder } from '../types/reminders';

export async function getReminders(): Promise<Reminder[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.reminders);
  if (!raw) {
    return DEFAULT_REMINDERS;
  }

  try {
    const parsed = JSON.parse(raw) as Reminder[];
    return Array.isArray(parsed) ? parsed : DEFAULT_REMINDERS;
  } catch {
    return DEFAULT_REMINDERS;
  }
}

export async function saveReminders(reminders: Reminder[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.reminders, JSON.stringify(reminders));
}
