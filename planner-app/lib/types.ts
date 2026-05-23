export type ReminderType = 'alarm' | 'banner' | 'silent';
export type Importance = 1 | 2 | 3 | 4 | 5;

export interface Subject {
  id: string;
  name: string;
  color: string; // hex
  emoji: string;
  presets: Preset[];
}

export interface Preset {
  id: string;
  subjectId: string;
  name: string;
  defaultDuration: number; // minutes
  importance: Importance;
  flexible: boolean;
  reminderType: ReminderType;
  reminderMinutesBefore: number;
}

export interface ScheduledTask {
  id: string;
  date: string; // YYYY-MM-DD
  presetId?: string;
  subjectId?: string;
  name: string;
  color: string;
  emoji: string;
  startMinute: number; // minutes from midnight, e.g. 9*60=540
  duration: number; // minutes
  importance: Importance;
  flexible: boolean;
  reminderType: ReminderType;
  reminderMinutesBefore: number;
  completed: boolean;
  notes?: string;
}

export interface AppSettings {
  vibrationEnabled: boolean;
  defaultReminderType: ReminderType;
  dayStartHour: number; // 6
  dayEndHour: number; // 23
  theme: 'light' | 'dark' | 'system';
}
