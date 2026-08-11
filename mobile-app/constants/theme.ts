import { StyleSheet } from 'react-native';

export type ThemeColors = {
  primary: string;
  primaryDark: string;
  background: string;
  card: string;
  input: string;
  text: string;
  textMuted: string;
  border: string;
  divider: string;
  white: string;
  error: string;
  logout: string;
  navInactive: string;
  screen: string;
};

export const lightColors: ThemeColors = {
  primary: '#4A5D4E',
  primaryDark: '#2D4F3C',
  background: '#F8F9FA',
  card: '#FFFFFF',
  input: '#E8EBE9',
  text: '#1F1F1F',
  textMuted: '#7A7F7C',
  border: '#4A5D4E',
  divider: '#E6E8EA',
  white: '#FFFFFF',
  error: '#B00020',
  logout: '#A8483A',
  navInactive: '#9AA09E',
  screen: '#F5F6F5',
};

export const darkColors: ThemeColors = {
  primary: '#8FA894',
  primaryDark: '#A8C0AE',
  background: '#121412',
  card: '#1C1F1C',
  input: '#2A2E2A',
  text: '#F2F4F2',
  textMuted: '#A0A7A1',
  border: '#8FA894',
  divider: '#2E3330',
  white: '#FFFFFF',
  error: '#FF6B6B',
  logout: '#E07A6A',
  navInactive: '#7A807C',
  screen: '#121412',
};

export const colors = lightColors;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  button: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: colors.white,
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.input,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.md,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
