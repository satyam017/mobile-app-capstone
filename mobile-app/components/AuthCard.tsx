import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { colors, spacing } from '../constants/theme';

type AuthCardProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function AuthCard({ children, style }: AuthCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    width: '100%',
    maxWidth: 420,
    // Use boxShadow on web; keep elevation for native.
    boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
    elevation: 3,
  },
});
