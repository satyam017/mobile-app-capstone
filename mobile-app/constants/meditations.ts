export type Meditation = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  category: string;
  /** Remote image used for popular cards / detail hero. */
  imageUrl: string;
  /** Ionicons glyph for daily list rows. */
  icon: 'sunny-outline' | 'moon-outline' | 'leaf-outline' | 'water-outline';
  iconBg: string;
  instructions: string[];
};

/** Shared meditation catalog for Home + Detail screens. */
export const POPULAR_MEDITATIONS: Meditation[] = [
  {
    id: 'stress-relief',
    title: 'Stress Relief',
    description:
      'Release tension with a gentle breathing practice designed to calm an overactive mind.',
    durationMinutes: 10,
    category: 'Mindfulness',
    imageUrl:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    icon: 'leaf-outline',
    iconBg: '#E8F0EA',
    instructions: [
      'Find a quiet place and sit comfortably.',
      'Close your eyes and take three slow breaths.',
      'Scan your body from head to toe, releasing tension.',
      'Return gently whenever your mind wanders.',
    ],
  },
  {
    id: 'deep-rest',
    title: 'Deep Rest',
    description:
      'Settle into stillness and prepare your body for restorative sleep.',
    durationMinutes: 15,
    category: 'Sleep',
    imageUrl:
      'https://images.unsplash.com/photo-1514890547357-4c2f2b0e8d8a?w=800&q=80',
    icon: 'moon-outline',
    iconBg: '#EDE9F5',
    instructions: [
      'Lie down in a comfortable position.',
      'Dim the lights and silence notifications.',
      'Follow the breath as it softens and slows.',
      'Allow yourself to drift without forcing sleep.',
    ],
  },
  {
    id: 'morning-clarity',
    title: 'Morning Clarity',
    description:
      'Start your day with intention and a clear, focused mind.',
    durationMinutes: 8,
    category: 'Focus',
    imageUrl:
      'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&q=80',
    icon: 'sunny-outline',
    iconBg: '#E8EEF8',
    instructions: [
      'Sit upright near natural light if possible.',
      'Set one positive intention for the day.',
      'Breathe steadily for several cycles.',
      'Open your eyes softly and begin your day.',
    ],
  },
];

export const DAILY_MEDITATIONS: Meditation[] = [
  {
    id: 'morning-flow',
    title: 'Morning Flow',
    description:
      'A short practice to center your mind and set a positive intention for the day.',
    durationMinutes: 5,
    category: 'Focus',
    imageUrl:
      'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80',
    icon: 'sunny-outline',
    iconBg: '#E8EEF8',
    instructions: [
      'Sit comfortably with a straight spine.',
      'Take five deep breaths to arrive in the moment.',
      'Visualize a calm start to your day.',
      'Carry this clarity into your first task.',
    ],
  },
  {
    id: 'evening-wind-down',
    title: 'Evening Wind Down',
    description:
      'Unwind from the day with a relaxing body scan and soft breathing.',
    durationMinutes: 15,
    category: 'Relaxation',
    imageUrl:
      'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&q=80',
    icon: 'moon-outline',
    iconBg: '#EDE9F5',
    instructions: [
      'Dim lights and put away screens.',
      'Lie down and relax your shoulders.',
      'Slowly scan from forehead to feet.',
      'Rest quietly for a few final breaths.',
    ],
  },
];

export function getMeditationById(id: string): Meditation | undefined {
  return [...POPULAR_MEDITATIONS, ...DAILY_MEDITATIONS].find(
    (item) => item.id === id,
  );
}
