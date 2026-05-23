'use client';

import { Subject } from '@/lib/types';

interface SubjectCardProps {
  subject: Subject;
  taskCount: number;
  onClick: () => void;
}

export default function SubjectCard({ subject, taskCount, onClick }: SubjectCardProps) {
  return (
    <button
      onClick={onClick}
      className="ios-card p-4 text-left w-full active:scale-[0.97] transition-transform"
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3"
        style={{ backgroundColor: subject.color + '25' }}
      >
        {subject.emoji}
      </div>
      <div
        className="w-6 h-1 rounded-full mb-2"
        style={{ backgroundColor: subject.color }}
      />
      <h3 className="font-semibold text-gray-900 dark:text-white text-base">{subject.name}</h3>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
        {subject.presets.length} preset{subject.presets.length !== 1 ? 's' : ''}
        {taskCount > 0 && ` · ${taskCount} today`}
      </p>
    </button>
  );
}
