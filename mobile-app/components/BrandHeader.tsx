import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spacing, type ThemeColors } from '../constants/theme';
import { useThemeColors } from '../context/ThemeContext';

type BrandHeaderProps = {
  title?: string;
  subtitle?: string;
};

export function BrandHeader({ title, subtitle }: BrandHeaderProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Ionicons name="leaf" size={36} color={colors.primary} />
      <Text style={styles.brand}>Mindful</Text>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    brand: {
      marginTop: spacing.sm,
      fontSize: 28,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 0.3,
    },
    title: {
      marginTop: spacing.md,
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      marginTop: spacing.xs,
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 18,
      paddingHorizontal: spacing.sm,
    },
  });
}
