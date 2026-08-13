import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spacing, type ThemeColors } from '../constants/theme';
import { useThemeColors } from '../context/ThemeContext';

type FormErrorBannerProps = {
  message: string | null;
  title?: string;
};

export function FormErrorBanner({
  message,
  title = 'Error',
}: FormErrorBannerProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!message) {
    return null;
  }

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={styles.banner}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    banner: {
      width: '100%',
      backgroundColor: colors.input,
      borderColor: colors.error,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginBottom: spacing.md,
    },
    title: {
      color: colors.error,
      fontWeight: '700',
      fontSize: 14,
      marginBottom: 2,
    },
    message: {
      color: colors.error,
      fontSize: 13,
      lineHeight: 18,
    },
  });
}
