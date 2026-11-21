import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import KanbanCard from './KanbanCard';
import { ISSUE_STATUS } from '../../utils/constants';

export default function KanbanColumn({
  status,
  title,
  issues,
  onSelectIssue,
  onAddIssueInColumn,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'Column',
      status,
    },
  });

  const accentMap = {
    [ISSUE_STATUS.TODO]: 'bg-slate-400',
    [ISSUE_STATUS.IN_PROGRESS]: 'bg-amber-500',
    [ISSUE_STATUS.COMPLETED]: 'bg-emerald-500',
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[520px] flex-col rounded-2xl border p-3.5 transition-colors ${
        isOver
          ? 'border-indigo-400 bg-indigo-50/40 dark:border-indigo-600 dark:bg-indigo-950/20'
          : 'border-slate-200/80 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/50'
      }`}
    >
      {/* Column Header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              accentMap[status] || 'bg-slate-400'
            }`}
          />
          <h3 className="text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-200">
            {title}
          </h3>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 shadow-2xs dark:bg-slate-800 dark:text-slate-300">
            {issues.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddIssueInColumn(status)}
          className="rounded-lg p-1 text-slate-500 transition hover:bg-white hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
          title={`Create issue in ${title}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Cards Container */}
      <SortableContext
        items={issues.map((i) => String(i.issueId))}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-2.5">
          {issues.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300/80 p-6 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
              Drop issues here
            </div>
          ) : (
            issues.map((issue) => (
              <KanbanCard
                key={issue.issueId}
                issue={issue}
                onSelect={onSelectIssue}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
