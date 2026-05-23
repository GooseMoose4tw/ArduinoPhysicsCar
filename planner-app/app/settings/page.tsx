'use client';

import { useState } from 'react';
import { usePlannerStore } from '@/lib/store';
import { ReminderType } from '@/lib/types';
import { requestNotificationPermission } from '@/lib/notifications';

export default function SettingsPage() {
  const { settings, updateSettings } = usePlannerStore();
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | null>(null);

  const handleNotifPermission = async () => {
    const result = await requestNotificationPermission();
    setNotifPermission(result);
  };

  return (
    <div className="min-h-screen bg-ios-gray-6 dark:bg-gray-950">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      {/* Appearance */}
      <div className="px-4 mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-1">
          Appearance
        </h2>
        <div className="ios-card divide-y divide-gray-100 dark:divide-gray-800">
          <div className="p-4">
            <p className="font-medium text-gray-900 dark:text-white mb-3">Theme</p>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => updateSettings({ theme })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                    settings.theme === theme
                      ? 'bg-ios-blue text-white shadow-ios-sm'
                      : 'bg-ios-gray-5 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {theme === 'light' ? '☀️ Light' : theme === 'dark' ? '🌙 Dark' : '⚙️ System'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="px-4 mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-1">
          Schedule
        </h2>
        <div className="ios-card divide-y divide-gray-100 dark:divide-gray-800">
          {/* Day Start */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900 dark:text-white">Day Starts</p>
              <span className="text-ios-blue font-semibold">
                {settings.dayStartHour === 0
                  ? '12 AM'
                  : settings.dayStartHour < 12
                  ? `${settings.dayStartHour} AM`
                  : settings.dayStartHour === 12
                  ? '12 PM'
                  : `${settings.dayStartHour - 12} PM`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={12}
              step={1}
              value={settings.dayStartHour}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val < settings.dayEndHour) {
                  updateSettings({ dayStartHour: val });
                }
              }}
              className="w-full accent-ios-blue"
            />
            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
              <span>12 AM</span><span>12 PM</span>
            </div>
          </div>

          {/* Day End */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900 dark:text-white">Day Ends</p>
              <span className="text-ios-blue font-semibold">
                {settings.dayEndHour < 12
                  ? `${settings.dayEndHour} AM`
                  : settings.dayEndHour === 12
                  ? '12 PM'
                  : `${settings.dayEndHour - 12} PM`}
              </span>
            </div>
            <input
              type="range"
              min={12}
              max={24}
              step={1}
              value={settings.dayEndHour}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > settings.dayStartHour) {
                  updateSettings({ dayEndHour: val });
                }
              }}
              className="w-full accent-ios-blue"
            />
            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
              <span>12 PM</span><span>12 AM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="px-4 mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-1">
          Notifications
        </h2>
        <div className="ios-card divide-y divide-gray-100 dark:divide-gray-800">
          {/* Default Reminder Type */}
          <div className="p-4">
            <p className="font-medium text-gray-900 dark:text-white mb-1">Default Reminder</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Used when adding custom tasks</p>
            <div className="flex gap-2">
              {(['alarm', 'banner', 'silent'] as ReminderType[]).map((rt) => (
                <button
                  key={rt}
                  onClick={() => updateSettings({ defaultReminderType: rt })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                    settings.defaultReminderType === rt
                      ? 'bg-ios-blue text-white'
                      : 'bg-ios-gray-5 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {rt}
                </button>
              ))}
            </div>
          </div>

          {/* Vibration */}
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Vibration</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Note: not supported on iOS</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.vibrationEnabled}
                onChange={(e) => updateSettings({ vibrationEnabled: e.target.checked })}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          {/* Notification Permission */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                {notifPermission && (
                  <p className={`text-xs mt-0.5 ${
                    notifPermission === 'granted' ? 'text-ios-green' : 'text-ios-red'
                  }`}>
                    {notifPermission === 'granted' ? 'Permission granted ✓' : 'Permission denied'}
                  </p>
                )}
              </div>
              <button
                onClick={handleNotifPermission}
                className="px-4 py-2 rounded-xl bg-ios-blue text-white text-sm font-medium active:scale-95 transition-transform"
              >
                {notifPermission === 'granted' ? 'Enabled' : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="px-4 mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-1">
          About
        </h2>
        <div className="ios-card divide-y divide-gray-100 dark:divide-gray-800">
          <div className="p-4 flex items-center justify-between">
            <p className="font-medium text-gray-900 dark:text-white">Day Planner</p>
            <span className="text-sm text-gray-400 dark:text-gray-500">v1.0.0</span>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              An iPhone-style day planner with drag &amp; drop scheduling, smart reformatting, and alarm reminders.
            </p>
          </div>
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-ios-blue flex items-center justify-center text-white text-xl">
              📅
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Day Planner PWA</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Install to your home screen for the best experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="px-4 mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-1">
          Data
        </h2>
        <div className="ios-card">
          <button
            onClick={() => {
              if (confirm('This will clear all tasks and reset settings. Your subjects and presets will remain. Continue?')) {
                usePlannerStore.getState().updateSettings({
                  vibrationEnabled: false,
                  defaultReminderType: 'banner',
                  dayStartHour: 6,
                  dayEndHour: 23,
                  theme: 'system',
                });
              }
            }}
            className="w-full p-4 text-left text-ios-red font-medium"
          >
            Reset Settings
          </button>
        </div>
      </div>
    </div>
  );
}
