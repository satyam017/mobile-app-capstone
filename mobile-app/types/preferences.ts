export type AppPreferences = {
  darkMode: boolean;
  sound: boolean;
  meditationReminder: boolean;
  notifications: boolean;
  language: string;
  dailyGoalMinutes: number;
};

export const DEFAULT_PREFERENCES: AppPreferences = {
  darkMode: false,
  sound: true,
  meditationReminder: true,
  notifications: false,
  language: 'English',
  dailyGoalMinutes: 10,
};

export const LANGUAGE_OPTIONS = ['English', 'Español', 'Français'] as const;

export const DAILY_GOAL_MIN = 5;
export const DAILY_GOAL_MAX = 60;
