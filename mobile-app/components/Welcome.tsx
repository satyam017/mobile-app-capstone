import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../constants/theme';

type WelcomeProps = {
  username?: string | null;
};

/** Personalized greeting for the logged-in user. */
export function Welcome({ username }: WelcomeProps) {
  const displayName = username?.trim() || 'friend';
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={styles.container} accessibilityRole="summary">
      <Text style={styles.greeting}>
        Hello, {displayName}!{' '}
        <Text accessibilityLabel="wave">👋</Text>
      </Text>
      <Text style={styles.subtitle}>Find your calm today.</Text>
      <Text style={styles.support}>
        {timeGreeting} — welcome back. Take a moment for yourself today.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 16,
    color: colors.textMuted,
  },
  support: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
