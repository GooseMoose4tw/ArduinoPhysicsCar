'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePlannerStore } from '@/lib/store';
import PresetCard from '@/components/PresetCard';
import { Importance, ReminderType, Preset } from '@/lib/types';

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

type PresetFormData = {
  name: string;
  defaultDuration: number;
  importance: Importance;
  flexible: boolean;
  reminderType: ReminderType;
  reminderMinutesBefore: number;
};

const DEFAULT_FORM: PresetFormData = {
  name: '',
  defaultDuration: 30,
  importance: 3,
  flexible: true,
  reminderType: 'banner',
  reminderMinutesBefore: 10,
};

const EMOJI_OPTIONS = ['📚', '💼', '🏃', '🎮', '🏠', '👥', '🎨', '🎵', '✈️', '💡', '🔬', '🍳', '🌿', '💰', '🧘'];
const COLOR_OPTIONS = [
  '#007AFF', '#5856D6', '#34C759', '#AF52DE',
  '#FF9500', '#FF2D55', '#FF3B30', '#5AC8FA',
  '#FFCC00', '#30B0C7', '#32ADE6', '#FF6482',
];

export default function SubjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { subjects, addPreset, updatePreset, deletePreset, updateSubject } = usePlannerStore();
  const subject = subjects.find((s) => s.id === id);

  const [showPresetModal, setShowPresetModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [form, setForm] = useState<PresetFormData>(DEFAULT_FORM);
  const [editingSubject, setEditingSubject] = useState(false);
  const [subjectName, setSubjectName] = useState(subject?.name ?? '');
  const [subjectEmoji, setSubjectEmoji] = useState(subject?.emoji ?? '📚');
  const [subjectColor, setSubjectColor] = useState(subject?.color ?? '#007AFF');

  if (!subject) {
    return (
      <div className="min-h-screen bg-ios-gray-6 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Subject not found</p>
          <button onClick={() => router.back()} className="mt-3 text-ios-blue font-medium">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const openAddPreset = () => {
    setEditingPreset(null);
    setForm(DEFAULT_FORM);
    setShowPresetModal(true);
  };

  const openEditPreset = (preset: Preset) => {
    setEditingPreset(preset);
    setForm({
      name: preset.name,
      defaultDuration: preset.defaultDuration,
      importance: preset.importance,
      flexible: preset.flexible,
      reminderType: preset.reminderType,
      reminderMinutesBefore: preset.reminderMinutesBefore,
    });
    setShowPresetModal(true);
  };

  const handleSavePreset = () => {
    if (!form.name.trim()) return;
    if (editingPreset) {
      updatePreset(subject.id, editingPreset.id, form);
    } else {
      addPreset(subject.id, form);
    }
    setShowPresetModal(false);
  };

  const handleSaveSubject = () => {
    updateSubject(subject.id, { name: subjectName, emoji: subjectEmoji, color: subjectColor });
    setEditingSubject(false);
  };

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="min-h-screen bg-ios-gray-6 dark:bg-gray-950">
      {/* Header */}
      <div
        className="px-4 pt-12 pb-6"
        style={{ background: `linear-gradient(135deg, ${subject.color}20, transparent)` }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-ios-blue mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
          Subjects
        </button>

        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-ios"
            style={{ backgroundColor: subject.color + '25' }}
          >
            {subject.emoji}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{subject.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subject.presets.length} preset{subject.presets.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => {
              setSubjectName(subject.name);
              setSubjectEmoji(subject.emoji);
              setSubjectColor(subject.color);
              setEditingSubject(true);
            }}
            className="p-2 text-gray-400 hover:text-ios-blue transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Presets</h2>
          <button
            onClick={openAddPreset}
            className="flex items-center gap-1 text-ios-blue text-sm font-medium"
          >
            <span>+ Add</span>
          </button>
        </div>

        {subject.presets.length === 0 ? (
          <div className="ios-card p-8 text-center">
            <p className="text-3xl mb-3">⚡</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">No presets yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-4">
              Presets are task templates you can quickly drag onto the timeline
            </p>
            <button
              onClick={openAddPreset}
              className="px-6 py-2.5 rounded-xl bg-ios-blue text-white text-sm font-semibold"
            >
              Add First Preset
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {subject.presets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                subjectColor={subject.color}
                onEdit={() => openEditPreset(preset)}
                onDelete={() => deletePreset(subject.id, preset.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center modal-backdrop bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setEditingSubject(false)}
        >
          <div className="w-full max-w-[430px] bg-white dark:bg-gray-900 rounded-t-3xl p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Edit Subject</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-ios-gray-6 dark:bg-gray-800 text-gray-900 dark:text-white outline-none text-base"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Emoji</label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setSubjectEmoji(e)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center ${
                      subjectEmoji === e ? 'bg-ios-blue/20 ring-2 ring-ios-blue' : 'bg-ios-gray-6 dark:bg-gray-800'
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
                    onClick={() => setSubjectColor(c)}
                    className={`w-9 h-9 rounded-full transition-all ${
                      subjectColor === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditingSubject(false)} className="flex-1 py-3 rounded-2xl bg-ios-gray-5 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">Cancel</button>
              <button onClick={handleSaveSubject} className="flex-1 py-3 rounded-2xl bg-ios-blue text-white font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Preset Modal */}
      {showPresetModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center modal-backdrop bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setShowPresetModal(false)}
        >
          <div className="w-full max-w-[430px] bg-white dark:bg-gray-900 rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
              {editingPreset ? 'Edit Preset' : 'New Preset'}
            </h3>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Study Session"
                className="w-full px-4 py-3 rounded-2xl bg-ios-gray-6 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none text-base"
                autoFocus
              />
            </div>

            {/* Duration */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</label>
                <span className="text-sm font-semibold text-ios-blue">{formatDuration(form.defaultDuration)}</span>
              </div>
              <input
                type="range"
                min={5}
                max={240}
                step={5}
                value={form.defaultDuration}
                onChange={(e) => setForm({ ...form, defaultDuration: Number(e.target.value) })}
                className="w-full accent-ios-blue"
              />
              <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                <span>5m</span><span>4h</span>
              </div>
            </div>

            {/* Importance */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Importance</label>
              <StarRating value={form.importance} onChange={(v) => setForm({ ...form, importance: v })} />
            </div>

            {/* Flexible */}
            <div className="flex items-center justify-between mb-4 p-4 rounded-2xl bg-ios-gray-6 dark:bg-gray-800">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Flexible</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Can be rescheduled during reformat</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={form.flexible}
                  onChange={(e) => setForm({ ...form, flexible: e.target.checked })}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* Reminder Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Reminder Type</label>
              <div className="flex gap-2">
                {(['alarm', 'banner', 'silent'] as ReminderType[]).map((rt) => (
                  <button
                    key={rt}
                    onClick={() => setForm({ ...form, reminderType: rt })}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                      form.reminderType === rt
                        ? 'bg-ios-blue text-white'
                        : 'bg-ios-gray-5 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {rt}
                  </button>
                ))}
              </div>
            </div>

            {/* Reminder Minutes */}
            {form.reminderType !== 'silent' && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Remind before</label>
                  <span className="text-sm font-semibold text-ios-blue">{form.reminderMinutesBefore}m</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={60}
                  step={1}
                  value={form.reminderMinutesBefore}
                  onChange={(e) => setForm({ ...form, reminderMinutesBefore: Number(e.target.value) })}
                  className="w-full accent-ios-blue"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowPresetModal(false)}
                className="flex-1 py-3 rounded-2xl bg-ios-gray-5 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                disabled={!form.name.trim()}
                className="flex-1 py-3 rounded-2xl bg-ios-blue text-white font-semibold disabled:opacity-50"
              >
                {editingPreset ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
