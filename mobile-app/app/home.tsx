import { Href, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '../components/BottomNav';
import { DailyMeditation } from '../components/DailyMeditation';
import { PopularMeditation } from '../components/PopularMeditation';
import { ScreenHeader } from '../components/ScreenHeader';
import { Welcome } from '../components/Welcome';
import { DAILY_MEDITATIONS, type Meditation } from '../constants/meditations';
import { colors, spacing } from '../constants/theme';
import type { SessionUser } from '../types/auth';
import { clearSession, getSession } from '../utils/authStorage';
import { showAlert } from '../utils/showAlert';

export default function HomeScreen() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load the logged-in session; redirect to Login if missing.
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

  const openMeditation = (meditation: Meditation) => {
    router.push(`/meditation/${meditation.id}` as Href);
  };

  const handleSettings = () => {
    showAlert('Log Out', 'Tap OK to end your session and return to Login.', () => {
      void (async () => {
        await clearSession();
        router.replace('/login');
      })();
    });
  };

  if (loading || !user) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top navigation bar */}
      <ScreenHeader
        onRightPress={handleSettings}
        rightAccessibilityLabel="Open settings and log out"
        rightIcon="settings-outline"
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Personalized welcome */}
        <Welcome username={user.username} />

        {/* Primary action */}
        <View style={styles.primaryActionWrap}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start today's meditation"
            onPress={() => openMeditation(DAILY_MEDITATIONS[0])}
            style={styles.primaryAction}
          >
            <Text style={styles.primaryActionText}>Start Today&apos;s Session</Text>
          </Pressable>
        </View>

        {/* Content sections */}
        <PopularMeditation onPressMeditation={openMeditation} />
        <DailyMeditation onPressMeditation={openMeditation} />
      </ScrollView>

      <BottomNav active="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  primaryActionWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  primaryAction: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
