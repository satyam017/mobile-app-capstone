import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../constants/theme';
import { showAlert } from '../utils/showAlert';

type TabKey = 'home' | 'progress' | 'favorites' | 'menu';

const TABS: {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  {
    key: 'progress',
    label: 'Progress',
    icon: 'stats-chart-outline',
    activeIcon: 'stats-chart',
  },
  {
    key: 'favorites',
    label: 'Favorites',
    icon: 'heart-outline',
    activeIcon: 'heart',
  },
  { key: 'menu', label: 'Menu', icon: 'menu-outline', activeIcon: 'menu' },
];

type BottomNavProps = {
  active?: TabKey;
};

/** Bottom tab bar matching the Mindful home design. */
export function BottomNav({ active = 'home' }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  const onPressTab = (key: TabKey) => {
    if (key === 'home') {
      return;
    }
    showAlert('Coming soon', `${TABS.find((t) => t.key === key)?.label} will be available in a later module.`);
  };

  return (
    <View
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}
      accessibilityRole="tablist"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            onPress={() => onPressTab(tab.key)}
            style={styles.tab}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={22}
              color={isActive ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.white,
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    gap: 2,
  },
  label: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
