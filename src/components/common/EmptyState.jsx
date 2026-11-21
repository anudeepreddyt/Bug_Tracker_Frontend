import React from 'react';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/90 bg-white/60 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
      {Icon && (
        <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
