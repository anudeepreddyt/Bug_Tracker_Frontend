import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';

export default function CreateProjectModal({ isOpen, onClose, onCreated }) {
  const { createProject } = useWorkspace();
  const { toast } = useToast();

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!projectName.trim()) {
      setError('Project name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createProject({
        projectName: projectName.trim(),
        description: description.trim(),
      });
      toast.success(`Project "${created.projectName}" (#${created.projectId}) created.`);
      setProjectName('');
      setDescription('');
      onClose();
      if (onCreated) onCreated(created);
    } catch (err) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      subtitle="Creates a project via POST /api/createproject"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Project Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. Core Payment Gateway"
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the scope, services, or goals of this project..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

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
            {submitting ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
