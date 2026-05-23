'use client';

import { ScheduledTask } from './types';

let alarmIntervalId: ReturnType<typeof setInterval> | null = null;
let audioContext: AudioContext | null = null;
let alarmCallback: ((task: ScheduledTask) => void) | null = null;

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }
  return Notification.permission;
}

export function playAlarmSound(): () => void {
  try {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 880;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    oscillator.start();

    let beat = 0;
    alarmIntervalId = setInterval(() => {
      if (!audioContext || !gainNode) return;
      const now = audioContext.currentTime;
      if (beat % 2 === 0) {
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
      }
      beat++;
    }, 500);

    return () => {
      if (alarmIntervalId) {
        clearInterval(alarmIntervalId);
        alarmIntervalId = null;
      }
      oscillator.stop();
      audioContext?.close();
      audioContext = null;
    };
  } catch {
    return () => {};
  }
}

export function stopAlarmSound() {
  if (alarmIntervalId) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}

const scheduledTimeouts: ReturnType<typeof setTimeout>[] = [];

export function scheduleTaskReminders(
  tasks: ScheduledTask[],
  date: string,
  onAlarm: (task: ScheduledTask) => void
) {
  // Clear existing timeouts
  scheduledTimeouts.forEach((id) => clearTimeout(id));
  scheduledTimeouts.length = 0;
  alarmCallback = onAlarm;

  const todayStr = date;
  const todayTasks = tasks.filter((t) => t.date === todayStr && !t.completed);

  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const task of todayTasks) {
    if (task.reminderType === 'silent') continue;

    const reminderMinute = task.startMinute - task.reminderMinutesBefore;
    const reminderTime = new Date(midnight.getTime() + reminderMinute * 60 * 1000);
    const msUntilReminder = reminderTime.getTime() - now.getTime();

    if (msUntilReminder > 0) {
      const timeoutId = setTimeout(() => {
        if (document.visibilityState === 'visible') {
          // Foreground: trigger alarm overlay
          if (alarmCallback) alarmCallback(task);
        } else {
          // Background: use system notification
          if (Notification.permission === 'granted') {
            new Notification(`${task.emoji} ${task.name}`, {
              body: `Starting in ${task.reminderMinutesBefore} minutes`,
              icon: '/icons/icon.svg',
            });
          }
        }
      }, msUntilReminder);

      scheduledTimeouts.push(timeoutId);
    }
  }
}

export function clearAllReminders() {
  scheduledTimeouts.forEach((id) => clearTimeout(id));
  scheduledTimeouts.length = 0;
}
