import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Reminder } from '../types/reminders';
import { combineDateAndTime, toDateKey } from './reminderDate';
import { getReminders, saveReminders } from './remindersStorage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type NotificationPermissionStatus =
  | 'granted'
  | 'denied'
  | 'undetermined'
  | 'unsupported';

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  if (Platform.OS === 'web') {
    return 'unsupported';
  }

  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.granted) {
    return 'granted';
  }
  if (permissions.status === 'denied') {
    return 'denied';
  }
  return 'undetermined';
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return requested.granted;
}

function buildTriggers(
  reminder: Reminder,
): Notifications.NotificationTriggerInput[] {
  const scheduled = new Date(reminder.scheduledAt);
  const hour = scheduled.getHours();
  const minute = scheduled.getMinutes();

  if (reminder.repeat === 'Every Day') {
    return [
      {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    ];
  }

  if (reminder.repeat === 'Weekdays') {
    return [2, 3, 4, 5, 6].map((weekday) => ({
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday,
      hour,
      minute,
    }));
  }

  const triggerDate = new Date(reminder.scheduledAt);
  if (triggerDate.getTime() <= Date.now()) {
    return [];
  }

  return [
    {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  ];
}

export async function scheduleReminderNotifications(
  reminder: Reminder,
): Promise<string[]> {
  if (Platform.OS === 'web') {
    return [];
  }

  const granted = await requestNotificationPermissions();
  if (!granted) {
    return [];
  }

  const triggers = buildTriggers(reminder);
  if (!triggers.length) {
    return [];
  }

  const ids: string[] = [];

  for (const item of triggers) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Mindful Reminder',
        body: `${reminder.activity} at ${reminder.time}`,
        sound: true,
      },
      trigger: item,
    });
    ids.push(id);
  }

  return ids;
}

export async function cancelReminderNotifications(
  notificationIds?: string[],
): Promise<void> {
  if (Platform.OS === 'web' || !notificationIds?.length) {
    return;
  }

  await Promise.all(
    notificationIds.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id),
    ),
  );
}

export async function rescheduleReminderNotifications(
  reminder: Reminder,
): Promise<string[]> {
  await cancelReminderNotifications(reminder.notificationIds);
  return scheduleReminderNotifications(reminder);
}

export async function sendTestNotification(
  body = 'Time for a short mindful breath. Your practice is waiting.',
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const granted = await requestNotificationPermissions();
  if (!granted) {
    return false;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Mindful Notification',
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });

  return true;
}

export function buildReminderSchedule(
  dateKey: string,
  timeValue: Date,
): { time: string; scheduledAt: string; icon: Reminder['icon'] } {
  const scheduledAt = combineDateAndTime(dateKey, timeValue);
  const time = scheduledAt.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return {
    time,
    scheduledAt: scheduledAt.toISOString(),
    icon: scheduledAt.getHours() >= 17 ? 'moon-outline' : 'sunny-outline',
  };
}

export function reminderDateKey(reminder: Reminder): string {
  return toDateKey(new Date(reminder.scheduledAt));
}

export async function clearAllScheduledReminderNotifications(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const reminders = await getReminders();
  await Promise.all(
    reminders.map((item) => cancelReminderNotifications(item.notificationIds)),
  );

  await saveReminders(
    reminders.map((item) => ({ ...item, notificationIds: [] })),
  );
}

export async function rescheduleAllStoredReminders(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const granted = await requestNotificationPermissions();
  if (!granted) {
    return;
  }

  const reminders = await getReminders();
  const rescheduled = await Promise.all(
    reminders.map(async (item) => ({
      ...item,
      notificationIds: await scheduleReminderNotifications(item),
    })),
  );

  await saveReminders(rescheduled);
}

export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  if (!enabled) {
    await clearAllScheduledReminderNotifications();
    return;
  }

  await rescheduleAllStoredReminders();
}
