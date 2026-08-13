import { Ionicons } from '@expo/vector-icons';
import { Href, router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
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
import { DAILY_MEDITATIONS, type Meditation } from '../constants/meditations';
import { spacing, type ThemeColors } from '../constants/theme';
import { useThemeColors } from '../context/PreferencesContext';
import type { PracticeSession } from '../types/progress';
import { getSession } from '../utils/authStorage';
import { goBackOr } from '../utils/navigation';
import {
  ProgressStorageError,
  buildProgressSummary,
  getPracticeHistory,
  type ProgressSummary,
} from '../utils/progressStorage';
import { showAlert } from '../utils/showAlert';

export default function ProgressScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await getSession();
      if (!session) {
        router.replace('/login');
        return;
      }

      const history = await getPracticeHistory();
      setSummary(buildProgressSummary(history));
    } catch (err) {
      const message =
        err instanceof ProgressStorageError
          ? err.message
          : 'Unable to load My Progress. Please try again.';
      setError(message);
      setSummary(null);
      showAlert('Progress error', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProgress();
    }, [loadProgress]),
  );

  const pendingToday: Meditation[] = useMemo(() => {
    if (!summary) {
      return DAILY_MEDITATIONS;
    }
    return DAILY_MEDITATIONS.filter(
      (item) => !summary.completedMeditationIdsToday.includes(item.id),
    );
  }, [summary]);

  const maxWeekMinutes = Math.max(1, ...(summary?.weeklyMinutes ?? [1]));

  if (loading && !summary) {
    return (
      <View style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading your progress…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => goBackOr()}
          style={styles.headerBtn}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>My Progress</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          onPress={() => router.push('/settings' as Href)}
          style={styles.headerBtn}
        >
          <Ionicons name="settings-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      {error && !summary ? (
        <View style={styles.centered}>
          <Ionicons
            name="alert-circle-outline"
            size={36}
            color={colors.logout}
          />
          <Text style={styles.errorTitle}>Couldn’t load progress</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void loadProgress()}
            style={styles.retryBtn}
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statsRow}>
            {[
              {
                label: 'Sessions',
                value: String(summary?.totalSessions ?? 0),
                icon: 'leaf-outline' as const,
              },
              {
                label: 'Minutes',
                value: String(summary?.totalMinutes ?? 0),
                icon: 'time-outline' as const,
              },
              {
                label: 'Day Streak',
                value: String(summary?.streakDays ?? 0),
                icon: 'flame-outline' as const,
              },
            ].map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Ionicons name={stat.icon} size={18} color={colors.primary} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Activity</Text>
            <Text style={styles.cardSub}>
              {summary?.weekRangeLabel ?? 'This week'}
            </Text>
            <View style={styles.bars}>
              {(summary?.weeklyMinutes ?? [0, 0, 0, 0, 0, 0, 0]).map(
                (minutes, index) => {
                  const height =
                    minutes <= 0
                      ? 6
                      : Math.max(
                          10,
                          Math.round((minutes / maxWeekMinutes) * 90),
                        );
                  return (
                    <View key={`${index}-${minutes}`} style={styles.barCol}>
                      <Text style={styles.barValue}>
                        {minutes > 0 ? minutes : ''}
                      </Text>
                      <View
                        style={[
                          styles.bar,
                          {
                            height,
                            backgroundColor:
                              minutes > 0 ? colors.primary : colors.divider,
                          },
                        ]}
                      />

                      <Text style={styles.barLabel}>
                        {summary?.weekLabels[index] ?? ''}
                      </Text>
                    </View>
                  );
                },
              )}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Goal</Text>
            <Text style={styles.cardSub}>
              {summary?.weeklyGoalMinutes ?? 60} minutes this week
            </Text>
            <View style={styles.goalRing}>
              <Text style={styles.goalPct}>
                {summary?.weeklyGoalPercent ?? 0}%
              </Text>
              <Text style={styles.goalCaption}>Completed</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {(summary?.recentSessions?.length ?? 0) === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No sessions yet</Text>
              <Text style={styles.emptyBody}>
                Start a meditation from Home. Completed time is saved here
                automatically.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace('/home' as Href)}
                style={styles.retryBtn}
              >
                <Text style={styles.retryText}>Go to Home</Text>
              </Pressable>
            </View>
          ) : (
            summary?.recentSessions.map((item) => (
              <SessionRow
                key={item.id}
                item={item}
                colors={colors}
                styles={styles}
              />
            ))
          )}

          {pendingToday.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Pending Today</Text>
              {pendingToday.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Start ${item.title}`}
                  onPress={() => router.push(`/meditation/${item.id}` as Href)}
                  style={styles.activityRow}
                >
                  <View style={[styles.statusDot, styles.pendingDot]}>
                    <Ionicons name="play" size={12} color={colors.text} />
                  </View>
                  <View style={styles.activityText}>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    <Text style={styles.activityMeta}>
                      Pending • {item.durationMinutes} min
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>
              ))}
            </>
          ) : null}
        </ScrollView>
      )}

      <BottomNav active="progress" />
    </SafeAreaView>
  );
}

function SessionRow({
  item,
  colors,
  styles,
}: {
  item: PracticeSession;
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
}) {
  const when = new Date(item.completedAt);
  const label = Number.isNaN(when.getTime())
    ? 'Unknown time'
    : when.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

  return (
    <View style={styles.activityRow}>
      <View style={[styles.statusDot, styles.doneDot]}>
        <Ionicons name="checkmark" size={14} color={colors.white} />
      </View>
      <View style={styles.activityText}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activityMeta}>
          {item.status === 'completed' ? 'Completed' : 'Partial'} •{' '}
          {item.durationMinutes} min • {label}
        </Text>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.screen,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
      gap: 10,
    },
    loadingText: {
      color: colors.textMuted,
      marginTop: 8,
    },
    header: {
      height: 54,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
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
      color: colors.text,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xl,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: spacing.md,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
      padding: 12,
      alignItems: 'center',
      gap: 4,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textMuted,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    cardSub: {
      marginTop: 2,
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: spacing.md,
    },
    bars: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: 120,
    },
    barCol: {
      alignItems: 'center',
      gap: 4,
      flex: 1,
    },
    barValue: {
      fontSize: 10,
      color: colors.textMuted,
      minHeight: 12,
    },
    bar: {
      width: 14,
      borderRadius: 8,
    },
    barLabel: {
      fontSize: 11,
      color: colors.textMuted,
    },
    goalRing: {
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    goalPct: {
      fontSize: 36,
      fontWeight: '700',
      color: colors.primary,
    },
    goalCaption: {
      marginTop: 4,
      fontSize: 13,
      color: colors.textMuted,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
      marginTop: 4,
    },
    activityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
      padding: spacing.md,
      marginBottom: 10,
    },
    statusDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    doneDot: {
      backgroundColor: colors.primary,
    },
    pendingDot: {
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    activityText: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    activityMeta: {
      marginTop: 2,
      fontSize: 12,
      color: colors.textMuted,
    },
    emptyCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
      padding: spacing.lg,
      alignItems: 'center',
      marginBottom: spacing.md,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    emptyBody: {
      textAlign: 'center',
      color: colors.textMuted,
      lineHeight: 20,
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    errorBody: {
      textAlign: 'center',
      color: colors.textMuted,
      lineHeight: 20,
    },
    retryBtn: {
      marginTop: 8,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: 999,
      paddingHorizontal: 18,
      paddingVertical: 10,
    },
    retryText: {
      color: colors.primary,
      fontWeight: '700',
    },
  });
}
