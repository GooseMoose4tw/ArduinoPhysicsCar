'use client';

import { useEffect, useRef } from 'react';
import { ScheduledTask } from '@/lib/types';
import { playAlarmSound } from '@/lib/notifications';
import { usePlannerStore } from '@/lib/store';

interface AlarmOverlayProps {
  task: ScheduledTask;
  onDismiss: () => void;
  onSnooze: () => void;
}

function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function AlarmOverlay({ task, onDismiss, onSnooze }: AlarmOverlayProps) {
  const stopAlarmRef = useRef<(() => void) | null>(null);
  const { updateTask, settings } = usePlannerStore();

  useEffect(() => {
    if (task.reminderType === 'alarm') {
      stopAlarmRef.current = playAlarmSound();
    }
    if (settings.vibrationEnabled && navigator.vibrate) {
      const pattern = [400, 200, 400, 200, 400];
      navigator.vibrate(pattern);
    }
    return () => {
      stopAlarmRef.current?.();
    };
  }, [task, settings.vibrationEnabled]);

  const handleDismiss = () => {
    stopAlarmRef.current?.();
    onDismiss();
  };

  const handleSnooze = () => {
    stopAlarmRef.current?.();
    // Snooze: move the task 5 minutes forward
    updateTask(task.id, { startMinute: task.startMinute + 5 });
    onSnooze();
  };

  const handleComplete = () => {
    stopAlarmRef.current?.();
    updateTask(task.id, { completed: true });
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Blurred background */}
      <div
        className="absolute inset-0 modal-backdrop"
        style={{ backgroundColor: task.color + '40' }}
      />

      {/* Content */}
      <div className="relative w-full max-w-[390px] mx-4 bg-white/90 dark:bg-gray-900/90 rounded-3xl p-8 shadow-ios-lg animate-alarm-pulse text-center">
        {/* Pulsing rings */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ backgroundColor: task.color }}
          />
          <div
            className="absolute inset-2 rounded-full animate-ping opacity-20"
            style={{ backgroundColor: task.color, animationDelay: '0.3s' }}
          />
          <div
            className="relative w-24 h-24 rounded-full flex items-center justify-center text-5xl"
            style={{ backgroundColor: task.color + '25' }}
          >
            {task.emoji}
          </div>
        </div>

        <div className="mb-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Reminder
          </span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{task.name}</h2>
        <p className="text-ios-gray-1 dark:text-gray-400 mb-1">
          {formatTime(task.startMinute)}
        </p>

        {task.notes && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 italic">{task.notes}</p>
        )}

        {/* Importance */}
        <div className="flex items-center justify-center gap-0.5 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`text-base ${i <= task.importance ? 'star-active' : 'star-inactive'}`}>
              ★
            </span>
          ))}
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleComplete}
            className="w-full py-4 rounded-2xl font-semibold text-white text-base active:scale-[0.98] transition-transform"
            style={{ backgroundColor: task.color }}
          >
            Mark Complete
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleSnooze}
              className="flex-1 py-3 rounded-2xl bg-ios-gray-5 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold active:scale-[0.98] transition-transform"
            >
              Snooze 5m
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 py-3 rounded-2xl bg-ios-gray-5 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold active:scale-[0.98] transition-transform"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
