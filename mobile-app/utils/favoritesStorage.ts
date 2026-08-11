import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../constants/storageKeys';
import { getMeditationById, type Meditation } from '../constants/meditations';

export class FavoritesStorageError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'FavoritesStorageError';
    if (options?.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

export async function getFavoriteIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.favorites);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) {
      throw new FavoritesStorageError('Favorites data is corrupted.');
    }
    return parsed.filter((id) => typeof id === 'string');
  } catch (error) {
    if (error instanceof FavoritesStorageError) {
      throw error;
    }
    throw new FavoritesStorageError('Unable to load favorites.', {
      cause: error,
    });
  }
}

export async function saveFavoriteIds(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(ids));
  } catch (error) {
    throw new FavoritesStorageError('Unable to save favorites.', {
      cause: error,
    });
  }
}

export async function getFavoriteMeditations(): Promise<Meditation[]> {
  const ids = await getFavoriteIds();
  return ids
    .map((id) => getMeditationById(id))
    .filter((item): item is Meditation => Boolean(item));
}

export async function toggleFavorite(meditationId: string): Promise<boolean> {
  const ids = await getFavoriteIds();
  const exists = ids.includes(meditationId);
  const next = exists
    ? ids.filter((id) => id !== meditationId)
    : [meditationId, ...ids];
  await saveFavoriteIds(next);
  return !exists;
}

export async function removeFavorite(meditationId: string): Promise<void> {
  const ids = await getFavoriteIds();
  await saveFavoriteIds(ids.filter((id) => id !== meditationId));
}
