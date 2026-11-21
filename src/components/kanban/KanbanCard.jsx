import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, User } from 'lucide-react';
import { PriorityBadge } from '../common/Badges';
import { getInitials } from '../../utils/formatters';

export default function KanbanCard({ issue, onSelect }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(issue.issueId),
    data: {
      type: 'Issue',
      issue,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect && onSelect(issue)}
      className={`group cursor-pointer rounded-xl border bg-white p-3.5 shadow-soft transition-all hover:border-indigo-300 hover:shadow-card dark:bg-slate-900 dark:hover:border-indigo-700 ${
        isDragging
          ? 'z-50 rotate-1 border-indigo-500 opacity-75 shadow-xl ring-2 ring-indigo-500/30'
          : 'border-slate-200/90 dark:border-slate-800'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            #{issue.issueId}
          </span>
          <PriorityBadge priority={issue.issuePriority} />
        </div>

        <button
          type="button"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab rounded p-1 text-slate-400 opacity-60 transition hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 active:cursor-grabbing dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label="Drag issue card"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      <h4 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">
        {issue.issueTitle}
      </h4>

      {issue.issueDescription && (
        <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
          {issue.issueDescription}
        </p>
      )}

      <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
        <span className="truncate" title="Reporter">
          By {issue.reporterName || (issue.reporterId ? `#${issue.reporterId}` : '—')}
        </span>

        {issue.assigneeName || issue.assigneeId ? (
          <div
            className="flex items-center gap-1.5"
            title={`Assigned to ${issue.assigneeName || `User #${issue.assigneeId}`}`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {getInitials(issue.assigneeName || String(issue.assigneeId))}
            </span>
            <span className="max-w-[85px] truncate font-medium text-slate-700 dark:text-slate-300">
              {issue.assigneeName || `#${issue.assigneeId}`}
            </span>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-slate-400">
            <User className="h-3 w-3" />
            Unassigned
          </span>
        )}
      </div>
    </div>
  );
}
