import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../constants/storageKeys';
import { DEFAULT_REMINDERS, type Reminder } from '../types/reminders';
import { parseTimeLabel, toDateKey } from './reminderDate';

function normalizeReminder(value: Partial<Reminder>): Reminder | null {
  if (
    typeof value.id !== 'string' ||
    typeof value.activity !== 'string' ||
    typeof value.repeat !== 'string'
  ) {
    return null;
  }

  const dateKey = value.scheduledAt
    ? toDateKey(new Date(value.scheduledAt))
    : toDateKey(new Date());
  const timeLabel =
    typeof value.time === 'string' && value.time.trim()
      ? value.time
      : '08:00 AM';
  const scheduledAt =
    typeof value.scheduledAt === 'string' && value.scheduledAt
      ? value.scheduledAt
      : parseTimeLabel(timeLabel, dateKey).toISOString();

  const icon =
    value.icon === 'moon-outline' || value.icon === 'sunny-outline'
      ? value.icon
      : new Date(scheduledAt).getHours() >= 17
        ? 'moon-outline'
        : 'sunny-outline';

  return {
    id: value.id,
    time: timeLabel,
    scheduledAt,
    activity: value.activity,
    repeat:
      value.repeat === 'Every Day' ||
      value.repeat === 'Weekdays' ||
      value.repeat === 'Custom'
        ? value.repeat
        : 'Custom',
    icon,
    notificationIds: Array.isArray(value.notificationIds)
      ? value.notificationIds.filter((id) => typeof id === 'string')
      : undefined,
  };
}

export async function getReminders(): Promise<Reminder[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.reminders);
  if (!raw) {
    return DEFAULT_REMINDERS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Reminder>[];
    if (!Array.isArray(parsed)) {
      return DEFAULT_REMINDERS;
    }

    const reminders = parsed
      .map((item) => normalizeReminder(item))
      .filter((item): item is Reminder => Boolean(item));

    return reminders.length ? reminders : DEFAULT_REMINDERS;
  } catch {
    return DEFAULT_REMINDERS;
  }
}

export async function saveReminders(reminders: Reminder[]): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.reminders,
    JSON.stringify(reminders),
  );
}
