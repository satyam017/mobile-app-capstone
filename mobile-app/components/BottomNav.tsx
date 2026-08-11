import { Ionicons } from '@expo/vector-icons';
import { Href, router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '../context/PreferencesContext';

type TabKey = 'home' | 'progress' | 'favorites' | 'menu';

const TABS: {
  key: TabKey;
  label: string;
  href: Href;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    key: 'home',
    label: 'Home',
    href: '/home' as Href,
    icon: 'home-outline',
    activeIcon: 'home',
  },
  {
    key: 'progress',
    label: 'Progress',
    href: '/progress' as Href,
    icon: 'stats-chart-outline',
    activeIcon: 'stats-chart',
  },
  {
    key: 'favorites',
    label: 'Favorites',
    href: '/favorites' as Href,
    icon: 'heart-outline',
    activeIcon: 'heart',
  },
  {
    key: 'menu',
    label: 'Menu',
    href: '/menu' as Href,
    icon: 'menu-outline',
    activeIcon: 'menu',
  },
];

type BottomNavProps = {
  active?: TabKey;
};

export function BottomNav({ active }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const colors = useThemeColors();

  const resolvedActive: TabKey =
    active ??
    (pathname.includes('progress')
      ? 'progress'
      : pathname.includes('favorites')
        ? 'favorites'
        : pathname.includes('menu')
          ? 'menu'
          : 'home');

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: colors.card,
          borderTopColor: colors.divider,
        },
      ]}
      accessibilityRole="tablist"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === resolvedActive;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            onPress={() => {
              if (!isActive) {
                router.replace(tab.href);
              }
            }}
            style={styles.tab}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={22}
              color={isActive ? colors.primary : colors.navInactive}
            />

            <Text
              style={[
                styles.label,
                { color: isActive ? colors.primary : colors.navInactive },
                isActive && styles.labelActive,
              ]}
            >
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
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  labelActive: {
    fontWeight: '700',
  },
});
