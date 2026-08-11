import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../constants/theme';
import type { SessionUser } from '../types/auth';
import { clearSession, getSession } from '../utils/authStorage';

export default function HomeScreen() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      const session = await getSession();
      if (!active) {
        return;
      }

      if (!session) {
        router.replace('/login');
        return;
      }

      setUser(session);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await clearSession();
          router.replace('/login');
        },
      },
    ]);
  };

  if (loading || !user) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Ionicons name="leaf" size={22} color={colors.primary} />
          <Text style={styles.brand}>Mindful</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log out"
          onPress={handleLogout}
          hitSlop={8}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.greeting}>Hello, {user.username}!</Text>
        <Text style={styles.subtitle}>Find your calm today.</Text>
        <Text style={styles.welcome}>
          Welcome back to Mindful. You are successfully logged in.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 16,
    color: colors.textMuted,
  },
  welcome: {
    marginTop: spacing.lg,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
});
