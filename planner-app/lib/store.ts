import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'crypto';
import { Subject, Preset, ScheduledTask, AppSettings } from './types';

// Simple UUID generator without crypto dependency
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'school',
    name: 'School',
    color: '#007AFF',
    emoji: '📚',
    presets: [
      {
        id: 'school-study',
        subjectId: 'school',
        name: 'Study Session',
        defaultDuration: 60,
        importance: 4,
        flexible: false,
        reminderType: 'banner',
        reminderMinutesBefore: 10,
      },
      {
        id: 'school-hw',
        subjectId: 'school',
        name: 'Homework',
        defaultDuration: 45,
        importance: 3,
        flexible: true,
        reminderType: 'banner',
        reminderMinutesBefore: 5,
      },
    ],
  },
  {
    id: 'work',
    name: 'Work',
    color: '#5856D6',
    emoji: '💼',
    presets: [
      {
        id: 'work-meeting',
        subjectId: 'work',
        name: 'Meeting',
        defaultDuration: 60,
        importance: 5,
        flexible: false,
        reminderType: 'alarm',
        reminderMinutesBefore: 15,
      },
      {
        id: 'work-focus',
        subjectId: 'work',
        name: 'Focus Block',
        defaultDuration: 90,
        importance: 4,
        flexible: true,
        reminderType: 'banner',
        reminderMinutesBefore: 5,
      },
    ],
  },
  {
    id: 'health',
    name: 'Health',
    color: '#34C759',
    emoji: '🏃',
    presets: [
      {
        id: 'health-workout',
        subjectId: 'health',
        name: 'Workout',
        defaultDuration: 60,
        importance: 4,
        flexible: true,
        reminderType: 'banner',
        reminderMinutesBefore: 10,
      },
      {
        id: 'health-meal',
        subjectId: 'health',
        name: 'Meal Prep',
        defaultDuration: 30,
        importance: 3,
        flexible: true,
        reminderType: 'silent',
        reminderMinutesBefore: 5,
      },
    ],
  },
  {
    id: 'hobbies',
    name: 'Hobbies',
    color: '#AF52DE',
    emoji: '🎮',
    presets: [
      {
        id: 'hobbies-game',
        subjectId: 'hobbies',
        name: 'Gaming',
        defaultDuration: 60,
        importance: 2,
        flexible: true,
        reminderType: 'silent',
        reminderMinutesBefore: 5,
      },
      {
        id: 'hobbies-read',
        subjectId: 'hobbies',
        name: 'Reading',
        defaultDuration: 30,
        importance: 2,
        flexible: true,
        reminderType: 'silent',
        reminderMinutesBefore: 5,
      },
    ],
  },
  {
    id: 'personal',
    name: 'Personal',
    color: '#FF9500',
    emoji: '🏠',
    presets: [
      {
        id: 'personal-chores',
        subjectId: 'personal',
        name: 'Chores',
        defaultDuration: 30,
        importance: 3,
        flexible: true,
        reminderType: 'silent',
        reminderMinutesBefore: 5,
      },
      {
        id: 'personal-errands',
        subjectId: 'personal',
        name: 'Errands',
        defaultDuration: 45,
        importance: 3,
        flexible: true,
        reminderType: 'banner',
        reminderMinutesBefore: 10,
      },
    ],
  },
  {
    id: 'social',
    name: 'Social',
    color: '#FF2D55',
    emoji: '👥',
    presets: [
      {
        id: 'social-hangout',
        subjectId: 'social',
        name: 'Hangout',
        defaultDuration: 120,
        importance: 3,
        flexible: true,
        reminderType: 'banner',
        reminderMinutesBefore: 15,
      },
      {
        id: 'social-call',
        subjectId: 'social',
        name: 'Phone Call',
        defaultDuration: 30,
        importance: 3,
        flexible: true,
        reminderType: 'banner',
        reminderMinutesBefore: 5,
      },
    ],
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  vibrationEnabled: false,
  defaultReminderType: 'banner',
  dayStartHour: 6,
  dayEndHour: 23,
  theme: 'system',
};

interface PlannerStore {
  subjects: Subject[];
  tasks: ScheduledTask[];
  settings: AppSettings;
  // Subject actions
  addSubject: (s: Omit<Subject, 'id' | 'presets'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  // Preset actions
  addPreset: (subjectId: string, preset: Omit<Preset, 'id' | 'subjectId'>) => void;
  updatePreset: (subjectId: string, presetId: string, updates: Partial<Preset>) => void;
  deletePreset: (subjectId: string, presetId: string) => void;
  // Task actions
  scheduleTask: (task: Omit<ScheduledTask, 'id'>) => string;
  updateTask: (id: string, updates: Partial<ScheduledTask>) => void;
  deleteTask: (id: string) => void;
  applyReformat: (newTasks: ScheduledTask[], date: string) => void;
  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void;
}

// Suppress unused import warning
void uuidv4;

export const usePlannerStore = create<PlannerStore>()(
  persist(
    (set) => ({
      subjects: DEFAULT_SUBJECTS,
      tasks: [],
      settings: DEFAULT_SETTINGS,

      addSubject: (s) =>
        set((state) => ({
          subjects: [
            ...state.subjects,
            { ...s, id: generateId(), presets: [] },
          ],
        })),

      updateSubject: (id, updates) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === id ? { ...sub, ...updates } : sub
          ),
        })),

      deleteSubject: (id) =>
        set((state) => ({
          subjects: state.subjects.filter((sub) => sub.id !== id),
          tasks: state.tasks.filter((t) => t.subjectId !== id),
        })),

      addPreset: (subjectId, preset) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId
              ? {
                  ...sub,
                  presets: [
                    ...sub.presets,
                    { ...preset, id: generateId(), subjectId },
                  ],
                }
              : sub
          ),
        })),

      updatePreset: (subjectId, presetId, updates) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId
              ? {
                  ...sub,
                  presets: sub.presets.map((p) =>
                    p.id === presetId ? { ...p, ...updates } : p
                  ),
                }
              : sub
          ),
        })),

      deletePreset: (subjectId, presetId) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId
              ? {
                  ...sub,
                  presets: sub.presets.filter((p) => p.id !== presetId),
                }
              : sub
          ),
        })),

      scheduleTask: (task) => {
        const id = generateId();
        set((state) => ({
          tasks: [...state.tasks, { ...task, id }],
        }));
        return id;
      },

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      applyReformat: (newTasks, date) =>
        set((state) => ({
          tasks: [
            ...state.tasks.filter((t) => t.date !== date),
            ...newTasks,
          ],
        })),

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
    }),
    {
      name: 'planner-store',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // SSR fallback - no-op storage
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);
