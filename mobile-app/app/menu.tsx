import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '../components/BottomNav';
import { useThemeColors } from '../context/PreferencesContext';
import { spacing } from '../constants/theme';
import type { SessionUser } from '../types/auth';
import { clearSession, getSession } from '../utils/authStorage';
import { goBackOr } from '../utils/navigation';
import { showAlert } from '../utils/showAlert';

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href?: Href;
};

const MENU_ITEMS: MenuItem[] = [
  { label: 'Settings', icon: 'settings-outline', href: '/settings' as Href },
  { label: 'My Favorites', icon: 'heart-outline', href: '/favorites' as Href },
  {
    label: 'Daily Quote (API)',
    icon: 'chatbubble-ellipses-outline',
    href: '/quote' as Href,
  },
  {
    label: 'Daily Reminders',
    icon: 'time-outline',
    href: '/reminders' as Href,
  },
  {
    label: 'Notifications',
    icon: 'notifications-outline',
    href: '/notifications' as Href,
  },
  {
    label: 'Progress / Reports',
    icon: 'stats-chart-outline',
    href: '/progress' as Href,
  },
];

export default function MenuScreen() {
  const colors = useThemeColors();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    void (async () => {
      const session = await getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      setUser(session);
    })();
  }, []);

  const onPressItem = (item: MenuItem) => {
    if (item.href) {
      router.push(item.href);
    }
  };

  const handleLogout = () => {
    showAlert('Log Out', 'End your session and return to Login?', () => {
      void (async () => {
        await clearSession();
        router.replace('/login');
      })();
    });
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.screen }]}
      edges={['top']}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.divider },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => goBackOr()}
          style={styles.headerBtn}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>
          Menu
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.card, borderColor: colors.divider },
          ]}
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
            }}
            style={[styles.avatar, { backgroundColor: colors.input }]}
          />

          <Text style={[styles.hello, { color: colors.text }]}>
            Hello, {user?.username?.trim() || 'friend'}!
          </Text>
          <Text style={[styles.memberSince, { color: colors.textMuted }]}>
            Member since 2024
          </Text>
        </View>

        <View
          style={[
            styles.listCard,
            { backgroundColor: colors.card, borderColor: colors.divider },
          ]}
        >
          {MENU_ITEMS.map((item, index) => (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => onPressItem(item)}
              style={[
                styles.listRow,
                index < MENU_ITEMS.length - 1 && [
                  styles.listRowBorder,
                  { borderBottomColor: colors.divider },
                ],
              ]}
            >
              <View style={styles.listLeft}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
                <Text style={[styles.listLabel, { color: colors.text }]}>
                  {item.label}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log out"
          onPress={handleLogout}
          style={[
            styles.logoutBtn,
            {
              borderColor: colors.primary,
              backgroundColor: colors.card,
            },
          ]}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.primary} />
          <Text style={[styles.logoutText, { color: colors.primary }]}>
            Logout
          </Text>
        </Pressable>
      </ScrollView>

      <BottomNav active="menu" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  profileCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginBottom: spacing.md,
  },
  hello: {
    fontSize: 22,
    fontWeight: '700',
  },
  memberSince: {
    marginTop: 4,
    fontSize: 13,
  },
  listCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 16,
    minHeight: 56,
  },
  listRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
