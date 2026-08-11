import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../constants/storageKeys';
import type { RegisteredUser, SessionUser } from '../types/auth';

export async function saveRegisteredUser(user: RegisteredUser): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.registeredUser, JSON.stringify(user));
}

export async function getRegisteredUser(): Promise<RegisteredUser | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.registeredUser);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as RegisteredUser;
  } catch {
    return null;
  }
}

export async function saveSession(user: SessionUser): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.session, JSON.stringify(user));
}

export async function getSession(): Promise<SessionUser | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.session);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.session);
}
