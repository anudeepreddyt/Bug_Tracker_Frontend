import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { issueApi } from '../../api/issueApi';
import {
  ISSUE_PRIORITY,
  ISSUE_PRIORITY_LIST,
  ISSUE_STATUS,
  ISSUE_STATUS_LIST,
} from '../../utils/constants';

export default function CreateIssueModal({
  isOpen,
  onClose,
  defaultProjectId = '',
  defaultStatus = ISSUE_STATUS.TODO,
  onCreated,
}) {
  const { projects, knownUsers, currentUserId, refreshProjectIssues } = useWorkspace();
  const { toast } = useToast();

  const [projectId, setProjectId] = useState(defaultProjectId);
  const [userId, setUserId] = useState(currentUserId || '');
  const [assigneeId, setAssigneeId] = useState('');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [status, setStatus] = useState(defaultStatus);
  const [priority, setPriority] = useState(ISSUE_PRIORITY.MEDIUM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProjectId(defaultProjectId || (projects[0]?.projectId ?? ''));
      setStatus(defaultStatus || ISSUE_STATUS.TODO);
      if (currentUserId) setUserId(String(currentUserId));
      setError('');
    }
  }, [isOpen, defaultProjectId, defaultStatus, projects, currentUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!projectId) {
      setError('Please select a project.');
      return;
    }
    if (!issueTitle.trim()) {
      setError('Issue title is required.');
      return;
    }
    if (!userId || Number(userId) <= 0) {
      setError('Reporter User ID is required by backend CreateIssueDTO.');
      return;
    }
    if (!assigneeId || Number(assigneeId) <= 0) {
      setError('Assignee User ID is required by backend IssueService.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await issueApi.createIssue({
        projectId: Number(projectId),
        userId: Number(userId),
        issueTitle: issueTitle.trim(),
        issueDescription: issueDescription.trim(),
        assigneeId: Number(assigneeId),
        status,
        priority,
      });
      await refreshProjectIssues(Number(projectId));
      toast.success(`Issue "${created.issueTitle}" created.`);
      setIssueTitle('');
      setIssueDescription('');
      onClose();
      if (onCreated) onCreated(created);
    } catch (err) {
      setError(err.message || 'Failed to create issue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Issue"
      subtitle="Submits CreateIssueDTO with status & priority query params"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Project <span className="text-rose-500">*</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              required
            >
              <option value="">Select a project...</option>
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  #{p.projectId} — {p.projectName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Priority <span className="text-rose-500">*</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {ISSUE_PRIORITY_LIST.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label} ({p.value})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={issueTitle}
            onChange={(e) => setIssueTitle(e.target.value)}
            placeholder="e.g. Fix JWT token expiration handling on /signin"
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            rows={3}
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            placeholder="Steps to reproduce, expected behavior, and logs..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Reporter User ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              list="known-users-list"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. 1"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Assignee User ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              list="known-users-list"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              placeholder="e.g. 2"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Initial Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {ISSUE_STATUS_LIST.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <datalist id="known-users-list">
          {knownUsers.map((u) => (
            <option key={u.userId} value={u.userId}>
              {u.userName} (ID: {u.userId})
            </option>
          ))}
        </datalist>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Note: Your backend requires valid numeric PostgreSQL User IDs for both Reporter and Assignee when creating an issue.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Issue'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
