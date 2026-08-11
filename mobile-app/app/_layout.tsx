import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import {
  PreferencesProvider,
  usePreferences,
} from '../context/PreferencesContext';

function RootNavigator() {
  const { ready, colors, darkMode } = usePreferences();

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
