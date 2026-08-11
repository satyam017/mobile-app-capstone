import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert. React Native's Alert.alert button callbacks
 * often do not run on web, so we use window.alert there and then
 * invoke the optional OK callback.
 */
export function showAlert(
  title: string,
  message: string,
  onOk?: () => void,
): void {
  if (Platform.OS === 'web') {
    // window.alert is blocking; run onOk after the user dismisses it.
    window.alert(`${title}\n\n${message}`);
    onOk?.();
    return;
  }

  if (onOk) {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
    return;
  }

  Alert.alert(title, message);
}
