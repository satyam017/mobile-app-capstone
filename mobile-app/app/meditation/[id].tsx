import { Ionicons } from '@expo/vector-icons';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getMeditationById } from '../../constants/meditations';
import { spacing, type ThemeColors } from '../../constants/theme';
import { useThemeColors } from '../../context/ThemeContext';
import {
  FavoritesStorageError,
  getFavoriteIds,
  toggleFavorite,
} from '../../utils/favoritesStorage';
import { goBackOr } from '../../utils/navigation';
import { showAlert } from '../../utils/showAlert';

type TabKey = 'about' | 'instructions';

export default function MeditationDetailScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const meditation = useMemo(
    () => (typeof id === 'string' ? getMeditationById(id) : undefined),
    [id],
  );
  const [tab, setTab] = useState<TabKey>('about');
  const [favorited, setFavorited] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  useEffect(() => {
    if (!meditation) {
      return;
    }
    void (async () => {
      try {
        const ids = await getFavoriteIds();
        setFavorited(ids.includes(meditation.id));
      } catch (error) {
        const message =
          error instanceof FavoritesStorageError
            ? error.message
            : 'Unable to load favorite status.';
        showAlert('Favorites', message);
      }
    })();
  }, [meditation]);

  if (!meditation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.missing}>
          <Text style={styles.missingTitle}>Meditation not found</Text>
          <Text style={styles.missingBody}>
            This meditation may have been removed. Return home and try another.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => goBackOr()}
            style={styles.backChip}
          >
            <Text style={styles.backChipText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${meditation.title} — ${meditation.durationMinutes} min ${meditation.category} meditation on Mindful.`,
      });
    } catch {
      showAlert('Share', 'Unable to open the share sheet right now.');
    }
  };

  const handleFavorite = () => {
    if (favoriteBusy) {
      return;
    }
    void (async () => {
      setFavoriteBusy(true);
      try {
        const next = await toggleFavorite(meditation.id);
        setFavorited(next);
      } catch (error) {
        const message =
          error instanceof FavoritesStorageError
            ? error.message
            : 'Unable to update favorites.';
        showAlert('Favorites', message);
      } finally {
        setFavoriteBusy(false);
      }
    })();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => goBackOr()}
          style={styles.headerBtn}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {meditation.title}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share meditation"
          onPress={() => {
            void handleShare();
          }}
          style={styles.headerBtn}
          hitSlop={8}
        >
          <Ionicons name="share-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: meditation.imageUrl }} style={styles.hero} />

        <View style={styles.metaRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{meditation.category}</Text>
          </View>
          <View style={styles.duration}>
            <Ionicons name="timer-outline" size={16} color={colors.textMuted} />
            <Text style={styles.durationText}>
              {meditation.durationMinutes} min
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={favorited ? 'Remove favorite' : 'Add favorite'}
            onPress={handleFavorite}
            style={styles.heartBtn}
            disabled={favoriteBusy}
          >
            <Ionicons
              name={favorited ? 'heart' : 'heart-outline'}
              size={22}
              color={favorited ? colors.error : colors.text}
            />
          </Pressable>
        </View>

        <Text style={styles.title}>
          {meditation.description.split('.')[0]}.
        </Text>

        <View style={styles.tabs}>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === 'about' }}
            onPress={() => setTab('about')}
            style={styles.tab}
          >
            <Text style={[styles.tabText, tab === 'about' && styles.tabActive]}>
              About
            </Text>
            {tab === 'about' ? <View style={styles.tabUnderline} /> : null}
          </Pressable>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === 'instructions' }}
            onPress={() => setTab('instructions')}
            style={styles.tab}
          >
            <Text
              style={[
                styles.tabText,
                tab === 'instructions' && styles.tabActive,
              ]}
            >
              Instructions
            </Text>
            {tab === 'instructions' ? (
              <View style={styles.tabUnderline} />
            ) : null}
          </Pressable>
        </View>

        {tab === 'about' ? (
          <Text style={styles.body}>{meditation.description}</Text>
        ) : (
          <View style={styles.steps}>
            {meditation.instructions.map((step, index) => (
              <Text key={step} style={styles.body}>
                {index + 1}. {step}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add to favorites"
          onPress={handleFavorite}
          style={styles.secondaryBtn}
          disabled={favoriteBusy}
        >
          <Ionicons
            name={favorited ? 'heart' : 'heart-outline'}
            size={18}
            color={colors.primary}
          />

          <Text style={styles.secondaryText}>
            {favorited ? 'Favorited' : 'Add to Favorites'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start meditation"
          onPress={() =>
            router.push(`/meditation/${meditation.id}/session` as Href)
          }
          style={styles.primaryBtn}
        >
          <Ionicons name="play" size={16} color={colors.white} />
          <Text style={styles.primaryText}>Start Meditation</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
    },
    headerBtn: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    content: {
      paddingBottom: spacing.xl,
    },
    hero: {
      width: '100%',
      height: 220,
      backgroundColor: colors.input,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      gap: spacing.sm,
    },
    pill: {
      backgroundColor: colors.input,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    pillText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primaryDark,
    },
    duration: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flex: 1,
    },
    durationText: {
      color: colors.textMuted,
      fontSize: 13,
    },
    heartBtn: {
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    tabs: {
      flexDirection: 'row',
      gap: spacing.lg,
      paddingHorizontal: spacing.lg,
      marginTop: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    tab: {
      paddingBottom: spacing.sm,
    },
    tabText: {
      fontSize: 15,
      color: colors.textMuted,
      fontWeight: '600',
    },
    tabActive: {
      color: colors.primary,
    },
    tabUnderline: {
      marginTop: spacing.sm,
      height: 2,
      backgroundColor: colors.primary,
      borderRadius: 1,
    },
    body: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      fontSize: 15,
      lineHeight: 22,
      color: colors.textMuted,
    },
    steps: {
      paddingBottom: spacing.md,
    },
    footer: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      backgroundColor: colors.card,
    },
    secondaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    secondaryText: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 13,
    },
    primaryBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      minHeight: 48,
    },
    primaryText: {
      color: colors.white,
      fontWeight: '700',
      fontSize: 15,
    },
    missing: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    missingTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    missingBody: {
      textAlign: 'center',
      color: colors.textMuted,
      marginBottom: spacing.md,
      lineHeight: 20,
    },
    backChip: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    backChipText: {
      color: colors.primary,
      fontWeight: '700',
    },
  });
}
