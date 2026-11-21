import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Columns3,
  Plus,
  Trash2,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useToast } from '../context/ToastContext';
import { projectApi } from '../api/projectApi';
import { formatDate, formatDateTime, getInitials } from '../utils/formatters';
import { PROJECT_ROLE, PROJECT_ROLE_LIST } from '../utils/constants';
import {
  PriorityBadge,
  ProjectRoleBadge,
  StatusBadge,
} from '../components/common/Badges';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import CreateIssueModal from '../components/issues/CreateIssueModal';
import IssueDetailModal from '../components/issues/IssueDetailModal';

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const numericProjectId = Number(projectId);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    projects,
    issuesByProject,
    membersByProject,
    knownUsers,
    addProjectMember,
    removeProjectMember,
    deleteProject,
    lookupAndImportProject,
    refreshProjectIssues,
  } = useWorkspace();

  const [project, setProject] = useState(() =>
    projects.find((p) => Number(p.projectId) === numericProjectId) || null
  );
  const [loadingProject, setLoadingProject] = useState(!project);

  // Member form state
  const [newMemberUserId, setNewMemberUserId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState(PROJECT_ROLE.DEVELOPER);
  const [addingMember, setAddingMember] = useState(false);

  // Confirmations & Modals
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removingMember, setRemovingMember] = useState(false);
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    const existing = projects.find((p) => Number(p.projectId) === numericProjectId);
    if (existing) {
      setProject(existing);
      setLoadingProject(false);
      return;
    }

    let active = true;
    setLoadingProject(true);
    projectApi
      .getProjectById(numericProjectId)
      .then((dto) => {
        if (!active) return;
        setProject(dto);
        lookupAndImportProject({ id: numericProjectId }).catch(() => {});
      })
      .catch((err) => {
        if (!active) return;
        toast.error(err.message || 'Unable to load project.');
      })
      .finally(() => {
        if (active) setLoadingProject(false);
      });

    return () => {
      active = false;
    };
  }, [numericProjectId, projects, lookupAndImportProject, toast]);

  useEffect(() => {
    if (numericProjectId) {
      refreshProjectIssues(numericProjectId).catch(() => {});
    }
  }, [numericProjectId, refreshProjectIssues]);

  if (loadingProject) {
    return <LoadingSpinner label="Loading project details..." />;
  }

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description={`No project found for ID #${projectId}.`}
        action={
          <Link
            to="/projects"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Projects
          </Link>
        }
      />
    );
  }

  const members = membersByProject[numericProjectId] || [];
  const projectIssues = issuesByProject[numericProjectId] || [];

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberUserId || Number(newMemberUserId) <= 0) {
      toast.error('Enter a valid numeric User ID.');
      return;
    }
    setAddingMember(true);
    try {
      const added = await addProjectMember({
        projectId: numericProjectId,
        userId: Number(newMemberUserId),
        projectRole: newMemberRole,
      });
      toast.success(
        `Added ${added.userName} (#${added.userId}) as ${added.projectRole}.`
      );
      setNewMemberUserId('');
    } catch (err) {
      toast.error(err.message || 'Failed to add member.');
    } finally {
      setAddingMember(false);
    }
  };

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove) return;
    setRemovingMember(true);
    try {
      await removeProjectMember({
        projectId: numericProjectId,
        userId: memberToRemove.userId,
      });
      toast.success(`Removed ${memberToRemove.userName} from project.`);
      setMemberToRemove(null);
    } catch (err) {
      toast.error(err.message || 'Failed to remove member.');
    } finally {
      setRemovingMember(false);
    }
  };

  const handleDeleteProject = async () => {
    setDeletingProject(true);
    try {
      await deleteProject(numericProjectId);
      toast.success('Project deleted.');
      navigate('/projects', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Failed to delete project.');
    } finally {
      setDeletingProject(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Link
            to="/projects"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                PRJ-{project.projectId}
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {project.projectName}
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {project.description || 'No project description provided.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to={`/kanban?projectId=${numericProjectId}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Columns3 className="h-4 w-4" />
            Kanban Board
          </Link>
          <button
            onClick={() => setCreateIssueOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Issue
          </button>
          <button
            onClick={() => setDeleteProjectOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Metadata Strip */}
      <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-slate-200/90 bg-white px-5 py-3.5 text-xs text-slate-600 shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-slate-400" />
          <span className="text-slate-400">Created By:</span>
          <span className="font-semibold">{project.createdBy || '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-slate-400">Created At:</span>
          <span className="font-semibold">{formatDateTime(project.createAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          <span className="text-slate-400">Tracked Members:</span>
          <span className="font-semibold">{members.length}</span>
        </div>
      </div>

      {/* Two-column layout: Members & Issues */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Project Members Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Project Members
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Add or remove team members via ProjectMemController
          </p>

          {/* Add Member Form */}
          <form onSubmit={handleAddMember} className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                User ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                list="project-known-users"
                value={newMemberUserId}
                onChange={(e) => setNewMemberUserId(e.target.value)}
                placeholder="Enter PostgreSQL User ID (e.g. 2)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
              <datalist id="project-known-users">
                {knownUsers.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.userName} (ID: {u.userId})
                  </option>
                ))}
              </datalist>
            </div>

            <div className="flex gap-2">
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {PROJECT_ROLE_LIST.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label} ({r.value})
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={addingMember}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4" />
                {addingMember ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>

          {/* Members List */}
          <div className="mt-5 space-y-2.5">
            {members.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                No members added yet in this session.
              </p>
            ) : (
              members.map((m) => (
                <div
                  key={m.userId}
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {getInitials(m.userName)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {m.userName}{' '}
                        <span className="font-mono font-normal text-slate-400">
                          #{m.userId}
                        </span>
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <ProjectRoleBadge role={m.projectRole} />
                        {m.joinedAt && (
                          <span className="text-[10px] text-slate-400">
                            Joined {formatDate(m.joinedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setMemberToRemove(m)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
                    title="Remove member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Project Issues Table (2 cols) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-soft lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Project Issues ({projectIssues.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fetched from GET /api/getprojectissue?projectId={numericProjectId}
              </p>
            </div>
          </div>

          {projectIssues.length === 0 ? (
            <EmptyState
              title="No issues in this project"
              description="Create the first issue to start tracking work on the Kanban board."
              action={
                <button
                  onClick={() => setCreateIssueOpen(true)}
                  className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Create Issue
                </button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400">
                    <th className="py-2.5 pr-3">ID</th>
                    <th className="py-2.5 pr-3">Title</th>
                    <th className="py-2.5 pr-3">Priority</th>
                    <th className="py-2.5 pr-3">Status</th>
                    <th className="py-2.5">Assignee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {projectIssues.map((iss) => (
                    <tr
                      key={iss.issueId}
                      onClick={() => setSelectedIssue(iss)}
                      className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-3 pr-3 font-mono text-xs text-slate-500">
                        #{iss.issueId}
                      </td>
                      <td className="py-3 pr-3 font-medium text-slate-900 dark:text-slate-100">
                        {iss.issueTitle}
                      </td>
                      <td className="py-3 pr-3">
                        <PriorityBadge priority={iss.issuePriority} />
                      </td>
                      <td className="py-3 pr-3">
                        <StatusBadge status={iss.issueStatus} />
                      </td>
                      <td className="py-3 text-xs text-slate-600 dark:text-slate-300">
                        {iss.assigneeName || 'Unassigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleConfirmRemoveMember}
        title="Remove Project Member"
        message={`Remove ${memberToRemove?.userName} (#${memberToRemove?.userId}) from ${project.projectName}?`}
        confirmLabel="Remove Member"
        loading={removingMember}
      />

      <ConfirmDialog
        isOpen={deleteProjectOpen}
        onClose={() => setDeleteProjectOpen(false)}
        onConfirm={handleDeleteProject}
        title={`Delete ${project.projectName}`}
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmLabel="Delete Project"
        loading={deletingProject}
      />

      <CreateIssueModal
        isOpen={createIssueOpen}
        onClose={() => setCreateIssueOpen(false)}
        defaultProjectId={numericProjectId}
      />

      <IssueDetailModal
        issue={selectedIssue}
        isOpen={Boolean(selectedIssue)}
        onClose={() => setSelectedIssue(null)}
      />
    </div>
  );
}
