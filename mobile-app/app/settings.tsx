import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '../components/BottomNav';
import { usePreferences } from '../context/PreferencesContext';
import { spacing, type ThemeColors } from '../constants/theme';
import type { SessionUser } from '../types/auth';
import type { AppPreferences } from '../types/preferences';
import {
  clearSession,
  getRegisteredUser,
  getSession,
  saveRegisteredUser,
  saveSession,
} from '../utils/authStorage';
import { goBackOr } from '../utils/navigation';
import { playSoftChime } from '../utils/sound';
import { showAlert } from '../utils/showAlert';

const PROFILE_AVATAR =
  'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=200&q=80';

const LANGUAGES = ['English', 'Español', 'Français'] as const;

type ToggleKey = keyof Pick<
  AppPreferences,
  'darkMode' | 'sound' | 'meditationReminder' | 'notifications'
>;

const PREFERENCE_TOGGLES: {
  key: ToggleKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'darkMode', label: 'Dark Mode', icon: 'moon-outline' },
  { key: 'sound', label: 'Sound', icon: 'volume-high-outline' },
  {
    key: 'meditationReminder',
    label: 'Meditation Reminder',
    icon: 'alarm-outline',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: 'notifications-outline',
  },
];

export default function SettingsScreen() {
  const { prefs, persistPrefs, updatePrefs, colors, darkMode } =
    usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    void (async () => {
      const session = await getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      setUser(session);
      setDraftName(session.username);
      setDraftEmail(session.email);
      setReady(true);
    })();
  }, []);

  const onToggle = (key: ToggleKey, value: boolean) => {
    if (key === 'notifications' && value && !prefs.meditationReminder) {
      void updatePrefs({ notifications: true, meditationReminder: true });
    } else {
      void updatePrefs({ [key]: value });
    }

    if (key === 'sound' && value) {
      playSoftChime();
    }
  };

  const cycleLanguage = () => {
    const index = LANGUAGES.indexOf(
      prefs.language as (typeof LANGUAGES)[number],
    );
    const next = LANGUAGES[(index + 1) % LANGUAGES.length];
    void updatePrefs({ language: next });
  };

  const handleSave = () => {
    void (async () => {
      await persistPrefs(prefs);
      showAlert('Saved', 'Your settings have been updated.');
    })();
  };

  const saveProfile = () => {
    void (async () => {
      const name = draftName.trim();
      const email = draftEmail.trim().toLowerCase();
      if (!name || !email) {
        showAlert('Profile', 'Username and email are required.');
        return;
      }

      const registered = await getRegisteredUser();
      if (!registered) {
        showAlert('Profile', 'No registered account found.');
        return;
      }

      const updatedUser = { ...registered, username: name, email };
      await saveRegisteredUser(updatedUser);
      const session = { username: name, email };
      await saveSession(session);
      setUser(session);
      setEditingProfile(false);
      showAlert('Profile updated', 'Your profile details were saved.');
    })();
  };

  const savePassword = () => {
    void (async () => {
      const registered = await getRegisteredUser();
      if (!registered) {
        showAlert('Password', 'No registered account found.');
        return;
      }
      if (registered.password !== currentPassword) {
        showAlert('Password', 'Current password is incorrect.');
        return;
      }
      if (newPassword.trim().length < 6) {
        showAlert('Password', 'New password must be at least 6 characters.');
        return;
      }

      await saveRegisteredUser({
        ...registered,
        password: newPassword.trim(),
      });
      setChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      showAlert('Password updated', 'Your password has been changed.');
    })();
  };

  const handleLogout = () => {
    showAlert('Log Out', 'End your session and return to Login?', () => {
      void (async () => {
        await clearSession();
        router.replace('/login');
      })();
    });
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
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.profileCard}>
          <Image source={{ uri: PROFILE_AVATAR }} style={styles.avatar} />
          <View style={styles.profileText}>
            <Text style={styles.profileName} numberOfLines={1}>
              {user?.username?.trim() || 'Mindful User'}
            </Text>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {user?.email ?? '—'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            onPress={() => {
              setEditingProfile((value) => !value);
              setChangingPassword(false);
            }}
            style={styles.editBtn}
          >
            <Text style={styles.editBtnText}>
              {editingProfile ? 'Close' : 'Edit Profile'}
            </Text>
          </Pressable>
        </View>

        {editingProfile ? (
          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>Username</Text>
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              style={styles.textInput}
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              value={draftEmail}
              onChangeText={setDraftEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.textInput}
              placeholderTextColor={colors.textMuted}
            />

            <Pressable style={styles.inlineSave} onPress={saveProfile}>
              <Text style={styles.inlineSaveText}>Save Profile</Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.groupCard}>
          {PREFERENCE_TOGGLES.map((item) => (
            <View key={item.key} style={[styles.row, styles.rowBorder]}>
              <View style={styles.rowLeft}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
                <Text style={styles.rowLabel}>{item.label}</Text>
              </View>
              <Switch
                value={prefs[item.key]}
                onValueChange={(value) => onToggle(item.key, value)}
                trackColor={{ false: colors.divider, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          ))}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change language"
            onPress={cycleLanguage}
            style={styles.row}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="globe-outline" size={20} color={colors.primary} />
              <Text style={styles.rowLabel}>Language</Text>
            </View>
            <View style={styles.languageChip}>
              <Text style={styles.languageText}>{prefs.language}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.text} />
            </View>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.groupCard}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change password"
            onPress={() => {
              setChangingPassword((value) => !value);
              setEditingProfile(false);
            }}
            style={[styles.row, styles.rowBorder]}
          >
            <View style={styles.rowLeft}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.rowLabel}>Change Password</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log out"
            onPress={handleLogout}
            style={styles.row}
          >
            <View style={styles.rowLeft}>
              <Ionicons
                name="log-out-outline"
                size={20}
                color={colors.logout}
              />
              <Text style={styles.logoutLabel}>Logout</Text>
            </View>
          </Pressable>
        </View>

        {changingPassword ? (
          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>Current password</Text>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              style={styles.textInput}
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.fieldLabel}>New password</Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.textInput}
              placeholderTextColor={colors.textMuted}
            />

            <Pressable style={styles.inlineSave} onPress={savePassword}>
              <Text style={styles.inlineSaveText}>Update Password</Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Manage reminders"
          onPress={() => router.push('/reminders' as Href)}
          style={styles.linkCard}
        >
          <Ionicons
            name="notifications-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={styles.linkText}>Manage Daily Reminders</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save changes"
          onPress={handleSave}
          style={styles.saveBtn}
        >
          <Text style={styles.saveText}>Save Changes</Text>
        </Pressable>

        <Text style={styles.hint}>
          {darkMode ? 'Dark mode is on.' : 'Light mode is on.'} Sound is{' '}
          {prefs.sound ? 'on' : 'off'}.
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
    },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
      padding: spacing.md,
      marginBottom: spacing.md,
      gap: 12,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.input,
    },
    profileText: {
      flex: 1,
      minWidth: 0,
    },
    profileName: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    profileEmail: {
      marginTop: 2,
      fontSize: 13,
      color: colors.textMuted,
    },
    editBtn: {
      borderWidth: 1.5,
      borderColor: colors.primaryDark,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    editBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primaryDark,
    },
    formCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
      marginTop: 8,
    },
    textInput: {
      backgroundColor: colors.input,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
    },
    inlineSave: {
      marginTop: 14,
      backgroundColor: colors.primaryDark,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    inlineSaveText: {
      color: colors.white,
      fontWeight: '700',
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
    },
    groupCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
      overflow: 'hidden',
      marginBottom: spacing.lg,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: 14,
      minHeight: 56,
    },
    rowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flexShrink: 1,
    },
    rowLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    languageChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderWidth: 1,
      borderColor: colors.divider,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    languageText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    logoutLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.logout,
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
      marginBottom: spacing.md,
    },
    linkText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    saveBtn: {
      backgroundColor: colors.primaryDark,
      borderRadius: 999,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    saveText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '700',
    },
    hint: {
      marginTop: spacing.md,
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: 12,
    },
  });
}
