export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeLabel(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function combineDateAndTime(dateKey: string, time: Date): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(
    year,
    month - 1,
    day,
    time.getHours(),
    time.getMinutes(),
    0,
    0,
  );
}

export function parseTimeLabel(label: string, dateKey: string): Date {
  const match = label.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return combineDateAndTime(dateKey, new Date());
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === 'PM' && hour < 12) {
    hour += 12;
  }
  if (meridiem === 'AM' && hour === 12) {
    hour = 0;
  }

  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function sortRemindersByTime<T extends { scheduledAt: string }>(
  reminders: T[],
): T[] {
  return [...reminders].sort(
    (left, right) =>
      new Date(left.scheduledAt).getTime() -
      new Date(right.scheduledAt).getTime(),
  );
}
