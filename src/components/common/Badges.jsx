import React from 'react';
import { ISSUE_PRIORITY, ISSUE_STATUS, PROJECT_ROLE } from '../../utils/constants';

export function StatusBadge({ status }) {
  const config = {
    [ISSUE_STATUS.TODO]: {
      label: 'To Do',
      classes:
        'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      dot: 'bg-slate-400',
    },
    [ISSUE_STATUS.IN_PROGRESS]: {
      label: 'In Progress',
      classes:
        'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
      dot: 'bg-amber-500',
    },
    [ISSUE_STATUS.COMPLETED]: {
      label: 'Completed',
      classes:
        'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
      dot: 'bg-emerald-500',
    },
  };

  const item = config[status] || {
    label: status || 'Unknown',
    classes:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${item.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const config = {
    [ISSUE_PRIORITY.HIGH]: {
      label: 'High',
      classes:
        'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
    },
    [ISSUE_PRIORITY.MEDIUM]: {
      label: 'Medium',
      classes:
        'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60',
    },
    [ISSUE_PRIORITY.LOW]: {
      label: 'Low',
      classes:
        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    },
  };

  const item = config[priority] || {
    label: priority || 'None',
    classes:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${item.classes}`}
    >
      {item.label}
    </span>
  );
}

export function ProjectRoleBadge({ role }) {
  const isManager = role === PROJECT_ROLE.MANAGER;
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
        isManager
          ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/60 dark:text-indigo-300'
          : 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
      }`}
    >
      {isManager ? 'Manager' : 'Developer'}
    </span>
  );
}
