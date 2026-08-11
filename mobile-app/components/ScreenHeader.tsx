import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../constants/theme';

type ScreenHeaderProps = {
  /** Optional right-side action (defaults to settings gear). */
  onRightPress?: () => void;
  rightAccessibilityLabel?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
};

/** Top app bar with Mindful branding and a settings action. */
export function ScreenHeader({
  onRightPress,
  rightAccessibilityLabel = 'Settings',
  rightIcon = 'settings-outline',
}: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow} accessibilityRole="header">
        <Ionicons name="leaf" size={22} color={colors.primary} />
        <Text style={styles.brand}>Mindful</Text>
      </View>

      {onRightPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={rightAccessibilityLabel}
          onPress={onRightPress}
          hitSlop={10}
          style={styles.iconButton}
        >
          <Ionicons name={rightIcon} size={24} color={colors.text} />
        </Pressable>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brand: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 44,
    height: 44,
  },
});
