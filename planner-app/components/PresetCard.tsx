'use client';

import { Preset } from '@/lib/types';

interface PresetCardProps {
  preset: Preset;
  subjectColor: string;
  onEdit: () => void;
  onDelete: () => void;
  draggable?: boolean;
}

function ImportanceStars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`text-xs ${i <= value ? 'star-active' : 'star-inactive'}`}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function PresetCard({ preset, subjectColor, onEdit, onDelete }: PresetCardProps) {
  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="ios-card px-4 py-3 flex items-center gap-3">
      <div
        className="w-1 self-stretch rounded-full flex-shrink-0"
        style={{ backgroundColor: subjectColor }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 dark:text-white truncate">{preset.name}</h3>
          {preset.flexible && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-ios-blue/15 text-ios-blue flex-shrink-0">
              Flexible
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <ImportanceStars value={preset.importance} />
          <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDuration(preset.defaultDuration)}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{preset.reminderType}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-ios-blue transition-colors"
          aria-label="Edit preset"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-ios-red transition-colors"
          aria-label="Delete preset"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
