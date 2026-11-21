import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Columns3, Plus, Search, Filter } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useToast } from '../context/ToastContext';
import {
  ISSUE_PRIORITY_LIST,
  ISSUE_STATUS,
  ISSUE_STATUS_LIST,
} from '../utils/constants';
import KanbanColumn from '../components/kanban/KanbanColumn';
import KanbanCard from '../components/kanban/KanbanCard';
import EmptyState from '../components/common/EmptyState';
import CreateIssueModal from '../components/issues/CreateIssueModal';
import IssueDetailModal from '../components/issues/IssueDetailModal';

export default function KanbanPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    projects,
    issuesByProject,
    refreshProjectIssues,
    updateIssueStatusOptimistic,
  } = useWorkspace();
  const { toast } = useToast();

  const paramProjectId = searchParams.get('projectId');
  const [selectedProjectId, setSelectedProjectId] = useState(
    paramProjectId ? Number(paramProjectId) : projects[0]?.projectId || ''
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [activeDragIssue, setActiveDragIssue] = useState(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState(ISSUE_STATUS.TODO);
  const [detailIssue, setDetailIssue] = useState(null);

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].projectId);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId) {
      setSearchParams({ projectId: String(selectedProjectId) }, { replace: true });
      refreshProjectIssues(Number(selectedProjectId)).catch(() => {});
    }
  }, [selectedProjectId, setSearchParams, refreshProjectIssues]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const rawIssues = useMemo(() => {
    if (!selectedProjectId) return [];
    return issuesByProject[Number(selectedProjectId)] || [];
  }, [issuesByProject, selectedProjectId]);

  const filteredIssues = useMemo(() => {
    return rawIssues.filter((iss) => {
      const matchesPriority =
        priorityFilter === 'ALL' || iss.issuePriority === priorityFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        iss.issueTitle?.toLowerCase().includes(q) ||
        iss.issueDescription?.toLowerCase().includes(q) ||
        String(iss.issueId).includes(q) ||
        iss.assigneeName?.toLowerCase().includes(q);
      return matchesPriority && matchesSearch;
    });
  }, [rawIssues, priorityFilter, searchQuery]);

  const issuesByColumn = useMemo(() => {
    return {
      [ISSUE_STATUS.TODO]: filteredIssues.filter(
        (i) => i.issueStatus === ISSUE_STATUS.TODO
      ),
      [ISSUE_STATUS.IN_PROGRESS]: filteredIssues.filter(
        (i) => i.issueStatus === ISSUE_STATUS.IN_PROGRESS
      ),
      [ISSUE_STATUS.COMPLETED]: filteredIssues.filter(
        (i) => i.issueStatus === ISSUE_STATUS.COMPLETED
      ),
    };
  }, [filteredIssues]);

  // Keep open detail modal synced with latest issue state
  const activeDetailIssue = useMemo(() => {
    if (!detailIssue) return null;
    return (
      rawIssues.find((i) => Number(i.issueId) === Number(detailIssue.issueId)) ||
      detailIssue
    );
  }, [detailIssue, rawIssues]);

  const handleDragStart = (event) => {
    const dragged = event.active?.data?.current?.issue;
    if (dragged) setActiveDragIssue(dragged);
  };

  const handleDragEnd = async (event) => {
    setActiveDragIssue(null);
    const { active, over } = event;
    if (!over || !active) return;

    const draggedIssue = active.data?.current?.issue;
    if (!draggedIssue) return;

    // Determine target column status whether dropped on column container or another card inside that column
    let targetStatus = null;
    if (over.data?.current?.type === 'Column') {
      targetStatus = over.data.current.status;
    } else if (over.data?.current?.type === 'Issue') {
      targetStatus = over.data.current.issue.issueStatus;
    } else if (Object.values(ISSUE_STATUS).includes(String(over.id))) {
      targetStatus = String(over.id);
    }

    if (!targetStatus || targetStatus === draggedIssue.issueStatus) {
      return;
    }

    try {
      await updateIssueStatusOptimistic(
        Number(selectedProjectId),
        draggedIssue.issueId,
        targetStatus
      );
      toast.success(`Moved #${draggedIssue.issueId} to ${targetStatus}`);
    } catch (err) {
      toast.error(
        err.message ||
          `Failed to move #${draggedIssue.issueId} to ${targetStatus}. Reverted change.`
      );
    }
  };

  const openCreateInColumn = (status) => {
    setCreateDefaultStatus(status);
    setCreateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Project Selector */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Kanban Board
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Drag and drop issues across workflow stages to update backend status in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            className="min-w-[210px] rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {projects.length === 0 && <option value="">No projects available</option>}
            {projects.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                PRJ-{p.projectId}: {p.projectName}
              </option>
            ))}
          </select>

          {selectedProjectId && (
            <button
              onClick={() => openCreateInColumn(ISSUE_STATUS.TODO)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add Issue
            </button>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      {selectedProjectId ? (
        <>
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-soft sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter board issues..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Priority:
              </span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Priorities</option>
                {ISSUE_PRIORITY_LIST.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3-Column dnd-kit Kanban Board */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {ISSUE_STATUS_LIST.map((col) => (
                <KanbanColumn
                  key={col.value}
                  status={col.value}
                  title={`${col.label} (${col.shortLabel})`}
                  issues={issuesByColumn[col.value] || []}
                  onSelectIssue={(iss) => setDetailIssue(iss)}
                  onAddIssueInColumn={openCreateInColumn}
                />
              ))}
            </div>

            <DragOverlay>
              {activeDragIssue ? (
                <div className="w-[320px] opacity-95">
                  <KanbanCard issue={activeDragIssue} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </>
      ) : (
        <EmptyState
          icon={Columns3}
          title="No project selected"
          description="Create or load a project on the Projects page to use the Kanban board."
          action={
            <Link
              to="/projects"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Go to Projects
            </Link>
          }
        />
      )}

      <CreateIssueModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultProjectId={selectedProjectId}
        defaultStatus={createDefaultStatus}
      />

      <IssueDetailModal
        issue={activeDetailIssue}
        isOpen={Boolean(activeDetailIssue)}
        onClose={() => setDetailIssue(null)}
      />
    </div>
  );
}
