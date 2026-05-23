'use client';

import { ScheduledTask } from '@/lib/types';

interface TaskBlockProps {
  task: ScheduledTask;
  dayStartHour: number;
  onClick: () => void;
  style?: React.CSSProperties;
}

const HOUR_HEIGHT = 80; // px per hour

export default function TaskBlock({ task, dayStartHour, onClick, style }: TaskBlockProps) {
  const top = ((task.startMinute - dayStartHour * 60) / 60) * HOUR_HEIGHT;
  const height = Math.max((task.duration / 60) * HOUR_HEIGHT, 20);

  return (
    <button
      className="task-block select-none text-left"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: task.color + 'cc',
        borderLeft: `3px solid ${task.color}`,
        opacity: task.completed ? 0.6 : 1,
        ...style,
      }}
      onClick={onClick}
    >
      {height > 30 && (
        <div className="flex items-start gap-1 h-full overflow-hidden">
          <span className="text-xs leading-tight">{task.emoji}</span>
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-semibold text-white leading-tight truncate"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
            >
              {task.completed && <span className="line-through opacity-70">{task.name}</span>}
              {!task.completed && task.name}
            </p>
            {height > 50 && (
              <p className="text-[10px] text-white/80 leading-tight mt-0.5">
                {formatTime(task.startMinute)} – {formatTime(task.startMinute + task.duration)}
              </p>
            )}
          </div>
        </div>
      )}
      {height <= 30 && (
        <p className="text-[10px] font-medium text-white leading-tight truncate"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
          {task.emoji} {task.name}
        </p>
      )}
    </button>
  );
}

function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}
