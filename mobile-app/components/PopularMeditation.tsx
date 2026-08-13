import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { POPULAR_MEDITATIONS, type Meditation } from '../constants/meditations';
import { spacing, type ThemeColors } from '../constants/theme';
import { useThemeColors } from '../context/ThemeContext';

type PopularMeditationProps = {
  onPressMeditation: (meditation: Meditation) => void;
};

export function PopularMeditation({
  onPressMeditation,
}: PopularMeditationProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(280, width * 0.72);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        Popular Meditations
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + spacing.md}
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
              resizeMode="cover"
            />

            <View style={styles.body}>
              <View style={styles.metaRow}>
                <Text style={styles.category}>
                  {item.category.toUpperCase()}
                </Text>
                <View style={styles.durationRow}>
                  <Ionicons
                    name="time-outline"
                    size={13}
                    color={colors.textMuted}
                  />
                  <Text style={styles.duration}>
                    {item.durationMinutes} min
                  </Text>
                </View>
              </View>
              <Text style={styles.title}>{item.title}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    section: {
      marginBottom: 28,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      paddingHorizontal: spacing.lg,
      marginBottom: 14,
    },
    listContent: {
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
      paddingBottom: 2,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.07,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
        },
        android: { elevation: 2 },
        web: { boxShadow: '0 3px 10px rgba(0,0,0,0.06)' } as object,
        default: {},
      }),
    },
    image: {
      width: '100%',
      height: 168,
      backgroundColor: colors.input,
    },
    body: {
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 14,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    category: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.8,
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
      marginTop: 6,
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
  });
}
