import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '../components/BottomNav';
import { ScreenHeader } from '../components/ScreenHeader';
import { spacing, type ThemeColors } from '../constants/theme';
import { useThemeColors } from '../context/PreferencesContext';
import { getSession } from '../utils/authStorage';
import {
  fetchDailyQuote,
  QuoteApiError,
  type DailyQuote,
} from '../utils/quoteApi';
import { showAlert } from '../utils/showAlert';

export default function QuoteScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [quote, setQuote] = useState<DailyQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const loadQuote = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await getSession();
      if (!session) {
        router.replace('/login');
        return;
      }

      const next = await fetchDailyQuote();
      setQuote(next);
      setUpdatedAt(new Date().toLocaleTimeString());
    } catch (err) {
      const message =
        err instanceof QuoteApiError
          ? err.message
          : 'Unable to fetch a quote right now.';
      setError(message);
      setQuote(null);
      showAlert('Quote API Error', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQuote();
  }, [loadQuote]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        onRightPress={() => router.push('/settings' as Href)}
        rightAccessibilityLabel="Open settings"
      />

      <View style={styles.content}>
        <Text style={styles.eyebrow}>Daily Quote</Text>
        <Text style={styles.intro}>
          A moment of reflection drawn from an external quote API.
        </Text>

        <View style={styles.card}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.loadingText}>Fetching quote…</Text>
            </View>
          ) : error ? (
            <View style={styles.loadingBox}>
              <Ionicons
                name="cloud-offline-outline"
                size={32}
                color={colors.logout}
              />

              <Text style={styles.errorTitle}>Couldn’t load quote</Text>
              <Text style={styles.errorBody}>{error}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.quoteText}>“{quote?.content}”</Text>
              <Text style={styles.author}>{quote?.author?.toUpperCase()}</Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                  Updated from Daily Quote API
                  {updatedAt ? ` · ${updatedAt}` : ''}
                </Text>
              </View>
            </>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refresh quote"
          onPress={() => void loadQuote()}
          style={styles.refreshBtn}
          disabled={loading}
        >
          <Ionicons name="refresh" size={18} color={colors.white} />
          <Text style={styles.refreshText}>
            {loading ? 'Refreshing…' : 'Refresh Quote'}
          </Text>
        </Pressable>
      </View>

      <BottomNav active="home" />
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.screen,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
    },
    eyebrow: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    intro: {
      marginTop: 8,
      marginBottom: spacing.lg,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textMuted,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
      padding: spacing.lg,
      minHeight: 220,
      justifyContent: 'center',
    },
    loadingBox: {
      alignItems: 'center',
      gap: 10,
      paddingVertical: spacing.lg,
    },
    loadingText: {
      color: colors.textMuted,
    },
    errorTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    errorBody: {
      textAlign: 'center',
      color: colors.textMuted,
      lineHeight: 20,
    },
    quoteText: {
      fontSize: 22,
      lineHeight: 32,
      fontWeight: '600',
      color: colors.text,
    },
    author: {
      marginTop: spacing.lg,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.textMuted,
    },
    statusRow: {
      marginTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#3B82F6',
    },
    statusText: {
      flex: 1,
      fontSize: 12,
      color: colors.textMuted,
    },
    refreshBtn: {
      marginTop: spacing.lg,
      backgroundColor: colors.primaryDark,
      borderRadius: 999,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    refreshText: {
      color: colors.white,
      fontWeight: '700',
      fontSize: 15,
    },
  });
}
