export type AppPreferences = {
  darkMode: boolean;
  sound: boolean;
  meditationReminder: boolean;
  notifications: boolean;
  language: string;
};

export const DEFAULT_PREFERENCES: AppPreferences = {
  darkMode: false,
  sound: true,
  meditationReminder: true,
  notifications: false,
  language: 'English',
};
