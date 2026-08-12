export type ReminderRepeat = 'Every Day' | 'Weekdays' | 'Custom';

export type Reminder = {
  id: string;
  time: string;
  scheduledAt: string;
  activity: string;
  repeat: ReminderRepeat;
  icon: 'sunny-outline' | 'moon-outline';
  notificationIds?: string[];
};

export const DEFAULT_REMINDERS: Reminder[] = [
  {
    id: 'morning',
    time: '08:00 AM',
    scheduledAt: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      8,
      0,
      0,
      0,
    ).toISOString(),
    activity: 'Morning Meditation',
    repeat: 'Weekdays',
    icon: 'sunny-outline',
  },
  {
    id: 'evening',
    time: '09:30 PM',
    scheduledAt: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      21,
      30,
      0,
      0,
    ).toISOString(),
    activity: 'Wind Down Routine',
    repeat: 'Every Day',
    icon: 'moon-outline',
  },
];
