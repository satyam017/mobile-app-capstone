import { StyleSheet, Text, View } from 'react-native';
import { useMemo } from 'react';

import { spacing, type ThemeColors } from '../constants/theme';
import { useThemeColors } from '../context/ThemeContext';

type WelcomeProps = {
  username?: string | null;
};

export function Welcome({ username }: WelcomeProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
      color: colors.textMuted,
    },
  });
}
