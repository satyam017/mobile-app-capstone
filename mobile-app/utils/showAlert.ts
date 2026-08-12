import { Alert, Platform } from 'react-native';

export function showAlert(
  title: string,
  message: string,
  onOk?: () => void,
): void {
  if (Platform.OS === 'web') {
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

export function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onCancel?: () => void,
): void {
  if (Platform.OS === 'web') {
    const accepted = window.confirm(`${title}\n\n${message}`);
    if (accepted) {
      onConfirm();
    } else {
      onCancel?.();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel', onPress: onCancel },
    { text: confirmLabel, onPress: onConfirm },
  ]);
}
