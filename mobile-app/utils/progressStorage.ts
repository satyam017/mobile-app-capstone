import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../constants/storageKeys';
import { WEEKLY_GOAL_MINUTES, type PracticeSession } from '../types/progress';

export class ProgressStorageError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'ProgressStorageError';
    if (options?.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function dayKey(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

export function getWeekStart(date = new Date()): Date {
  const start = startOfDay(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  return start;
}

export function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${fmt(weekStart)} - ${fmt(end)}`;
}

export async function getPracticeHistory(): Promise<PracticeSession[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.practiceHistory);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as PracticeSession[];
    if (!Array.isArray(parsed)) {
      throw new ProgressStorageError('Practice history is corrupted.');
    }
    return parsed;
  } catch (error) {
    if (error instanceof ProgressStorageError) {
      throw error;
    }
    throw new ProgressStorageError('Unable to load your progress.', {
      cause: error,
    });
  }
}

export async function savePracticeHistory(
  sessions: PracticeSession[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.practiceHistory,
      JSON.stringify(sessions),
    );
  } catch (error) {
    throw new ProgressStorageError('Unable to save your progress.', {
      cause: error,
    });
  }
}

export async function recordPracticeSession(input: {
  meditationId: string;
  title: string;
  durationMinutes: number;
  plannedMinutes: number;
  status: PracticeSession['status'];
}): Promise<PracticeSession> {
  if (input.durationMinutes <= 0) {
    throw new ProgressStorageError('Practice time must be greater than zero.');
  }

  const history = await getPracticeHistory();
  const entry: PracticeSession = {
    id: `practice-${Date.now()}`,
    meditationId: input.meditationId,
    title: input.title,
    durationMinutes: input.durationMinutes,
    plannedMinutes: input.plannedMinutes,
    completedAt: new Date().toISOString(),
    status: input.status,
  };

  await savePracticeHistory([entry, ...history]);
  return entry;
}

export type ProgressSummary = {
  totalSessions: number;
  totalMinutes: number;
  streakDays: number;
  weeklyMinutes: number[];
  weekLabels: string[];
  weekRangeLabel: string;
  weeklyGoalPercent: number;
  weeklyGoalMinutes: number;
  recentSessions: PracticeSession[];
  completedMeditationIdsToday: string[];
};

export function buildProgressSummary(
  history: PracticeSession[],
  now = new Date(),
): ProgressSummary {
  const totalSessions = history.length;
  const totalMinutes = history.reduce(
    (sum, item) => sum + item.durationMinutes,
    0,
  );

  const weekStart = getWeekStart(now);
  const weekLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weeklyMinutes = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    const key = dayKey(day);
    return history
      .filter((item) => dayKey(new Date(item.completedAt)) === key)
      .reduce((sum, item) => sum + item.durationMinutes, 0);
  });

  const weekTotal = weeklyMinutes.reduce((sum, value) => sum + value, 0);
  const weeklyGoalPercent = Math.min(
    100,
    Math.round((weekTotal / WEEKLY_GOAL_MINUTES) * 100),
  );

  const daysWithPractice = new Set(
    history.map((item) => dayKey(new Date(item.completedAt))),
  );
  let streakDays = 0;
  const cursor = startOfDay(now);
  if (!daysWithPractice.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (daysWithPractice.has(dayKey(cursor))) {
    streakDays += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const todayKey = dayKey(now);
  const completedMeditationIdsToday = history
    .filter((item) => dayKey(new Date(item.completedAt)) === todayKey)
    .map((item) => item.meditationId);

  return {
    totalSessions,
    totalMinutes,
    streakDays,
    weeklyMinutes,
    weekLabels,
    weekRangeLabel: formatWeekRange(weekStart),
    weeklyGoalPercent,
    weeklyGoalMinutes: WEEKLY_GOAL_MINUTES,
    recentSessions: history.slice(0, 8),
    completedMeditationIdsToday,
  };
}
