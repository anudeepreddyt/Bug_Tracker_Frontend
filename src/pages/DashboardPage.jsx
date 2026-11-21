import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  ListTodo,
  Clock,
  CheckCircle2,
  Flame,
  CircleDot,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { ISSUE_PRIORITY, ISSUE_STATUS } from '../utils/constants';
import { formatDate } from '../utils/formatters';
import { PriorityBadge, StatusBadge } from '../components/common/Badges';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import IssueDetailModal from '../components/issues/IssueDetailModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, allIssues, issuesByProject, loadingWorkspace } = useWorkspace();

  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalIssues = allIssues.length;
    const todoCount = allIssues.filter(
      (i) => i.issueStatus === ISSUE_STATUS.TODO
    ).length;
    const inProgressCount = allIssues.filter(
      (i) => i.issueStatus === ISSUE_STATUS.IN_PROGRESS
    ).length;
    const completedCount = allIssues.filter(
      (i) => i.issueStatus === ISSUE_STATUS.COMPLETED
    ).length;
    const highPriorityCount = allIssues.filter(
      (i) => i.issuePriority === ISSUE_PRIORITY.HIGH
    ).length;

    return {
      totalProjects,
      totalIssues,
      todoCount,
      inProgressCount,
      completedCount,
      highPriorityCount,
    };
  }, [projects, allIssues]);

  // ProjectIssueDTO does not include issueCreatedAt, so highest issueId represents most recently created
  const recentIssues = useMemo(() => {
    return [...allIssues]
      .sort((a, b) => Number(b.issueId) - Number(a.issueId))
      .slice(0, 6);
  }, [allIssues]);

  if (loadingWorkspace && projects.length === 0) {
    return <LoadingSpinner label="Loading workspace overview..." />;
  }

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderKanban,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400',
    },
    {
      label: 'Total Issues',
      value: stats.totalIssues,
      icon: ListTodo,
      color: 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300',
    },
    {
      label: 'To Do',
      value: stats.todoCount,
      icon: CircleDot,
      color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-400',
    },
    {
      label: 'In Progress',
      value: stats.inProgressCount,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400',
    },
    {
      label: 'Completed',
      value: stats.completedCount,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400',
    },
    {
      label: 'High Priority',
      value: stats.highPriorityCount,
      icon: Flame,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome back, <span className="font-semibold">{user?.username}</span>. Here is your live workspace summary.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCreateProjectOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
          <Link
            to="/kanban"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            Open Board
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {card.label}
                </span>
                <div className={`rounded-lg p-1.5 ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Content Split: Recent Issues & Project Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recently Created Issues (2 cols) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-soft lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Recently Created Issues
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ordered by latest Issue ID across synced projects
              </p>
            </div>
            <Link
              to="/issues"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              View all →
            </Link>
          </div>

          {recentIssues.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="No issues recorded yet"
              description="Create a project first, then add bugs or tasks to track progress."
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentIssues.map((issue) => (
                <div
                  key={`${issue.projectId}-${issue.issueId}`}
                  onClick={() => setSelectedIssue(issue)}
                  className="flex cursor-pointer flex-col justify-between gap-2 py-3 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:px-2 dark:hover:bg-slate-800/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-slate-400">
                        #{issue.issueId}
                      </span>
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {issue.issueTitle}
                      </p>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {issue.projectName} • Assignee:{' '}
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {issue.assigneeName || 'Unassigned'}
                      </span>
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <PriorityBadge priority={issue.issuePriority} />
                    <StatusBadge status={issue.issueStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project Overview (1 col) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Project Overview
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active tracked projects
              </p>
            </div>
            <Link
              to="/projects"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Manage →
            </Link>
          </div>

          {projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects in workspace"
              description="Create a new project or load an existing one by ID/name on the Projects page."
              action={
                <button
                  onClick={() => setCreateProjectOpen(true)}
                  className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Create Project
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {projects.map((proj) => {
                const pIssues = issuesByProject[proj.projectId] || [];
                const done = pIssues.filter(
                  (i) => i.issueStatus === ISSUE_STATUS.COMPLETED
                ).length;
                const pct =
                  pIssues.length > 0 ? Math.round((done / pIssues.length) * 100) : 0;

                return (
                  <Link
                    key={proj.projectId}
                    to={`/projects/${proj.projectId}`}
                    className="block rounded-xl border border-slate-200/80 p-3.5 transition hover:border-indigo-300 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:border-indigo-700 dark:hover:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {proj.projectName}
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        #{proj.projectId}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      {proj.description || 'No description'}
                    </p>

                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>
                          {done}/{pIssues.length} completed
                        </span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Lead: {proj.createdBy || '—'}</span>
                      <span>{formatDate(proj.createAt)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CreateProjectModal
        isOpen={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
      />

      <IssueDetailModal
        issue={selectedIssue}
        isOpen={Boolean(selectedIssue)}
        onClose={() => setSelectedIssue(null)}
      />
    </div>
  );
}
