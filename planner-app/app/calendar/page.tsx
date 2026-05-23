'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { usePlannerStore } from '@/lib/store';

export default function CalendarPage() {
  const router = useRouter();
  const { tasks, subjects } = usePlannerStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getTasksForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter((t) => t.date === dateStr);
  };

  const getSubjectColors = (date: Date): string[] => {
    const dayTasks = getTasksForDay(date);
    const colors = new Set<string>();
    dayTasks.forEach((t) => colors.add(t.color));
    return Array.from(colors).slice(0, 4);
  };

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-ios-gray-6 dark:bg-gray-950">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="text-ios-blue text-sm font-medium px-3 py-1.5 rounded-full bg-ios-blue/10"
          >
            Today
          </button>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="w-9 h-9 rounded-full bg-ios-gray-5 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 active:scale-95 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
          </button>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>

          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-9 h-9 rounded-full bg-ios-gray-5 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 active:scale-95 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mt-4">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="px-4 pt-2">
        <div className="ios-card overflow-hidden">
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);
              const colors = getSubjectColors(day);
              const dayTasks = getTasksForDay(day);
              const allDone = dayTasks.length > 0 && dayTasks.every((t) => t.completed);

              return (
                <button
                  key={idx}
                  onClick={() => router.push(`/day/${dateStr}`)}
                  className={`flex flex-col items-center py-2 px-1 min-h-[56px] relative active:bg-ios-gray-6 dark:active:bg-gray-800 transition-colors ${
                    idx % 7 !== 6 ? 'border-r border-gray-100 dark:border-gray-800' : ''
                  } ${idx < days.length - 7 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
                >
                  <span
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                      isCurrentDay
                        ? 'bg-ios-blue text-white font-bold'
                        : isCurrentMonth
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Task dots */}
                  {colors.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: color,
                            opacity: allDone ? 0.5 : 1,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Subjects</h3>
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <div key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 ios-card">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {s.emoji} {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Month stats */}
      <div className="px-4 mt-4 mb-4">
        <div className="ios-card p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {format(currentMonth, 'MMMM')} Overview
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {(() => {
              const monthTasks = tasks.filter((t) => t.date.startsWith(format(currentMonth, 'yyyy-MM')));
              const completedTasks = monthTasks.filter((t) => t.completed).length;
              const activeDays = new Set(monthTasks.map((t) => t.date)).size;
              return (
                <>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{monthTasks.length}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-ios-green">{completedTasks}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Done</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-ios-blue">{activeDays}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Active days</p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
