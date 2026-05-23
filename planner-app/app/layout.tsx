'use client';

import './globals.css';
import { useEffect } from 'react';
import { usePlannerStore } from '@/lib/store';
import BottomNav from '@/components/BottomNav';
import AlarmOverlay from '@/components/AlarmOverlay';
import { useState } from 'react';
import { ScheduledTask } from '@/lib/types';
import { scheduleTaskReminders, requestNotificationPermission } from '@/lib/notifications';
import { format } from 'date-fns';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings, tasks } = usePlannerStore();
  const [alarmTask, setAlarmTask] = useState<ScheduledTask | null>(null);

  useEffect(() => {
    // Apply theme
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        if (settings.theme === 'system') {
          if (e.matches) root.classList.add('dark');
          else root.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [settings.theme]);

  useEffect(() => {
    requestNotificationPermission();
    const today = format(new Date(), 'yyyy-MM-dd');
    scheduleTaskReminders(tasks, today, (task) => {
      setAlarmTask(task);
    });
  }, [tasks]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#007AFF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Planner" />
        <link rel="manifest" href="/manifest.json" />
        <title>Day Planner</title>
      </head>
      <body>
        <div className="min-h-screen flex flex-col max-w-[430px] mx-auto relative">
          <main className="flex-1 pb-20">
            {children}
          </main>
          <BottomNav />
        </div>
        {alarmTask && (
          <AlarmOverlay
            task={alarmTask}
            onDismiss={() => setAlarmTask(null)}
            onSnooze={() => setAlarmTask(null)}
          />
        )}
      </body>
    </html>
  );
}
