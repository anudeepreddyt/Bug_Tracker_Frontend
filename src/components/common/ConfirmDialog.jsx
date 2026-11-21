import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmLabel = 'Delete',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {message}
        </p>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
