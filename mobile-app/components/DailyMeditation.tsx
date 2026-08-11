import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DAILY_MEDITATIONS, type Meditation } from '../constants/meditations';
import { spacing, type ThemeColors } from '../constants/theme';
import { useThemeColors } from '../context/ThemeContext';

type DailyMeditationProps = {
  onPressMeditation: (meditation: Meditation) => void;
};

export function DailyMeditation({ onPressMeditation }: DailyMeditationProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        Daily Meditations
      </Text>

      <View style={styles.list}>
        {DAILY_MEDITATIONS.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Play ${item.title}, ${item.durationMinutes} minutes, ${item.category}`}
            onPress={() => onPressMeditation(item)}
            style={styles.row}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon} size={22} color={colors.primary} />
            </View>

            <View style={styles.textWrap}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.durationMinutes} min • {item.category}
              </Text>
            </View>

            <View style={styles.playButton}>
              <Ionicons name="play" size={13} color={colors.text} />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    section: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 14,
    },
    list: {
      gap: 12,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
      paddingVertical: 14,
      paddingHorizontal: 14,
      minHeight: 76,
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textWrap: {
      flex: 1,
      marginHorizontal: 14,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    meta: {
      marginTop: 3,
      fontSize: 13,
      color: colors.textMuted,
    },
    playButton: {
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
