import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getMeditationById } from '../../../constants/meditations';
import { spacing, type ThemeColors } from '../../../constants/theme';
import { usePreferences } from '../../../context/PreferencesContext';
import { goBackOr } from '../../../utils/navigation';
import {
  ProgressStorageError,
  recordPracticeSession,
} from '../../../utils/progressStorage';
import { playSoftChime } from '../../../utils/sound';
import { showAlert, showConfirm } from '../../../utils/showAlert';

function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function MeditationSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { prefs, colors } = usePreferences();
  const meditation = useMemo(
    () => (typeof id === 'string' ? getMeditationById(id) : undefined),
    [id],
  );

  const totalSeconds = (meditation?.durationMinutes ?? 0) * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [playing, setPlaying] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const completedRef = useRef(false);
  const savedRef = useRef(false);
  const remainingRef = useRef(totalSeconds);

  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  useEffect(() => {
    setRemaining(totalSeconds);
    remainingRef.current = totalSeconds;
    setPlaying(true);
    setCompleted(false);
    completedRef.current = false;
    savedRef.current = false;
  }, [totalSeconds]);

  useEffect(() => {
    if (!playing || completed) {
      return;
    }

    const timer = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          if (!completedRef.current) {
            completedRef.current = true;
            setCompleted(true);
            setPlaying(false);
          }
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [playing, completed]);

  const savePractice = async (status: 'completed' | 'partial') => {
    if (!meditation || savedRef.current) {
      return false;
    }

    const practicedSeconds = Math.max(0, totalSeconds - remainingRef.current);
    const practicedMinutes = Math.max(
      status === 'completed' ? meditation.durationMinutes : 0,
      Math.floor(practicedSeconds / 60),
    );

    if (practicedMinutes <= 0) {
      return false;
    }

    setSaving(true);
    try {
      await recordPracticeSession({
        meditationId: meditation.id,
        title: meditation.title,
        durationMinutes:
          status === 'completed'
            ? meditation.durationMinutes
            : practicedMinutes,
        plannedMinutes: meditation.durationMinutes,
        status,
      });
      savedRef.current = true;
      return true;
    } catch (error) {
      const message =
        error instanceof ProgressStorageError
          ? error.message
          : 'Something went wrong while saving your session.';
      showAlert('Could not save progress', message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!completed || !meditation) {
      return;
    }

    void (async () => {
      const saved = await savePractice('completed');
      if (prefs.sound) {
        playSoftChime();
      }
      showAlert(
        saved ? 'Session complete' : 'Session finished',
        saved
          ? `Nice work finishing “${meditation.title}”. Progress was updated.`
          : `You finished “${meditation.title}”, but progress may not have been saved.`,
        () => goBackOr(),
      );
    })();
  }, [completed]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!meditation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.missing}>
          <Text style={styles.missingTitle}>Meditation not found</Text>
          <Text style={styles.missingBody}>
            This session is unavailable. Choose another meditation from Home.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => goBackOr()}
            style={styles.endBtn}
          >
            <Text style={styles.endText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const progress =
    totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0;

  const endSession = () => {
    setPlaying(false);
    const practicedSeconds = Math.max(0, totalSeconds - remainingRef.current);

    if (practicedSeconds < 30 || savedRef.current) {
      goBackOr();
      return;
    }

    showConfirm(
      'End session?',
      'Save the time you practiced so far to My Progress?',
      () => {
        void (async () => {
          await savePractice('partial');
          goBackOr();
        })();
      },
      'Save & leave',
      'Keep practicing',
      () => setPlaying(true),
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close session"
          onPress={endSession}
          style={styles.headerBtn}
          hitSlop={8}
          disabled={saving}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {meditation.title}
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.body}>
        <View style={styles.timerCard}>
          <Text style={styles.category}>
            {meditation.category.toUpperCase()}
          </Text>
          <Text style={styles.timer}>{formatTime(remaining)}</Text>
          <Text style={styles.hint}>
            {saving
              ? 'Saving your progress…'
              : playing
                ? 'Breathe slowly and stay present.'
                : 'Paused — tap play to continue.'}
          </Text>

          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              playing ? 'Pause meditation' : 'Resume meditation'
            }
            onPress={() => setPlaying((value) => !value)}
            style={styles.playBtn}
            disabled={saving || completed}
          >
            <Ionicons
              name={playing ? 'pause' : 'play'}
              size={28}
              color={colors.white}
              style={!playing ? { marginLeft: 3 } : undefined}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="End meditation"
          onPress={endSession}
          style={styles.endBtn}
          disabled={saving}
        >
          <Text style={styles.endText}>End Session</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
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
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    body: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      gap: spacing.xl,
    },
    timerCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      paddingVertical: 40,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
    },
    category: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.textMuted,
      marginBottom: spacing.md,
    },
    timer: {
      fontSize: 56,
      fontWeight: '700',
      color: colors.primaryDark,
      fontVariant: ['tabular-nums'],
    },
    hint: {
      marginTop: spacing.md,
      fontSize: 15,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 22,
    },
    progressTrack: {
      marginTop: spacing.xl,
      width: '100%',
      height: 8,
      borderRadius: 999,
      backgroundColor: colors.input,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 999,
    },
    controls: {
      alignItems: 'center',
    },
    playBtn: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    endBtn: {
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    endText: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 15,
    },
    missing: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
      gap: spacing.md,
    },
    missingTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    missingBody: {
      textAlign: 'center',
      color: colors.textMuted,
      lineHeight: 20,
    },
  });
}
