'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlannerStore } from '@/lib/store';

const EMOJI_OPTIONS = ['📚', '💼', '🏃', '🎮', '🏠', '👥', '🎨', '🎵', '✈️', '💡', '🔬', '🍳', '🌿', '💰', '🧘'];
const COLOR_OPTIONS = [
  '#007AFF', '#5856D6', '#34C759', '#AF52DE',
  '#FF9500', '#FF2D55', '#FF3B30', '#5AC8FA',
  '#FFCC00', '#30B0C7', '#32ADE6', '#FF6482',
];

export default function SubjectsPage() {
  const router = useRouter();
  const { subjects, addSubject, deleteSubject } = usePlannerStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📚');
  const [newColor, setNewColor] = useState('#007AFF');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleAdd = () => {
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
      <div className="px-4 pt-12 pb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subjects</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-9 h-9 rounded-full bg-ios-blue flex items-center justify-center text-white text-xl active:scale-95 transition-transform"
        >
          +
        </button>
      </div>

      {/* Subject List */}
      <div className="px-4 space-y-3">
        {subjects.length === 0 ? (
          <div className="ios-card p-8 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">No subjects yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Tap + to add your first subject</p>
          </div>
        ) : (
          subjects.map((subject) => (
            <div key={subject.id} className="ios-card overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: subject.color + '25' }}
                >
                  {subject.emoji}
                </div>
                <button
                  onClick={() => router.push(`/subjects/${subject.id}`)}
                  className="flex-1 text-left"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white">{subject.name}</h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    {subject.presets.length} preset{subject.presets.length !== 1 ? 's' : ''}
                  </p>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/subjects/${subject.id}`)}
                    className="p-2 text-gray-400 hover:text-ios-blue transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setConfirmDelete(subject.id)}
                    className="p-2 text-gray-400 hover:text-ios-red transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              {/* Color bar */}
              <div className="h-1 w-full" style={{ backgroundColor: subject.color }} />
            </div>
          ))
        )}
      </div>

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop bg-black/40 px-6">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Subject?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              This will also delete all tasks associated with this subject.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-2xl bg-ios-gray-5 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteSubject(confirmDelete);
                  setConfirmDelete(null);
                }}
                className="flex-1 py-3 rounded-2xl bg-ios-red text-white font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center modal-backdrop bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
        >
          <div className="w-full max-w-[430px] bg-white dark:bg-gray-900 rounded-t-3xl p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5">New Subject</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Subject name"
                className="w-full px-4 py-3 rounded-2xl bg-ios-gray-6 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none text-base"
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Emoji</label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setNewEmoji(e)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      newEmoji === e ? 'bg-ios-blue/20 ring-2 ring-ios-blue' : 'bg-ios-gray-6 dark:bg-gray-800'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

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

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-2xl bg-ios-gray-5 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="flex-1 py-3 rounded-2xl bg-ios-blue text-white font-semibold disabled:opacity-50"
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
