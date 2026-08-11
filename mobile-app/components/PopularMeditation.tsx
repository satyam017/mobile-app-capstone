import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  POPULAR_MEDITATIONS,
  type Meditation,
} from '../constants/meditations';
import { colors, spacing } from '../constants/theme';

type PopularMeditationProps = {
  onPressMeditation: (meditation: Meditation) => void;
};

/** Horizontal carousel of popular meditation cards. */
export function PopularMeditation({ onPressMeditation }: PopularMeditationProps) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(260, Math.max(220, width * 0.62));

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        Popular Meditations
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {POPULAR_MEDITATIONS.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}, ${item.category}, ${item.durationMinutes} minutes`}
            onPress={() => onPressMeditation(item)}
            style={[styles.card, { width: cardWidth }]}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              accessibilityIgnoresInvertColors
            />
            <View style={styles.metaRow}>
              <Text style={styles.category}>{item.category.toUpperCase()}</Text>
              <View style={styles.durationRow}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={colors.textMuted}
                />
                <Text style={styles.duration}>{item.durationMinutes} min</Text>
              </View>
            </View>
            <Text style={styles.title}>{item.title}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: colors.input,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  category: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.textMuted,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: 12,
    color: colors.textMuted,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
});
