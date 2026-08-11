import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { colors, spacing } from '../constants/theme';

type FormInputProps = TextInputProps & {
  label: string;
  labelRight?: ReactNode;
  secureToggle?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export function FormInput({
  label,
  labelRight,
  secureToggle = false,
  secureTextEntry,
  style,
  containerStyle,
  ...props
}: FormInputProps) {
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {labelRight}
      </View>
      <View style={styles.inputShell}>
        <TextInput
          {...props}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, secureToggle && styles.inputWithIcon, style]}
        />
        {secureToggle ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            onPress={() => setHidden((value) => !value)}
            style={styles.eyeButton}
            hitSlop={8}
          >
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  inputShell: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: colors.input,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  inputWithIcon: {
    paddingRight: 44,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },
});
