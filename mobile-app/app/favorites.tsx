import { Ionicons } from '@expo/vector-icons';
import { Href, router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '../components/BottomNav';
import { ScreenHeader } from '../components/ScreenHeader';
import type { Meditation } from '../constants/meditations';
import { spacing, type ThemeColors } from '../constants/theme';
import { useThemeColors } from '../context/PreferencesContext';
import { getSession } from '../utils/authStorage';
import {
  FavoritesStorageError,
  getFavoriteMeditations,
  removeFavorite,
} from '../utils/favoritesStorage';
import { showAlert, showConfirm } from '../utils/showAlert';

export default function FavoritesScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [favorites, setFavorites] = useState<Meditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      setFavorites(await getFavoriteMeditations());
    } catch (err) {
      const message =
        err instanceof FavoritesStorageError
          ? err.message
          : 'Unable to load favorites.';
      setError(message);
      setFavorites([]);
      showAlert('Favorites', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadFavorites();
    }, [loadFavorites]),
  );

  const onRemove = (item: Meditation) => {
    showConfirm(
      'Remove favorite',
      `Remove “${item.title}” from your favorites?`,
      () => {
        void (async () => {
          try {
            await removeFavorite(item.id);
            setFavorites((list) => list.filter((f) => f.id !== item.id));
          } catch (err) {
            const message =
              err instanceof FavoritesStorageError
                ? err.message
                : 'Unable to remove favorite.';
            showAlert('Favorites', message);
          }
        })();
      },
      'Remove',
      'Cancel',
    );
  };

  if (loading && favorites.length === 0 && !error) {
    return (
      <View style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        onRightPress={() => router.push('/settings' as Href)}
        rightAccessibilityLabel="Open settings"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>My Favorites</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Saved Data</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.empty}>
            <Ionicons
              name="alert-circle-outline"
              size={36}
              color={colors.logout}
            />
            <Text style={styles.emptyTitle}>Couldn’t load favorites</Text>
            <Text style={styles.emptyBody}>{error}</Text>
            <Pressable
              style={styles.retryBtn}
              onPress={() => void loadFavorites()}
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : favorites.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={36} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyBody}>
              Save meditations from the detail screen to see them here.
            </Text>
          </View>
        ) : (
          favorites.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <View style={styles.cardBody}>
                <View style={styles.metaRow}>
                  <Text style={styles.category}>{item.category}</Text>
                  <Text style={styles.duration}>
                    {item.durationMinutes} min
                  </Text>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.cardActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${item.title}`}
                    onPress={() => onRemove(item)}
                    style={styles.removeBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color="#C0392B" />
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Play ${item.title}`}
                    onPress={() =>
                      router.push(`/meditation/${item.id}` as Href)
                    }
                    style={styles.playBtn}
                  >
                    <Ionicons name="play" size={14} color={colors.text} />
                  </Pressable>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <BottomNav active="favorites" />
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.screen,
    },
    centered: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xl,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: spacing.md,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    badge: {
      backgroundColor: colors.input,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
    empty: {
      alignItems: 'center',
      paddingVertical: 48,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    emptyBody: {
      textAlign: 'center',
      color: colors.textMuted,
      paddingHorizontal: 24,
      lineHeight: 20,
    },
    retryBtn: {
      marginTop: 8,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    retryText: {
      color: colors.primary,
      fontWeight: '700',
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
      marginBottom: spacing.md,
    },
    image: {
      width: '100%',
      height: 140,
      backgroundColor: colors.input,
    },
    cardBody: {
      padding: spacing.md,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    category: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
    },
    duration: {
      fontSize: 12,
      color: colors.textMuted,
    },
    cardTitle: {
      marginTop: 6,
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    cardDesc: {
      marginTop: 4,
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    cardActions: {
      marginTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    removeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    removeText: {
      color: '#C0392B',
      fontWeight: '600',
    },
    playBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1.5,
      borderColor: colors.divider,
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: 2,
    },
  });
}
