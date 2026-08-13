import { ReactNode, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { spacing, type ThemeColors } from '../constants/theme';
import { useThemeColors } from '../context/ThemeContext';

type AuthCardProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function AuthCard({ children, style }: AuthCardProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return <View style={[styles.card, style]}>{children}</View>;
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      width: '100%',
      maxWidth: 420,
      boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
      elevation: 3,
    },
  });
}
