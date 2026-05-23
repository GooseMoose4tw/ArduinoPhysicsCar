'use client';

import { useState, useRef, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ScheduledTask, Preset, Subject } from '@/lib/types';
import { usePlannerStore } from '@/lib/store';
import TaskBlock from './TaskBlock';
import ExtendModal from './ExtendModal';
import ReformatModal from './ReformatModal';
import { reformatDay } from '@/lib/scheduler';

const HOUR_HEIGHT = 80; // px

interface TimelineViewProps {
  date: string;
  tasks: ScheduledTask[];
  subjects: Subject[];
}

// Draggable preset chip for the side drawer
function DraggablePreset({ preset, subject }: { preset: Preset; subject: Subject }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `preset-${preset.id}`,
    data: { type: 'preset', preset, subject },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: subject.color + '20',
        border: `1px solid ${subject.color}40`,
      }}
      {...listeners}
      {...attributes}
      className="flex-shrink-0 px-3 py-2 rounded-xl cursor-grab active:cursor-grabbing touch-none select-none"
    >
      <p className="text-xs font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">
        {subject.emoji} {preset.name}
      </p>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
        {preset.defaultDuration < 60
          ? `${preset.defaultDuration}m`
          : `${Math.floor(preset.defaultDuration / 60)}h${preset.defaultDuration % 60 > 0 ? ` ${preset.defaultDuration % 60}m` : ''}`}
      </p>
    </div>
  );
}

// Droppable time slot
function DroppableSlot({
  hour,
  minute,
  height,
}: {
  hour: number;
  minute: number;
  height: number;
}) {
  const id = `slot-${hour}-${minute}`;
  const { setNodeRef, isOver } = useDroppable({ id, data: { hour, minute } });

  return (
    <div
      ref={setNodeRef}
      style={{ height: `${height}px` }}
      className={`border-t border-gray-100 dark:border-gray-800/50 transition-colors ${
        isOver ? 'bg-ios-blue/10' : ''
      }`}
    />
  );
}

function formatHourLabel(hour: number) {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  return `${h} ${ampm}`;
}

