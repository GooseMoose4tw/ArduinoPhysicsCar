'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { usePlannerStore } from '@/lib/store';
import TimelineView from '@/components/TimelineView';
import AddTaskModal from '@/components/AddTaskModal';

export default function DayPage() {
  const router = useRouter();
  const params = useParams();
  const dateStr = params.date as string;

  const { tasks, subjects } = usePlannerStore();
  const [showAddModal, setShowAddModal] = useState(false);

  let date: Date;
  try {
    date = parseISO(dateStr);
  } catch {
    date = new Date();
  }

  const dayTasks = tasks.filter((t) => t.date === dateStr);
  const completed = dayTasks.filter((t) => t.completed).length;

  const prevDate = format(subDays(date, 1), 'yyyy-MM-dd');
  const nextDate = format(addDays(date, 1), 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');
  const isToday = dateStr === today;

  const dayLabel = isToday
    ? 'Today'
    : format(date, 'EEE, MMM d');

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 pt-12 pb-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => router.back()}
            className="p-1 text-ios-blue"
            aria-label="Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{dayLabel}</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
              {dayTasks.length > 0 && ` · ${completed} done`}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-9 h-9 rounded-full bg-ios-blue flex items-center justify-center text-white text-xl active:scale-95 transition-transform"
            aria-label="Add task"
          >
            +
          </button>
        </div>

        {/* Date navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push(`/day/${prevDate}`)}
            className="flex items-center gap-1 text-ios-blue text-sm font-medium py-1 px-2 rounded-lg active:bg-ios-gray-6 dark:active:bg-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
            {format(subDays(date, 1), 'EEE')}
          </button>

          {!isToday && (
            <button
              onClick={() => router.push(`/day/${today}`)}
              className="text-sm text-ios-blue font-medium px-3 py-1 rounded-full border border-ios-blue/30"
            >
              Today
            </button>
          )}

          <button
            onClick={() => router.push(`/day/${nextDate}`)}
            className="flex items-center gap-1 text-ios-blue text-sm font-medium py-1 px-2 rounded-lg active:bg-ios-gray-6 dark:active:bg-gray-800"
          >
            {format(addDays(date, 1), 'EEE')}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-hidden">
        <TimelineView
          date={dateStr}
          tasks={dayTasks}
          subjects={subjects}
        />
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <AddTaskModal
          date={dateStr}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
