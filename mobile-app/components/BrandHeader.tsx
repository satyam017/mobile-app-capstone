import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../constants/theme';

type BrandHeaderProps = {
  title?: string;
  subtitle?: string;
};

export function BrandHeader({ title, subtitle }: BrandHeaderProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="leaf" size={36} color={colors.primary} />
      <Text style={styles.brand}>Mindful</Text>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
