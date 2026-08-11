export type ReminderRepeat = 'Every Day' | 'Weekdays' | 'Custom';

export type Reminder = {
  id: string;
  time: string;
  activity: string;
  repeat: ReminderRepeat;
  icon: 'sunny-outline' | 'moon-outline';
};

export const DEFAULT_REMINDERS: Reminder[] = [
  {
    id: 'morning',
    time: '08:00 AM',
    activity: 'Morning Meditation',
    repeat: 'Weekdays',
    icon: 'sunny-outline',
  },
  {
    id: 'evening',
    time: '09:30 PM',
    activity: 'Wind Down Routine',
    repeat: 'Every Day',
    icon: 'moon-outline',
  },
];
