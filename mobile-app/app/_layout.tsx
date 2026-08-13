import { Stack } from 'expo-router';
import * as Updates from 'expo-updates';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';

import {
  PreferencesProvider,
  usePreferences,
} from '../context/PreferencesContext';
import '../utils/notificationService';

function RootNavigator() {
  const { ready, colors, darkMode } = usePreferences();

  useEffect(() => {
    if (__DEV__) {
      return;
    }

    void (async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch {
        return;
      }
    })();
  }, []);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <PreferencesProvider>
      <RootNavigator />
    </PreferencesProvider>
  );
}
