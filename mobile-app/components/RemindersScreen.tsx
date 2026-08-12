import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from './BottomNav';
import { MonthCalendar } from './MonthCalendar';
import { usePreferences } from '../context/PreferencesContext';
import { spacing, type ThemeColors } from '../constants/theme';
import type { Reminder, ReminderRepeat } from '../types/reminders';
import { getSession } from '../utils/authStorage';
import {
  buildReminderSchedule,
  getNotificationPermissionStatus,
  reminderDateKey,
  requestNotificationPermissions,
  cancelReminderNotifications,
  rescheduleReminderNotifications,
  scheduleReminderNotifications,
  sendTestNotification,
} from '../utils/notificationService';
import { goBackOr } from '../utils/navigation';
import {
  formatTimeLabel,
  sortRemindersByTime,
  toDateKey,
} from '../utils/reminderDate';
import { getReminders, saveReminders } from '../utils/remindersStorage';
import { playSoftChime } from '../utils/sound';
import { showAlert, showConfirm } from '../utils/showAlert';

const REPEAT_OPTIONS: ReminderRepeat[] = ['Every Day', 'Weekdays', 'Custom'];

type RemindersScreenProps = {
  title?: string;
};

export function RemindersScreen({
  title = 'Daily Reminders',
}: RemindersScreenProps) {
  const { prefs, colors, updatePrefs } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [ready, setReady] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));
  const [timeValue, setTimeValue] = useState(() => {
    const date = new Date();
    date.setHours(8, 0, 0, 0);
    return date;
  });
  const [activity, setActivity] = useState('');
  const [repeat, setRepeat] = useState<ReminderRepeat>('Weekdays');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(Platform.OS === 'ios');
  const [showCalendar, setShowCalendar] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<
    'granted' | 'denied' | 'undetermined' | 'unsupported'
  >('undetermined');

  const timeLabel = useMemo(() => formatTimeLabel(timeValue), [timeValue]);
  const selectedDateLabel = useMemo(() => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate]);
  const sortedReminders = useMemo(
    () => sortRemindersByTime(reminders),
    [reminders],
  );

  useEffect(() => {
    void (async () => {
      try {
        const session = await getSession();
        if (!session) {
          router.replace('/login');
          return;
        }

        const status = await getNotificationPermissionStatus();
        setPermissionStatus(status);
        const stored = await getReminders();

        if (status === 'granted' && Platform.OS !== 'web') {
          const rescheduled = await Promise.all(
            stored.map(async (item) => {
              const notificationIds =
                await rescheduleReminderNotifications(item);
              return { ...item, notificationIds };
            }),
          );
          await saveReminders(rescheduled);
          setReminders(rescheduled);
        } else {
          setReminders(stored);
        }
      } catch {
        setPermissionStatus('undetermined');
        setReminders([]);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = async (next: Reminder[]) => {
    try {
      setReminders(next);
      await saveReminders(next);
    } catch {
      showAlert('Reminders', 'Unable to save reminders. Please try again.');
      throw new Error('Failed to save reminders');
    }
  };

  const ensurePermissions = async (): Promise<boolean> => {
    const granted = await requestNotificationPermissions();
    const status = await getNotificationPermissionStatus();
    setPermissionStatus(status);

    if (!granted) {
      showAlert(
        'Permission required',
        Platform.OS === 'web'
          ? 'Scheduled notifications are available on iOS and Android devices.'
          : 'Please allow notifications so Mindful can deliver your reminders.',
      );
      return false;
    }

    return true;
  };

  const onToggleNotifications = (value: boolean) => {
    void (async () => {
      if (value) {
        const granted = await ensurePermissions();
        if (!granted) {
          return;
        }
      }

      await updatePrefs({ notifications: value });
      if (value && prefs.sound) {
        playSoftChime();
      }
    })();
  };

  const sendTest = () => {
    void (async () => {
      if (!prefs.notifications) {
        showAlert(
          'Notifications disabled',
          'Enable notifications first, then try the test alert again.',
        );
        return;
      }

      const granted = await ensurePermissions();
      if (!granted) {
        return;
      }

      const nextReminder = sortedReminders[0];
      const body = nextReminder
        ? `Reminder: ${nextReminder.activity} at ${nextReminder.time} (${nextReminder.repeat}).`
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

  const resetForm = () => {
    setSelectedDate(toDateKey(new Date()));
    const resetTime = new Date();
    resetTime.setHours(8, 0, 0, 0);
    setTimeValue(resetTime);
    setActivity('');
    setRepeat('Weekdays');
    setEditingId(null);
    setShowTimePicker(Platform.OS === 'ios');
    setShowCalendar(false);
  };

  const onRepeatChange = (option: ReminderRepeat) => {
    setRepeat(option);
    if (option === 'Custom') {
      setShowCalendar(true);
      return;
    }
    setShowCalendar(false);
    setSelectedDate(toDateKey(new Date()));
  };

  const onTimeChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (date) {
      setTimeValue(date);
    }
  };

  const handleAddOrUpdate = () => {
    void (async () => {
      if (!prefs.notifications) {
        showAlert(
          'Notifications off',
          'Enable notifications first to manage reminders.',
        );
        return;
      }

      const trimmedActivity = activity.trim();
      if (!trimmedActivity) {
        showAlert('Missing activity', 'Please enter an activity for this reminder.');
        return;
      }

      const granted = await ensurePermissions();
      if (!granted) {
        return;
      }

      const schedule = buildReminderSchedule(selectedDate, timeValue);
      const baseReminder: Reminder = {
        id: editingId ?? `reminder-${Date.now()}`,
        activity: trimmedActivity,
        repeat,
        ...schedule,
      };

      if (
        repeat === 'Custom' &&
        new Date(schedule.scheduledAt).getTime() <= Date.now()
      ) {
        showAlert(
          'Invalid time',
          'Choose a future date and time for a custom reminder.',
        );
        return;
      }

      const notificationIds = editingId
        ? await (async () => {
            const previous = reminders.find((item) => item.id === editingId);
            if (previous?.notificationIds?.length) {
              await cancelReminderNotifications(previous.notificationIds);
            }
            return scheduleReminderNotifications(baseReminder);
          })()
        : await scheduleReminderNotifications(baseReminder);
      const reminder: Reminder = { ...baseReminder, notificationIds };

      if (editingId) {
        await persist(
          reminders.map((item) => (item.id === editingId ? reminder : item)),
        );
        showAlert('Updated', 'Reminder updated and rescheduled.');
      } else {
        await persist([reminder, ...reminders]);
        if (prefs.sound) {
          playSoftChime();
        }
        showAlert('Added', 'Reminder saved and scheduled.');
      }

      resetForm();
    })();
  };

  const startEdit = (item: Reminder) => {
    setEditingId(item.id);
    setSelectedDate(reminderDateKey(item));
    setTimeValue(new Date(item.scheduledAt));
    setActivity(item.activity);
    setRepeat(item.repeat);
    setShowTimePicker(Platform.OS === 'ios');
    setShowCalendar(item.repeat === 'Custom');
  };

  const removeReminder = (item: Reminder) => {
    showConfirm(
      'Delete reminder',
      'Remove this reminder?',
      () => {
        void (async () => {
          await cancelReminderNotifications(item.notificationIds);
          await persist(reminders.filter((entry) => entry.id !== item.id));
          if (editingId === item.id) {
            resetForm();
          }
        })();
      },
      'Remove',
      'Cancel',
    );
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
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.enableText}>
            <Text style={styles.enableTitle}>Enable Notifications</Text>
            <Text style={styles.enableSubtitle}>
              Receive gentle prompts for your practice.
            </Text>
            {permissionStatus === 'denied' ? (
              <Text style={styles.permissionWarning}>
                Notification permission is denied on this device.
              </Text>
            ) : null}
            {permissionStatus === 'unsupported' ? (
              <Text style={styles.permissionWarning}>
                Scheduled notifications work on iOS and Android builds.
              </Text>
            ) : null}
          </View>
          <Switch
            value={prefs.notifications}
            onValueChange={onToggleNotifications}
            trackColor={{ false: colors.divider, true: colors.primary }}
            thumbColor={colors.white}
          />
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

        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Time</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Choose reminder time"
            onPress={() => setShowTimePicker(true)}
            style={styles.inputRow}
          >
            <Ionicons name="time-outline" size={18} color={colors.textMuted} />
            <Text style={styles.timeText}>{timeLabel}</Text>
          </TouchableOpacity>

          {showTimePicker ? (
            <DateTimePicker
              value={timeValue}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          ) : null}

          <Text style={styles.fieldLabel}>Activity</Text>
          <View style={styles.inputRow}>
            <Ionicons name="leaf-outline" size={18} color={colors.textMuted} />
            <TextInput
              value={activity}
              onChangeText={setActivity}
              placeholder="e.g. Morning Meditation"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>

          <Text style={styles.fieldLabel}>Repeat</Text>
          <View style={styles.repeatRow}>
            {REPEAT_OPTIONS.map((option) => {
              const selected = repeat === option;
              return (
                <TouchableOpacity
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => onRepeatChange(option)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {repeat === 'Custom' ? (
            <View style={styles.calendarSection}>
              <Text style={styles.fieldLabel}>Select Date</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Choose reminder date"
                accessibilityState={{ expanded: showCalendar }}
                onPress={() => setShowCalendar((open) => !open)}
                style={styles.inputRow}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={colors.textMuted}
                />
                <Text style={styles.timeText}>{selectedDateLabel}</Text>
                <Ionicons
                  name={showCalendar ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>

              {showCalendar ? (
                <MonthCalendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  colors={colors}
                />
              ) : null}
            </View>
          ) : null}

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={editingId ? 'Update reminder' : 'Add reminder'}
            onPress={handleAddOrUpdate}
            style={styles.addBtn}
          >
            <Ionicons
              name={editingId ? 'checkmark' : 'add'}
              size={18}
              color={colors.primaryDark}
            />
            <Text style={styles.addBtnText}>
              {editingId ? 'UPDATE REMINDER' : '+ ADD REMINDER'}
            </Text>
          </TouchableOpacity>

          {editingId ? (
            <TouchableOpacity onPress={resetForm} style={styles.cancelEdit}>
              <Text style={styles.cancelEditText}>Cancel edit</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Active Reminders</Text>
        {sortedReminders.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No reminders yet.</Text>
          </View>
        ) : (
          sortedReminders.map((item) => (
            <View key={item.id} style={styles.reminderCard}>
              <View
                style={[styles.reminderIcon, { backgroundColor: colors.input }]}
              >
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.reminderText}>
                <Text style={styles.reminderTime}>{item.time}</Text>
                <Text style={styles.reminderMeta}>
                  {reminderDateKey(item)} • {item.activity} • {item.repeat}
                </Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Edit ${item.activity}`}
                onPress={() => startEdit(item)}
                hitSlop={8}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Delete ${item.activity}`}
                onPress={() => removeReminder(item)}
                hitSlop={8}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={colors.logout}
                />
              </TouchableOpacity>
            </View>
          ))
        )}
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
    enableText: {
      flex: 1,
    },
    enableTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    enableSubtitle: {
      marginTop: 4,
      fontSize: 13,
      color: colors.textMuted,
    },
    permissionWarning: {
      marginTop: 6,
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
    formCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
      padding: spacing.md,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      marginTop: 8,
    },
    calendarSection: {
      marginTop: 4,
      gap: 10,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.input,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      padding: 0,
    },
    timeText: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      fontWeight: '600',
    },
    repeatRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
      marginBottom: 12,
    },
    chip: {
      borderWidth: 1.5,
      borderColor: colors.divider,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.card,
    },
    chipSelected: {
      backgroundColor: colors.primaryDark,
      borderColor: colors.primaryDark,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    chipTextSelected: {
      color: colors.white,
    },
    addBtn: {
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderWidth: 1.5,
      borderColor: colors.primaryDark,
      borderRadius: 12,
      paddingVertical: 14,
    },
    addBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primaryDark,
    },
    cancelEdit: {
      marginTop: 10,
      alignItems: 'center',
    },
    cancelEditText: {
      color: colors.textMuted,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginTop: 4,
    },
    empty: {
      padding: spacing.lg,
      alignItems: 'center',
    },
    emptyText: {
      color: colors.textMuted,
    },
    reminderCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
      padding: spacing.md,
    },
    reminderIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reminderText: {
      flex: 1,
    },
    reminderTime: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    reminderMeta: {
      marginTop: 2,
      fontSize: 13,
      color: colors.textMuted,
    },
  });
}
