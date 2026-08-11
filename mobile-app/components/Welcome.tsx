import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../constants/theme';

type WelcomeProps = {
  username?: string | null;
};

export function Welcome({ username }: WelcomeProps) {
  const name = username?.trim();

  return (
    <View style={styles.container} accessibilityRole="summary">
      <Text style={styles.greeting}>
        {name ? `Hello, ${name}!` : 'Welcome back!'}
      </Text>
      <Text style={styles.subtitle}>Find your calm today.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginTop: 4,
    marginBottom: 28,
  },
  greeting: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: '#8B9290',
  },
});
