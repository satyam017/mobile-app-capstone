import { Href, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '../components/BottomNav';
import { DailyMeditation } from '../components/DailyMeditation';
import { PopularMeditation } from '../components/PopularMeditation';
import { ScreenHeader } from '../components/ScreenHeader';
import { Welcome } from '../components/Welcome';
import type { Meditation } from '../constants/meditations';
import { spacing } from '../constants/theme';
import { useThemeColors } from '../context/PreferencesContext';
import type { SessionUser } from '../types/auth';
import { getSession } from '../utils/authStorage';

/**
 * Mindful Home Screen — layout matches evidence/userStories-homeScreen-evidence.png
 * Header → Welcome → Popular Meditations → Daily Meditations → Bottom nav
 */
export default function HomeScreen() {
  const colors = useThemeColors();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session username from AsyncStorage; gate access if not logged in.
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

  const openSettings = () => {
    router.push('/settings' as Href);
  };

  if (loading || !user) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.screen }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.screen }]}
      edges={['top']}
    >
      {/* Top bar: leaf + Mindful + settings gear */}
      <ScreenHeader
        onRightPress={openSettings}
        rightAccessibilityLabel="Open settings"
        rightIcon="settings-outline"
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Username comes from AsyncStorage session — not hard-coded */}
        <Welcome username={user.username} />

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
  },
  flex: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
});
