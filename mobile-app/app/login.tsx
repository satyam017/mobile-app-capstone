import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthCard } from '../components/AuthCard';
import { BrandHeader } from '../components/BrandHeader';
import { FormErrorBanner } from '../components/FormErrorBanner';
import { FormInput } from '../components/FormInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { spacing, type ThemeColors } from '../constants/theme';
import { useThemeColors } from '../context/ThemeContext';
import { getRegisteredUser, saveSession } from '../utils/authStorage';
import { showAlert } from '../utils/showAlert';
import { validateLoginForm } from '../utils/validation';

export default function LoginScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const showLoginError = (message: string) => {
    setFormError(message);
    showAlert('Login Error', message);
  };

  const validateForm = () => {
    const error = validateLoginForm({ email, password });
    if (error) {
      showLoginError(error);
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleLogin = async () => {
    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);
      const registeredUser = await getRegisteredUser();

      if (!registeredUser) {
        showLoginError('No account found. Please sign up first.');
        return;
      }

      const emailMatches =
        registeredUser.email.trim().toLowerCase() ===
        email.trim().toLowerCase();
      const passwordMatches = registeredUser.password === password;

      if (!emailMatches || !passwordMatches) {
        showLoginError('Incorrect email or password.');
        return;
      }

      setFormError(null);
      await saveSession({
        email: registeredUser.email,
        username: registeredUser.username,
      });

      router.replace('/home');
    } catch {
      showLoginError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginPress = () => {
    if (validateForm()) {
      void handleLogin();
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <AuthCard>
            <BrandHeader
              title="Welcome Back"
              subtitle="Sign in to continue your journey of tranquility."
            />

            <FormErrorBanner title="Login Error" message={formError} />

            <FormInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (formError) {
                  setFormError(null);
                }
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <FormInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (formError) {
                  setFormError(null);
                }
              }}
              secureTextEntry
              secureToggle
              autoCapitalize="none"
              textContentType="password"
            />

            <PrimaryButton
              label={submitting ? 'Logging In...' : 'Login'}
              onPress={handleLoginPress}
              disabled={submitting}
            />

            <View style={styles.divider} />

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don&apos;t have an account?{' '}
              </Text>
              <Link href="/signup" asChild>
                <Pressable>
                  <Text style={styles.linkText}>Sign Up</Text>
                </Pressable>
              </Link>
            </View>
          </AuthCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
    container: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: spacing.lg,
      alignItems: 'center',
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: spacing.lg,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    footerText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    linkText: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 14,
    },
  });
}
