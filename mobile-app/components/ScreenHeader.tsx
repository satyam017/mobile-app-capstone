import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../context/PreferencesContext';
import { spacing } from '../constants/theme';

type ScreenHeaderProps = {
  onRightPress?: () => void;
  rightAccessibilityLabel?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
};

export function ScreenHeader({
  onRightPress,
  rightAccessibilityLabel = 'Open settings',
  rightIcon = 'settings-outline',
}: ScreenHeaderProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.header}>
      <View style={styles.side}>
        <Ionicons name="leaf" size={24} color={colors.primary} />
      </View>

      <Text
        style={[styles.brand, { color: colors.primary }]}
        accessibilityRole="header"
      >
        Mindful
      </Text>

      <View style={[styles.side, styles.sideRight]}>
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
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  side: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  brand: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
