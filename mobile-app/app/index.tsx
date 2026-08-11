import { Redirect } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import type { ThemeColors } from '../constants/theme';
import { useThemeColors } from '../context/ThemeContext';
import { getSession } from '../utils/authStorage';

export default function Index() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      const session = await getSession();
      if (active) {
        setIsLoggedIn(Boolean(session));
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return <Redirect href={isLoggedIn ? '/home' : '/login'} />;
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
  });
}
