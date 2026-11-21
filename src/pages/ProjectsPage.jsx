import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  User,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatters';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function ProjectsPage() {
  const {
    projects,
    issuesByProject,
    loadingWorkspace,
    lookupAndImportProject,
    deleteProject,
  } = useWorkspace();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleImportExistingProject = async (e) => {
    e.preventDefault();
    const q = lookupQuery.trim();
    if (!q) return;

    setLookingUp(true);
    try {
      const isNumericId = /^\d+$/.test(q);
      const imported = await lookupAndImportProject(
        isNumericId ? { id: Number(q) } : { projectName: q }
      );
      toast.success(`Loaded project "${imported.projectName}" (#${imported.projectId}).`);
      setLookupQuery('');
    } catch (err) {
      toast.error(err.message || 'Project not found on backend.');
    } finally {
      setLookingUp(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    try {
      await deleteProject(projectToDelete.projectId);
      toast.success(`Project "${projectToDelete.projectName}" deleted.`);
      setProjectToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete project.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage software projects, team memberships, and project boards.
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </button>
      </div>

      {/* Lookup / Load Existing Backend Project Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <form
          onSubmit={handleImportExistingProject}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Load an existing backend project by numeric ID (e.g. 1) or exact Project Name..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            disabled={lookingUp || !lookupQuery.trim()}
            className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {lookingUp ? 'Searching...' : 'Load Project'}
          </button>
        </form>
        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          Since the backend provides <code>/api/getprojectbyid</code> and{' '}
          <code>/api/getprojectbyname</code> (without a global list endpoint), use this bar to fetch existing projects from PostgreSQL into your workspace.
        </p>
      </div>

      {/* Project Grid */}
      {loadingWorkspace && projects.length === 0 ? (
        <LoadingSpinner label="Fetching projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects loaded"
          description="Create a new project or load an existing one from your backend database using its ID or exact name."
          action={
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Create First Project
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const issueCount = (issuesByProject[project.projectId] || []).length;

            return (
              <div
                key={project.projectId}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-soft transition hover:border-indigo-300 hover:shadow-card dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-md bg-indigo-50 px-2.5 py-1 font-mono text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      PRJ-{project.projectId}
                    </span>

                    <button
                      onClick={() => setProjectToDelete(project)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                      title="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                    {project.projectName}
                  </h2>

                  <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-sm text-slate-500 dark:text-slate-400">
                    {project.description || 'No description provided for this project.'}
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      {project.createdBy || 'Unknown'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(project.createAt)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {issueCount} {issueCount === 1 ? 'Issue' : 'Issues'}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/kanban?projectId=${project.projectId}`}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Board
                      </Link>
                      <Link
                        to={`/projects/${project.projectId}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                      >
                        Details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateProjectModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      <ConfirmDialog
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete Project "${projectToDelete?.projectName}"`}
        message="This will permanently delete the project via DELETE /api/deleteproject. Ensure all dependent issues/comments are handled."
        confirmLabel="Delete Project"
        loading={deleting}
      />
    </div>
  );
}
