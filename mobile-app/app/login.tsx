import { Link, router } from 'expo-router';
import { useState } from 'react';
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
import { FormInput } from '../components/FormInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, commonStyles, spacing } from '../constants/theme';
import { getRegisteredUser, saveSession } from '../utils/authStorage';
import { showAlert } from '../utils/showAlert';
import { validateLoginForm } from '../utils/validation';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const error = validateLoginForm({ email, password });
    if (error) {
      showAlert('Login Error', error);
      return false;
    }
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
        showAlert('Login Error', 'No account found. Please sign up first.');
        return;
      }

      const emailMatches =
        registeredUser.email.trim().toLowerCase() ===
        email.trim().toLowerCase();
      const passwordMatches = registeredUser.password === password;

      if (!emailMatches || !passwordMatches) {
        showAlert('Login Error', 'Incorrect email or password.');
        return;
      }

      await saveSession({
        email: registeredUser.email,
        username: registeredUser.username,
      });

      router.replace('/home');
    } catch {
      showAlert('Login Error', 'Something went wrong. Please try again.');
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
    <SafeAreaView style={commonStyles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={commonStyles.container}
          keyboardShouldPersistTaps="handled"
        >
          <AuthCard>
            <BrandHeader
              title="Welcome Back"
              subtitle="Sign in to continue your journey of tranquility."
            />

            <FormInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <FormInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              secureToggle
              autoCapitalize="none"
              textContentType="password"
            />

            <PrimaryButton
              label={submitting ? 'Logging In...' : 'Login'}
              onPress={handleLoginPress}
            />

            <View style={styles.divider} />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account? </Text>
              <Link href="/signup" asChild>
                <Pressable>
                  <Text style={commonStyles.linkText}>Sign Up</Text>
                </Pressable>
              </Link>
            </View>
          </AuthCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
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
});
