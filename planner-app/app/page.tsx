'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { usePlannerStore } from '@/lib/store';
import SubjectCard from '@/components/SubjectCard';
import Link from 'next/link';
import { Subject } from '@/lib/types';

const EMOJI_OPTIONS = ['📚', '💼', '🏃', '🎮', '🏠', '👥', '🎨', '🎵', '✈️', '💡', '🔬', '🍳', '🌿', '💰', '🧘'];
const COLOR_OPTIONS = [
  '#007AFF', '#5856D6', '#34C759', '#AF52DE',
  '#FF9500', '#FF2D55', '#FF3B30', '#5AC8FA',
  '#FFCC00', '#30B0C7', '#32ADE6', '#FF6482',
];

export default function HomePage() {
  const router = useRouter();
  const { subjects, tasks, addSubject } = usePlannerStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📚');
  const [newColor, setNewColor] = useState('#007AFF');

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = tasks
    .filter((t) => t.date === today)
    .sort((a, b) => a.startMinute - b.startMinute);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const handleAddSubject = () => {
    if (!newName.trim()) return;
    addSubject({ name: newName.trim(), color: newColor, emoji: newEmoji });
    setNewName('');
    setNewEmoji('📚');
    setNewColor('#007AFF');
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-ios-gray-6 dark:bg-gray-950">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Planner</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
      </div>

      {/* Today's Tasks Strip */}
      <div className="mx-4 mb-4 ios-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Today</h2>
          <Link
            href={`/day/${today}`}
            className="text-sm text-ios-blue font-medium"
          >
            View All
          </Link>
        </div>

        {todayTasks.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-400 dark:text-gray-500 text-sm">No tasks scheduled</p>
            <button
              onClick={() => router.push(`/day/${today}`)}
              className="mt-2 text-ios-blue text-sm font-medium"
            >
              Add tasks to today
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 py-1"
                onClick={() => router.push(`/day/${today}`)}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: task.color }}
                />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100 flex-1 truncate">
                  {task.emoji} {task.name}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {formatTime(task.startMinute)}
                </span>
                {task.completed && (
                  <span className="text-ios-green text-xs">✓</span>
                )}
              </div>
            ))}
            {todayTasks.length > 4 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center pt-1">
                +{todayTasks.length - 4} more
              </p>
            )}
          </div>
        )}
      </div>

      {/* Subject Grid */}
      <div className="px-4">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Subjects</h2>
        <div className="grid grid-cols-2 gap-3">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              taskCount={tasks.filter((t) => t.subjectId === subject.id && t.date === today).length}
              onClick={() => router.push(`/subjects/${subject.id}`)}
            />
          ))}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-ios-blue rounded-full shadow-ios-lg flex items-center justify-center text-white text-2xl z-10 active:scale-95 transition-transform"
        style={{ maxWidth: '430px' }}
        aria-label="Add subject"
      >
        +
      </button>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center modal-backdrop bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
        >
          <div className="w-full max-w-[430px] bg-white dark:bg-gray-900 rounded-t-3xl p-6 animate-slide-up">
            <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5">New Subject</h3>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Subject name"
                className="w-full px-4 py-3 rounded-2xl bg-ios-gray-6 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none text-base"
                autoFocus
              />
            </div>

            {/* Emoji */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Emoji</label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setNewEmoji(e)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      newEmoji === e
                        ? 'bg-ios-blue/20 ring-2 ring-ios-blue'
                        : 'bg-ios-gray-6 dark:bg-gray-800'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={`w-9 h-9 rounded-full transition-all ${
                      newColor === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-ios-gray-6 dark:bg-gray-800">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: newColor + '25' }}
              >
                {newEmoji}
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {newName || 'Subject Name'}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-2xl bg-ios-gray-5 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubject}
                disabled={!newName.trim()}
                className="flex-1 py-3 rounded-2xl bg-ios-blue text-white font-semibold disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
