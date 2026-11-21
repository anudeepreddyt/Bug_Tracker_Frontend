import React from 'react';

export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600 dark:border-slate-800 dark:border-t-indigo-400" />
      {label && (
        <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
      )}
    </div>
  );
}
