import React, { useMemo, useState } from 'react';
import {
  ListTodo,
  Plus,
  Search,
  Trash2,
  Eye,
  UserX,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useToast } from '../context/ToastContext';
import { issueApi } from '../api/issueApi';
import {
  ISSUE_PRIORITY_LIST,
  ISSUE_STATUS_LIST,
} from '../utils/constants';
import { PriorityBadge, StatusBadge } from '../components/common/Badges';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import CreateIssueModal from '../components/issues/CreateIssueModal';
import IssueDetailModal from '../components/issues/IssueDetailModal';

export default function IssuesPage() {
  const { projects, allIssues, refreshProjectIssues } = useWorkspace();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [unassignedOnly, setUnassignedOnly] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [issueToDelete, setIssueToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filteredIssues = useMemo(() => {
    return allIssues
      .filter((iss) => {
        if (
          projectFilter !== 'ALL' &&
          Number(iss.projectId) !== Number(projectFilter)
        ) {
          return false;
        }
        if (statusFilter !== 'ALL' && iss.issueStatus !== statusFilter) {
          return false;
        }
        if (priorityFilter !== 'ALL' && iss.issuePriority !== priorityFilter) {
          return false;
        }
        if (unassignedOnly && (iss.assigneeId || iss.assigneeName)) {
          return false;
        }
        const q = searchQuery.trim().toLowerCase();
        if (q) {
          const match =
            iss.issueTitle?.toLowerCase().includes(q) ||
            iss.issueDescription?.toLowerCase().includes(q) ||
            String(iss.issueId).includes(q) ||
            iss.reporterName?.toLowerCase().includes(q) ||
            iss.assigneeName?.toLowerCase().includes(q) ||
            iss.projectName?.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => Number(b.issueId) - Number(a.issueId));
  }, [
    allIssues,
    projectFilter,
    statusFilter,
    priorityFilter,
    unassignedOnly,
    searchQuery,
  ]);

  const activeSelectedIssue = useMemo(() => {
    if (!selectedIssue) return null;
    return (
      allIssues.find((i) => Number(i.issueId) === Number(selectedIssue.issueId)) ||
      selectedIssue
    );
  }, [selectedIssue, allIssues]);

  const handleConfirmDelete = async () => {
    if (!issueToDelete) return;
    setDeleting(true);
    try {
      await issueApi.deleteIssue(issueToDelete.issueId);
      await refreshProjectIssues(issueToDelete.projectId);
      toast.success(`Issue #${issueToDelete.issueId} deleted.`);
      setIssueToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete issue.');
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
            All Issues
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Search, filter, inspect, and update bugs across all projects.
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          New Issue
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft sm:grid-cols-2 lg:grid-cols-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, ID, user..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="ALL">All Projects</option>
          {projects.map((p) => (
            <option key={p.projectId} value={p.projectId}>
              {p.projectName}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="ALL">All Statuses</option>
          {ISSUE_STATUS_LIST.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="ALL">All Priorities</option>
          {ISSUE_PRIORITY_LIST.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setUnassignedOnly((prev) => !prev)}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
            unassignedOnly
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <UserX className="h-3.5 w-3.5" />
          Unassigned Only
        </button>
      </div>

      {/* Issues Table */}
      {filteredIssues.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No matching issues found"
          description="Try clearing your search filters or create a new issue."
          action={
            <button
              onClick={() => {
                setSearchQuery('');
                setProjectFilter('ALL');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setUnassignedOnly(false);
              }}
              className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredIssues.map((issue) => (
                  <tr
                    key={`${issue.projectId}-${issue.issueId}`}
                    onClick={() => setSelectedIssue(issue)}
                    className="cursor-pointer transition hover:bg-slate-50/90 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500">
                      #{issue.issueId}
                    </td>
                    <td className="max-w-xs px-4 py-3.5">
                      <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                        {issue.issueTitle}
                      </p>
                      {issue.issueDescription && (
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {issue.issueDescription}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                      {issue.projectName}
                    </td>
                    <td className="px-4 py-3.5">
                      <PriorityBadge priority={issue.issuePriority} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={issue.issueStatus} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                      {issue.reporterName || (issue.reporterId ? `#${issue.reporterId}` : '—')}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                      {issue.assigneeName ||
                        (issue.assigneeId ? `#${issue.assigneeId}` : 'Unassigned')}
                    </td>
                    <td
                      className="px-4 py-3.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setSelectedIssue(issue)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                          title="Inspect & Comment"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setIssueToDelete(issue)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
                          title="Delete Issue"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CreateIssueModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      <IssueDetailModal
        issue={activeSelectedIssue}
        isOpen={Boolean(activeSelectedIssue)}
        onClose={() => setSelectedIssue(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(issueToDelete)}
        onClose={() => setIssueToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete Issue #${issueToDelete?.issueId}`}
        message={`Are you sure you want to delete "${issueToDelete?.issueTitle}"?`}
        confirmLabel="Delete Issue"
        loading={deleting}
      />
    </div>
  );
}
