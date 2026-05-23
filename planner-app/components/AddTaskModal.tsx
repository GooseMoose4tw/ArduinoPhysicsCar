'use client';

import { useState } from 'react';
import { usePlannerStore } from '@/lib/store';
import { Importance, ReminderType } from '@/lib/types';

interface AddTaskModalProps {
  date: string;
  initialStartMinute?: number;
  onClose: () => void;
}

function StarRating({
  value,
  onChange,
}: {
  value: Importance;
  onChange: (v: Importance) => void;
}) {
  return (
    <div className="flex gap-1">
      {([1, 2, 3, 4, 5] as Importance[]).map((i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`text-2xl transition-all ${i <= value ? 'star-active' : 'star-inactive'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function AddTaskModal({ date, initialStartMinute, onClose }: AddTaskModalProps) {
  const { subjects, scheduleTask } = usePlannerStore();
  const [step, setStep] = useState<'select-preset' | 'custom'>('select-preset');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  // Custom task fields
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📝');
  const [color, setColor] = useState('#007AFF');
  const [duration, setDuration] = useState(30);
  const [importance, setImportance] = useState<Importance>(3);
  const [flexible, setFlexible] = useState(true);
  const [reminderType, setReminderType] = useState<ReminderType>('banner');
  const [reminderBefore, setReminderBefore] = useState(10);
  const [startHour, setStartHour] = useState(Math.floor((initialStartMinute ?? 540) / 60));
  const [startMin, setStartMin] = useState((initialStartMinute ?? 540) % 60);

  const handlePresetSelect = (presetId: string, subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    const preset = subject?.presets.find((p) => p.id === presetId);
    if (!subject || !preset) return;

    scheduleTask({
      date,
      presetId: preset.id,
      subjectId: subject.id,
      name: preset.name,
      color: subject.color,
      emoji: subject.emoji,
      startMinute: initialStartMinute ?? startHour * 60 + startMin,
      duration: preset.defaultDuration,
      importance: preset.importance,
      flexible: preset.flexible,
      reminderType: preset.reminderType,
      reminderMinutesBefore: preset.reminderMinutesBefore,
      completed: false,
    });
    onClose();
  };

  const handleCustomAdd = () => {
    if (!name.trim()) return;
    scheduleTask({
      date,
      name: name.trim(),
      color,
      emoji,
      startMinute: startHour * 60 + startMin,
      duration,
      importance,
      flexible,
      reminderType,
      reminderMinutesBefore: reminderBefore,
      completed: false,
    });
    onClose();
  };

  const formatHour = (h: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr} ${ampm}`;
  };

  const EMOJI_OPTIONS = ['📝', '📚', '💼', '🏃', '🎮', '🏠', '👥', '🎨', '🍳', '🌿', '💡', '🔬'];
  const COLOR_OPTIONS = [
    '#007AFF', '#5856D6', '#34C759', '#AF52DE',
    '#FF9500', '#FF2D55', '#FF3B30', '#5AC8FA',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center modal-backdrop bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[430px] bg-white dark:bg-gray-900 rounded-t-3xl max-h-[90vh] flex flex-col animate-slide-up">
        {/* Handle & Header */}
        <div className="px-6 pt-4 pb-3 flex-shrink-0">
          <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Task</h3>
            <div className="flex bg-ios-gray-5 dark:bg-gray-700 rounded-xl p-0.5">
              <button
                onClick={() => setStep('select-preset')}
                className={`px-3 py-1.5 rounded-[10px] text-sm font-medium transition-all ${
                  step === 'select-preset'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-ios-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Presets
              </button>
              <button
                onClick={() => setStep('custom')}
                className={`px-3 py-1.5 rounded-[10px] text-sm font-medium transition-all ${
                  step === 'custom'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-ios-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Custom
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {step === 'select-preset' ? (
            <div>
              {/* Time picker */}
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Start:</span>
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                  className="flex-1 px-3 py-2 rounded-xl bg-ios-gray-6 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{formatHour(i)}</option>
                  ))}
                </select>
                <select
                  value={startMin}
                  onChange={(e) => setStartMin(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl bg-ios-gray-6 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none"
                >
                  {[0, 15, 30, 45].map((m) => (
                    <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                  ))}
                </select>
              </div>

              {subjects.map((subject) => (
                <div key={subject.id} className="mb-4">
                  <button
                    onClick={() => setSelectedSubjectId(selectedSubjectId === subject.id ? '' : subject.id)}
                    className="flex items-center gap-2 mb-2 w-full text-left"
                  >
                    <span className="text-base">{subject.emoji}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{subject.name}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${
                        selectedSubjectId === subject.id ? 'rotate-180' : ''
                      }`}
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {(selectedSubjectId === subject.id || subjects.length <= 3) && (
                    <div className="space-y-2 pl-1">
                      {subject.presets.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500 pl-3">No presets yet</p>
                      ) : (
                        subject.presets.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => handlePresetSelect(preset.id, subject.id)}
                            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-ios-gray-6 dark:bg-gray-800 hover:bg-ios-gray-5 dark:hover:bg-gray-700 active:scale-[0.98] transition-all text-left"
                          >
                            <div
                              className="w-2 self-stretch rounded-full flex-shrink-0"
                              style={{ backgroundColor: subject.color }}
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-sm">{preset.name}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {preset.defaultDuration < 60 ? `${preset.defaultDuration}m` : `${Math.floor(preset.defaultDuration / 60)}h${preset.defaultDuration % 60 > 0 ? ` ${preset.defaultDuration % 60}m` : ''}`}
                                {preset.flexible && ' · Flexible'}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Task Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What do you need to do?"
                  className="w-full px-4 py-3 rounded-2xl bg-ios-gray-6 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none text-base"
                  autoFocus
                />
              </div>

              {/* Emoji */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Emoji</label>
                <div className="flex gap-2 flex-wrap">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                        emoji === e ? 'bg-ios-blue/20 ring-2 ring-ios-blue' : 'bg-ios-gray-6 dark:bg-gray-800'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-9 h-9 rounded-full transition-all ${
                        color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Start Time</label>
                <div className="flex gap-2">
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(Number(e.target.value))}
                    className="flex-1 px-3 py-3 rounded-2xl bg-ios-gray-6 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{formatHour(i)}</option>
                    ))}
                  </select>
                  <select
                    value={startMin}
                    onChange={(e) => setStartMin(Number(e.target.value))}
                    className="px-3 py-3 rounded-2xl bg-ios-gray-6 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  >
                    {[0, 15, 30, 45].map((m) => (
                      <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</label>
                  <span className="text-sm font-semibold text-ios-blue">
                    {duration < 60 ? `${duration}m` : `${Math.floor(duration / 60)}h${duration % 60 > 0 ? ` ${duration % 60}m` : ''}`}
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={240}
                  step={5}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-ios-blue"
                />
              </div>

              {/* Importance */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Importance</label>
                <StarRating value={importance} onChange={setImportance} />
              </div>

              {/* Flexible */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-ios-gray-6 dark:bg-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Flexible</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Can be rescheduled if needed</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={flexible}
                    onChange={(e) => setFlexible(e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              {/* Reminder type */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Reminder</label>
                <div className="flex gap-2">
                  {(['alarm', 'banner', 'silent'] as ReminderType[]).map((rt) => (
                    <button
                      key={rt}
                      onClick={() => setReminderType(rt)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                        reminderType === rt
                          ? 'bg-ios-blue text-white'
                          : 'bg-ios-gray-5 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {rt}
                    </button>
                  ))}
                </div>
              </div>

              {reminderType !== 'silent' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Remind before</label>
                    <span className="text-sm font-semibold text-ios-blue">{reminderBefore}m</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    step={1}
                    value={reminderBefore}
                    onChange={(e) => setReminderBefore(Number(e.target.value))}
                    className="w-full accent-ios-blue"
                  />
                </div>
              )}

              <button
                onClick={handleCustomAdd}
                disabled={!name.trim()}
                className="w-full py-4 rounded-2xl bg-ios-blue text-white font-semibold disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                Add Task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
