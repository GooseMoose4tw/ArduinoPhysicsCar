'use client';

import { useState } from 'react';
import { ScheduledTask } from '@/lib/types';

interface ExtendModalProps {
  task: ScheduledTask;
  onExtend: (extraMinutes: number) => void;
  onCancel: () => void;
}

const QUICK_OPTIONS = [15, 30, 45, 60, 90];

export default function ExtendModal({ task, onExtend, onCancel }: ExtendModalProps) {
  const [extraMinutes, setExtraMinutes] = useState(30);

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center modal-backdrop bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-[430px] bg-white dark:bg-gray-900 rounded-t-3xl p-6 animate-slide-up">
        <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Extend Task</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          {task.emoji} {task.name} · currently {formatDuration(task.duration)}
        </p>

        {/* Quick options */}
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
            Add time
          </p>
          <div className="flex gap-2 flex-wrap">
            {QUICK_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setExtraMinutes(opt)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  extraMinutes === opt
                    ? 'bg-ios-blue text-white shadow-ios-sm'
                    : 'bg-ios-gray-5 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                +{formatDuration(opt)}
              </button>
            ))}
          </div>
        </div>

        {/* Custom slider */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Custom
            </p>
            <span className="text-sm font-semibold text-ios-blue">
              +{formatDuration(extraMinutes)}
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={180}
            step={5}
            value={extraMinutes}
            onChange={(e) => setExtraMinutes(Number(e.target.value))}
            className="w-full accent-ios-blue"
          />
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
            <span>5m</span>
            <span>3h</span>
          </div>
        </div>

        {/* New duration preview */}
        <div className="mb-6 p-4 rounded-2xl bg-ios-gray-6 dark:bg-gray-800 flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">New total duration</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatDuration(task.duration + extraMinutes)}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl bg-ios-gray-5 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold active:scale-[0.98] transition-transform"
          >
            Cancel
          </button>
          <button
            onClick={() => onExtend(extraMinutes)}
            className="flex-1 py-3.5 rounded-2xl bg-ios-blue text-white font-semibold active:scale-[0.98] transition-transform"
          >
            Extend &amp; Reformat
          </button>
        </div>
      </div>
    </div>
  );
}