function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function TimelineView({ date, tasks, subjects }: TimelineViewProps) {
  const { settings, updateTask, deleteTask } = usePlannerStore();
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null);
  const [extendTask, setExtendTask] = useState<ScheduledTask | null>(null);
  const [reformatData, setReformatData] = useState<{
    newTasks: ScheduledTask[];
    unplaceable: string[];
  } | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const hours = Array.from(
    { length: settings.dayEndHour - settings.dayStartHour + 1 },
    (_, i) => settings.dayStartHour + i
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null);
      const { active, over } = event;
      if (!over) return;

      const overData = over.data.current as { hour: number; minute: number } | undefined;
      if (!overData) return;

      const startMinute = overData.hour * 60 + overData.minute;
      const activeData = active.data.current as
        | { type: 'preset'; preset: Preset; subject: Subject }
        | { type: 'task'; task: ScheduledTask }
        | undefined;

      if (!activeData) return;

      if (activeData.type === 'preset') {
        const { preset, subject } = activeData;
        usePlannerStore.getState().scheduleTask({
          date,
          presetId: preset.id,
          subjectId: subject.id,
          name: preset.name,
          color: subject.color,
          emoji: subject.emoji,
          startMinute,
          duration: preset.defaultDuration,
          importance: preset.importance,
          flexible: preset.flexible,
          reminderType: preset.reminderType,
          reminderMinutesBefore: preset.reminderMinutesBefore,
          completed: false,
        });
      } else if (activeData.type === 'task') {
        updateTask(activeData.task.id, { startMinute });
      }
    },
    [date, updateTask]
  );

  const handleExtend = (extraMinutes: number) => {
    if (!extendTask) return;
    const { rescheduled, unplaceable } = reformatDay(tasks, extendTask.id, extraMinutes, settings);
    setReformatData({ newTasks: rescheduled, unplaceable });
    setExtendTask(null);
    setSelectedTask(null);
  };

  const totalHeight = (settings.dayEndHour - settings.dayStartHour + 1) * HOUR_HEIGHT;

  // Find active drag item for overlay
  const activeDragPreset =
    activeDragId?.startsWith('preset-')
      ? (() => {
          const presetId = activeDragId.replace('preset-', '');
          for (const subj of subjects) {
            const p = subj.presets.find((pr) => pr.id === presetId);
            if (p) return { preset: p, subject: subj };
          }
          return null;
        })()
      : null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full">
        {/* Presets Strip */}
        <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
            Drag to schedule
          </p>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {subjects.map((subject) =>
              subject.presets.map((preset) => (
                <DraggablePreset key={preset.id} preset={preset} subject={subject} />
              ))
            )}
            {subjects.every((s) => s.presets.length === 0) && (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Add presets to your subjects to drag them here
              </p>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto" ref={containerRef}>
          <div className="relative" style={{ height: `${totalHeight}px` }}>
            {/* Hour gridlines with droppable slots */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex"
                style={{ position: 'absolute', top: `${(hour - settings.dayStartHour) * HOUR_HEIGHT}px`, width: '100%', height: `${HOUR_HEIGHT}px` }}
              >
                {/* Hour label */}
                <div className="w-16 flex-shrink-0 flex items-start justify-end pr-3 pt-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    {formatHourLabel(hour)}
                  </span>
                </div>

                {/* Drop zones: 4 x 15-min slots */}
                <div className="flex-1 relative">
                  {[0, 15, 30, 45].map((min) => (
                    <DroppableSlot
                      key={min}
                      hour={hour}
                      minute={min}
                      height={HOUR_HEIGHT / 4}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Current time indicator */}
            <CurrentTimeIndicator dayStartHour={settings.dayStartHour} />

            {/* Task blocks */}
            {tasks.map((task) => (
              <TaskBlock
                key={task.id}
                task={task}
                dayStartHour={settings.dayStartHour}
                onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDragPreset && (
          <div
            className="px-3 py-2 rounded-xl shadow-ios opacity-90"
            style={{
              backgroundColor: activeDragPreset.subject.color + '30',
              border: `1px solid ${activeDragPreset.subject.color}60`,
            }}
          >
            <p className="text-xs font-medium text-gray-800 whitespace-nowrap">
              {activeDragPreset.subject.emoji} {activeDragPreset.preset.name}
            </p>
          </div>
        )}
      </DragOverlay>

      {/* Task Detail Popover */}
      {selectedTask && (
        <TaskDetailPopover
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onComplete={() => {
            updateTask(selectedTask.id, { completed: !selectedTask.completed });
            setSelectedTask(null);
          }}
          onExtend={() => {
            setExtendTask(selectedTask);
            setSelectedTask(null);
          }}
          onDelete={() => {
            deleteTask(selectedTask.id);
            setSelectedTask(null);
          }}
        />
      )}

      {/* Extend Modal */}
      {extendTask && (
        <ExtendModal
          task={extendTask}
          onExtend={handleExtend}
          onCancel={() => setExtendTask(null)}
        />
      )}

      {/* Reformat Modal */}
      {reformatData && (
        <ReformatModal
          date={date}
          newTasks={reformatData.newTasks}
          unplaceable={reformatData.unplaceable}
          onApprove={() => setReformatData(null)}
          onCancel={() => setReformatData(null)}
        />
      )}
    </DndContext>
  );
}

function CurrentTimeIndicator({ dayStartHour }: { dayStartHour: number }) {
  const now = new Date();
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  const top = ((currentMinute - dayStartHour * 60) / 60) * HOUR_HEIGHT;

  if (top < 0) return null;

  return (
    <div
      className="absolute left-0 right-0 pointer-events-none z-10"
      style={{ top: `${top}px` }}
    >
      <div className="flex items-center">
        <div className="w-16 flex-shrink-0 flex justify-end pr-2">
          <div className="w-2 h-2 rounded-full bg-ios-red flex-shrink-0" />
        </div>
        <div className="flex-1 h-px bg-ios-red" />
      </div>
    </div>
  );
}

interface TaskDetailPopoverProps {
  task: ScheduledTask;
  onClose: () => void;
  onComplete: () => void;
  onExtend: () => void;
  onDelete: () => void;
}

function TaskDetailPopover({ task, onClose, onComplete, onExtend, onDelete }: TaskDetailPopoverProps) {
  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center modal-backdrop bg-black/30"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[430px] bg-white dark:bg-gray-900 rounded-t-3xl p-6 animate-slide-up">
        <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5" />

        {/* Task info */}
        <div className="flex items-start gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: task.color + '25' }}
          >
            {task.emoji}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{task.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatTime(task.startMinute)} – {formatTime(task.startMinute + task.duration)} · {formatDuration(task.duration)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`text-xs ${i <= task.importance ? 'star-active' : 'star-inactive'}`}>★</span>
                ))}
              </div>
              {task.flexible && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-ios-blue/15 text-ios-blue font-medium">
                  Flexible
                </span>
              )}
              {task.completed && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-ios-green/15 text-ios-green font-medium">
                  Done
                </span>
              )}
            </div>
          </div>
        </div>

        {task.notes && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 p-3 bg-ios-gray-6 dark:bg-gray-800 rounded-xl">
            {task.notes}
          </p>
        )}

        {/* Actions */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <button
            onClick={onComplete}
            className={`flex flex-col items-center gap-1 py-3 rounded-2xl font-medium text-sm transition-all active:scale-[0.97] ${
              task.completed
                ? 'bg-ios-green/15 text-ios-green'
                : 'bg-ios-gray-6 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
            {task.completed ? 'Undo' : 'Complete'}
          </button>

          <button
            onClick={onExtend}
            className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-ios-gray-6 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium text-sm active:scale-[0.97] transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
            </svg>
            Extend
          </button>

          <button
            onClick={onDelete}
            className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-ios-red/10 text-ios-red font-medium text-sm active:scale-[0.97] transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
            </svg>
            Delete
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-ios-gray-5 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium active:scale-[0.98] transition-transform"
        >
          Close
        </button>
      </div>
    </div>
  );
}
