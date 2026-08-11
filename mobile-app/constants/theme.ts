import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#4A5D4E',
  primaryDark: '#2D4F3C',
  background: '#F3F4F3',
  card: '#FFFFFF',
  input: '#E8EBE9',
  text: '#1F1F1F',
  textMuted: '#7A7F7C',
  border: '#4A5D4E',
  divider: '#E2E5E3',
  white: '#FFFFFF',
  error: '#B00020',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

/** Shared styles for consistent layout across screens (Lab Task 1). */
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
