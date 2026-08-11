export type PracticeStatus = 'completed' | 'partial';

export type PracticeSession = {
  id: string;
  meditationId: string;
  title: string;

  durationMinutes: number;
  plannedMinutes: number;
  completedAt: string;
  status: PracticeStatus;
};

export const WEEKLY_GOAL_MINUTES = 60;
