'use client';

import { ScheduledTask } from '@/lib/types';
import { usePlannerStore } from '@/lib/store';

interface ReformatModalProps {
  date: string;
  newTasks: ScheduledTask[];
  unplaceable: string[];
  onApprove: () => void;
  onCancel: () => void;
}

function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function formatDuration(mins: number) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function ReformatModal({
  date,
  newTasks,
  unplaceable,
  onApprove,
  onCancel,
}: ReformatModalProps) {
  const { applyReformat } = usePlannerStore();

  const handleApprove = () => {
    applyReformat(newTasks, date);
    onApprove();
  };

  const sorted = [...newTasks].sort((a, b) => a.startMinute - b.startMinute);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center modal-backdrop bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-[430px] bg-white dark:bg-gray-900 rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="pt-4 pb-2 flex-shrink-0">
          <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 flex-shrink-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reformatted Day</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Here&apos;s how your day looks after the adjustment. Review and approve.
          </p>

          {unplaceable.length > 0 && (
            <div className="mt-3 p-3 bg-ios-orange/10 rounded-xl">
              <p className="text-sm font-medium text-ios-orange">
                ⚠️ {unplaceable.length} task{unplaceable.length !== 1 ? 's' : ''} could not be placed within the day.
              </p>
            </div>
          )}
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="space-y-2">
            {sorted.map((task) => {
              const isUnplaceable = unplaceable.includes(task.id);
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl ${
                    isUnplaceable
                      ? 'bg-ios-orange/10 border border-ios-orange/30'
                      : 'bg-ios-gray-6 dark:bg-gray-800'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: task.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {task.emoji} {task.name}
                      </span>
                      {!task.flexible && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex-shrink-0">
                          Fixed
                        </span>
                      )}
                      {isUnplaceable && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-ios-orange/20 text-ios-orange flex-shrink-0">
                          Unfit
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {formatTime(task.startMinute)} · {formatDuration(task.duration)}
                    </p>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className={`text-[10px] ${i <= task.importance ? 'star-active' : 'star-inactive'}`}>★</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex gap-3 flex-shrink-0 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl bg-ios-gray-5 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold active:scale-[0.98] transition-transform"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            className="flex-1 py-3.5 rounded-2xl bg-ios-blue text-white font-semibold active:scale-[0.98] transition-transform"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
