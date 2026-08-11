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
import { FormErrorBanner } from '../components/FormErrorBanner';
import { FormInput } from '../components/FormInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, commonStyles, spacing } from '../constants/theme';
import { getRegisteredUser, saveRegisteredUser } from '../utils/authStorage';
import { showAlert } from '../utils/showAlert';
import { validateSignupForm } from '../utils/validation';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const showSignupError = (message: string) => {
    setFormError(message);
    showAlert('Registration Error', message);
  };

  const validateForm = () => {
    const error = validateSignupForm({ username, email, password });
    if (error) {
      showSignupError(error);
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleRegister = async () => {
    if (submitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const existing = await getRegisteredUser();
      if (
        existing &&
        existing.email.trim().toLowerCase() === email.trim().toLowerCase()
      ) {
        showSignupError(
          'An account with this email already exists. Please log in.',
        );
        return;
      }

      await saveRegisteredUser({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setFormError(null);
      showAlert('Success', 'Account created successfully. Please log in.', () =>
        router.replace('/login'),
      );
    } catch {
      showSignupError('Could not save your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const clearErrorOnEdit =
    (setter: (value: string) => void) => (value: string) => {
      setter(value);
      if (formError) {
        setFormError(null);
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
            <BrandHeader title="Create Your Account" />

            <FormErrorBanner title="Registration Error" message={formError} />

            <FormInput
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChangeText={clearErrorOnEdit(setUsername)}
              autoCapitalize="none"
              textContentType="username"
            />

            <FormInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={clearErrorOnEdit(setEmail)}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <FormInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={clearErrorOnEdit(setPassword)}
              secureTextEntry
              secureToggle
              autoCapitalize="none"
              textContentType="newPassword"
            />

            <PrimaryButton
              label={submitting ? 'Signing Up...' : 'Sign Up'}
              onPress={() => {
                void handleRegister();
              }}
              disabled={submitting}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/login" asChild>
                <Pressable>
                  <Text style={commonStyles.linkText}>Login</Text>
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.lg,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
