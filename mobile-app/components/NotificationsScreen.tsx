import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from './BottomNav';
import { usePreferences } from '../context/PreferencesContext';
import { spacing, type ThemeColors } from '../constants/theme';
import type { Reminder } from '../types/reminders';
import { getSession } from '../utils/authStorage';
import { goBackOr } from '../utils/navigation';
import {
  getNotificationPermissionStatus,
  requestNotificationPermissions,
  sendTestNotification,
  setNotificationsEnabled,
} from '../utils/notificationService';
import { sortRemindersByTime } from '../utils/reminderDate';
import { getReminders } from '../utils/remindersStorage';
import { playSoftChime } from '../utils/sound';
import { showAlert } from '../utils/showAlert';

function permissionLabel(
  status: 'granted' | 'denied' | 'undetermined' | 'unsupported',
): string {
  switch (status) {
    case 'granted':
      return 'Allowed';
    case 'denied':
      return 'Denied';
    case 'unsupported':
      return 'Unavailable on web';
    default:
      return 'Not requested yet';
  }
}

export function NotificationsScreen() {
  const { prefs, colors, updatePrefs } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [ready, setReady] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<
    'granted' | 'denied' | 'undetermined' | 'unsupported'
  >('undetermined');

  const sortedReminders = useMemo(
    () => sortRemindersByTime(reminders),
    [reminders],
  );
  const nextReminder = sortedReminders[0];

  useEffect(() => {
    void (async () => {
      try {
        const session = await getSession();
        if (!session) {
          router.replace('/login');
          return;
        }

        setPermissionStatus(await getNotificationPermissionStatus());
        setReminders(await getReminders());
      } catch {
        setPermissionStatus('undetermined');
        setReminders([]);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const refreshPermission = async () => {
    setPermissionStatus(await getNotificationPermissionStatus());
  };

  const onToggleNotifications = (value: boolean) => {
    void (async () => {
      if (value) {
        const granted = await requestNotificationPermissions();
        await refreshPermission();
        if (!granted) {
          showAlert(
            'Permission required',
            Platform.OS === 'web'
              ? 'Use an iOS or Android device to receive push notifications.'
              : 'Allow notifications so Mindful can deliver your reminders.',
          );
          return;
        }

        await updatePrefs({
          notifications: true,
          meditationReminder: true,
        });
        await setNotificationsEnabled(true);
        setReminders(await getReminders());
        if (prefs.sound) {
          playSoftChime();
        }
        return;
      }

      await setNotificationsEnabled(false);
      await updatePrefs({ notifications: false });
      setReminders(await getReminders());
    })();
  };

  const onToggleMeditationReminder = (value: boolean) => {
    void updatePrefs({ meditationReminder: value });
  };

  const sendTest = () => {
    void (async () => {
      if (!prefs.notifications) {
        showAlert(
          'Notifications disabled',
          'Turn on notifications first, then send a test alert.',
        );
        return;
      }

      const granted = await requestNotificationPermissions();
      await refreshPermission();
      if (!granted) {
        showAlert(
          'Permission required',
          'Allow notifications before sending a test alert.',
        );
        return;
      }

      const body = nextReminder
        ? `Reminder: ${nextReminder.activity} at ${nextReminder.time}.`
        : 'Time for a short mindful breath. Your practice is waiting.';

      const scheduled = await sendTestNotification(body);
      if (scheduled) {
        showAlert(
          'Test scheduled',
          'A test notification will appear in a few seconds.',
        );
        return;
      }

      if (prefs.sound) {
        playSoftChime();
      }
      showAlert('Mindful Notification', body);
    })();
  };

  if (!ready) {
    return <View style={styles.safeArea} />;
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Enable Notifications</Text>
            <Text style={styles.cardSubtitle}>
              Get alerts for meditation reminders and daily practice.
            </Text>
          </View>
          <Switch
            value={prefs.notifications}
            onValueChange={onToggleNotifications}
            trackColor={{ false: colors.divider, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Meditation Reminder</Text>
            <Text style={styles.cardSubtitle}>
              Receive prompts when it is time to meditate.
            </Text>
          </View>
          <Switch
            value={prefs.meditationReminder}
            onValueChange={onToggleMeditationReminder}
            trackColor={{ false: colors.divider, true: colors.primary }}
            thumbColor={colors.white}
            disabled={!prefs.notifications}
          />
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Notification Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>App preference</Text>
            <Text style={styles.statusValue}>
              {prefs.notifications ? 'On' : 'Off'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Device permission</Text>
            <Text style={styles.statusValue}>
              {permissionLabel(permissionStatus)}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Scheduled reminders</Text>
            <Text style={styles.statusValue}>{sortedReminders.length}</Text>
          </View>
          {permissionStatus === 'denied' ? (
            <Text style={styles.warning}>
              Notifications are blocked in device settings.
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Send test notification"
          onPress={sendTest}
          style={styles.testBtn}
        >
          <Ionicons name="notifications" size={18} color={colors.white} />
          <Text style={styles.testBtnText}>Send Test Notification</Text>
        </TouchableOpacity>

        {nextReminder && prefs.notifications ? (
          <View style={styles.nextCard}>
            <Text style={styles.nextTitle}>Next Reminder</Text>
            <Text style={styles.nextTime}>{nextReminder.time}</Text>
            <Text style={styles.nextMeta}>
              {nextReminder.activity} • {nextReminder.repeat}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Manage daily reminders"
          onPress={() => router.push('/reminders' as Href)}
          style={styles.linkCard}
        >
          <Ionicons name="alarm-outline" size={18} color={colors.primary} />
          <Text style={styles.linkText}>Manage Daily Reminders</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <Text style={styles.hint}>
          Preferences are saved automatically. Use Daily Reminders to add, edit,
          or delete scheduled alerts.
        </Text>
      </ScrollView>

      <BottomNav active="menu" />
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.screen,
    },
    header: {
      height: 54,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
      backgroundColor: colors.card,
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
      color: colors.primaryDark,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.md,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
      padding: spacing.md,
      gap: 12,
    },
    cardText: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    cardSubtitle: {
      marginTop: 4,
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    statusCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
      padding: spacing.md,
      gap: 10,
    },
    statusTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusLabel: {
      fontSize: 14,
      color: colors.textMuted,
    },
    statusValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    warning: {
      marginTop: 4,
      fontSize: 12,
      color: colors.logout,
      lineHeight: 16,
    },
    testBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primaryDark,
      borderRadius: 12,
      paddingVertical: 14,
    },
    testBtnText: {
      color: colors.white,
      fontWeight: '700',
      fontSize: 14,
    },
    nextCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
      padding: spacing.md,
    },
    nextTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
      marginBottom: 4,
    },
    nextTime: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
    },
    nextMeta: {
      marginTop: 4,
      fontSize: 14,
      color: colors.textMuted,
    },
    linkCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
      padding: spacing.md,
    },
    linkText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    hint: {
      textAlign: 'center',
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 18,
    },
  });
}
