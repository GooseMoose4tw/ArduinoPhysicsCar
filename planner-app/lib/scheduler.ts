import { ScheduledTask, AppSettings } from './types';

interface Gap {
  start: number;
  end: number;
}

function findGaps(fixedTasks: ScheduledTask[], dayStart: number, dayEnd: number): Gap[] {
  const sorted = [...fixedTasks].sort((a, b) => a.startMinute - b.startMinute);
  const gaps: Gap[] = [];
  let cursor = dayStart;

  for (const task of sorted) {
    if (task.startMinute > cursor) {
      gaps.push({ start: cursor, end: task.startMinute });
    }
    const taskEnd = task.startMinute + task.duration;
    if (taskEnd > cursor) {
      cursor = taskEnd;
    }
  }

  if (cursor < dayEnd) {
    gaps.push({ start: cursor, end: dayEnd });
  }

  return gaps;
}

export function reformatDay(
  tasks: ScheduledTask[],
  extendedTaskId: string,
  extraMinutes: number,
  settings: AppSettings
): { rescheduled: ScheduledTask[]; unplaceable: string[] } {
  const dayStart = settings.dayStartHour * 60;
  const dayEnd = settings.dayEndHour * 60;

  // Apply extension to the extended task
  const updatedTasks = tasks.map((t) =>
    t.id === extendedTaskId ? { ...t, duration: t.duration + extraMinutes } : { ...t }
  );

  // Classify fixed vs flexible
  const fixed: ScheduledTask[] = [];
  const flexible: ScheduledTask[] = [];

  for (const task of updatedTasks) {
    const isFixed =
      task.importance === 5 || (task.importance >= 4 && !task.flexible);
    if (isFixed) {
      fixed.push(task);
    } else {
      flexible.push(task);
    }
  }

  // Sort flexible tasks by importance descending
  flexible.sort((a, b) => b.importance - a.importance);

  const gaps = findGaps(fixed, dayStart, dayEnd);
  const placed: ScheduledTask[] = [];
  const unplaceable: string[] = [];

  for (const task of flexible) {
    let scheduled = false;
    for (const gap of gaps) {
      const gapSize = gap.end - gap.start;
      if (gapSize >= task.duration) {
        placed.push({ ...task, startMinute: gap.start });
        // Shrink gap
        gap.start += task.duration;
        scheduled = true;
        break;
      }
    }
    if (!scheduled) {
      unplaceable.push(task.id);
      // Keep original position but mark as warning
      placed.push({ ...task });
    }
  }

  const rescheduled = [...fixed, ...placed].sort(
    (a, b) => a.startMinute - b.startMinute
  );

  return { rescheduled, unplaceable };
}

export function autoScheduleTask(
  newTask: ScheduledTask,
  existingTasks: ScheduledTask[],
  settings: AppSettings
): ScheduledTask {
  const dayStart = settings.dayStartHour * 60;
  const dayEnd = settings.dayEndHour * 60;
  const dayTasks = existingTasks.filter((t) => t.date === newTask.date);

  const gaps = findGaps(dayTasks, dayStart, dayEnd);

  for (const gap of gaps) {
    if (gap.end - gap.start >= newTask.duration) {
      return { ...newTask, startMinute: gap.start };
    }
  }

  // No gap found, place at end of day
  return { ...newTask, startMinute: Math.max(dayStart, dayEnd - newTask.duration) };
}
