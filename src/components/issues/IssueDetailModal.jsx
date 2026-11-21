import React, { useCallback, useEffect, useState } from 'react';
import {
  Trash2,
  Edit3,
  Send,
  Check,
  X,
  MessageSquare,
  User,
  Folder,
  Hash,
} from 'lucide-react';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import { PriorityBadge, StatusBadge } from '../common/Badges';
import { issueApi } from '../../api/issueApi';
import { commentApi } from '../../api/commentApi';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { ISSUE_PRIORITY_LIST, ISSUE_STATUS_LIST } from '../../utils/constants';

export default function IssueDetailModal({ issue, isOpen, onClose }) {
  const { refreshProjectIssues, knownUsers } = useWorkspace();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [savingIssue, setSavingIssue] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingIssue, setDeletingIssue] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  useEffect(() => {
    if (issue && isOpen) {
      setTitle(issue.issueTitle || '');
      setDescription(issue.issueDescription || '');
      setStatus(issue.issueStatus || 'TODO');
      setPriority(issue.issuePriority || 'MEDIUM');
      setAssigneeId(issue.assigneeId ? String(issue.assigneeId) : '');
      setIsEditing(false);
    }
  }, [issue, isOpen]);

  const loadComments = useCallback(async () => {
    if (!issue?.projectId || !issue?.issueId) return;
    setLoadingComments(true);
    try {
      const projectComments = await commentApi.getProjectComments(issue.projectId);
      const filtered = projectComments.filter(
        (c) => Number(c.issueId) === Number(issue.issueId)
      );
      setComments(filtered);
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [issue]);

  useEffect(() => {
    if (isOpen && issue) {
      loadComments();
    }
  }, [isOpen, issue, loadComments]);

  if (!issue) return null;

  const handleSaveIssue = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Issue title cannot be empty.');
      return;
    }
    setSavingIssue(true);
    try {
      await issueApi.updateIssue({
        issueId: issue.issueId,
        issueTitle: title.trim(),
        issueDescription: description.trim(),
        assigneeId: assigneeId ? Number(assigneeId) : null,
        status,
        priority,
      });
      await refreshProjectIssues(issue.projectId);
      toast.success(`Issue #${issue.issueId} updated.`);
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update issue.');
    } finally {
      setSavingIssue(false);
    }
  };

  const handleQuickStatusChange = async (nextStatus) => {
    try {
      setStatus(nextStatus);
      await issueApi.changeStatus(issue.issueId, nextStatus);
      await refreshProjectIssues(issue.projectId);
      toast.success(`Status updated to ${nextStatus}`);
    } catch (err) {
      setStatus(issue.issueStatus);
      toast.error(err.message || 'Failed to change status.');
    }
  };

  const handleQuickPriorityChange = async (nextPriority) => {
    try {
      setPriority(nextPriority);
      await issueApi.changePriority(issue.issueId, nextPriority);
      await refreshProjectIssues(issue.projectId);
      toast.success(`Priority updated to ${nextPriority}`);
    } catch (err) {
      setPriority(issue.issuePriority);
      toast.error(err.message || 'Failed to change priority.');
    }
  };

  const handleDeleteIssue = async () => {
    setDeletingIssue(true);
    try {
      await issueApi.deleteIssue(issue.issueId);
      await refreshProjectIssues(issue.projectId);
      toast.success(`Issue #${issue.issueId} deleted.`);
      setDeleteConfirmOpen(false);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to delete issue.');
    } finally {
      setDeletingIssue(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPostingComment(true);
    try {
      await commentApi.addComment({
        projectId: issue.projectId,
        issueId: issue.issueId,
        comment: newComment.trim(),
      });
      setNewComment('');
      await loadComments();
      toast.success('Comment posted.');
    } catch (err) {
      toast.error(err.message || 'Failed to post comment.');
    } finally {
      setPostingComment(false);
    }
  };

  const handleSaveEditedComment = async (commentId) => {
    if (!editingCommentText.trim()) return;
    try {
      await commentApi.editComment(commentId, editingCommentText.trim());
      setEditingCommentId(null);
      setEditingCommentText('');
      await loadComments();
      toast.success('Comment updated.');
    } catch (err) {
      toast.error(err.message || 'Failed to edit comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!commentId) {
      toast.error(
        'Cannot delete comment because backend CommentMapper.toDTO() returned commentId as null.'
      );
      return;
    }
    try {
      await commentApi.deleteComment(commentId);
      await loadComments();
      toast.success('Comment deleted.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete comment.');
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Issue #${issue.issueId}`}
        subtitle={`${issue.projectName || `Project #${issue.projectId}`}`}
        maxWidth="max-w-2xl"
      >
        <div className="max-h-[78vh] space-y-6 overflow-y-auto pr-1">
          {/* Top Metadata & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={status} />
              <PriorityBadge priority={priority} />
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Hash className="h-3 w-3" />
                {issue.issueId}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Edit3 className="h-3.5 w-3.5" />
                {isEditing ? 'Cancel Edit' : 'Edit Issue'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>

          {/* Issue Body or Edit Form */}
          {isEditing ? (
            <form onSubmit={handleSaveIssue} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Issue Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {ISSUE_STATUS_LIST.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {ISSUE_PRIORITY_LIST.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Assignee User ID
                  </label>
                  <input
                    type="number"
                    min="1"
                    list="detail-known-users"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <datalist id="detail-known-users">
                    {knownUsers.map((u) => (
                      <option key={u.userId} value={u.userId}>
                        {u.userName}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingIssue}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingIssue ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {issue.issueTitle}
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {issue.issueDescription || 'No description provided.'}
                </p>
              </div>

              {/* Quick Controls & People */}
              <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2.5 text-xs">
                  <Folder className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400">Project:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {issue.projectName || `#${issue.projectId}`}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400">Reporter:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {issue.reporterName
                      ? `${issue.reporterName} (#${issue.reporterId})`
                      : issue.reporterId
                      ? `User #${issue.reporterId}`
                      : '—'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <User className="h-4 w-4 text-indigo-500" />
                  <span className="text-slate-500 dark:text-slate-400">Assignee:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {issue.assigneeName
                      ? `${issue.assigneeName} (#${issue.assigneeId})`
                      : issue.assigneeId
                      ? `User #${issue.assigneeId}`
                      : 'Unassigned'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Quick Status:</span>
                  <select
                    value={status}
                    onChange={(e) => handleQuickStatusChange(e.target.value)}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {ISSUE_STATUS_LIST.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 text-xs sm:col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">Quick Priority:</span>
                  <select
                    value={priority}
                    onChange={(e) => handleQuickPriorityChange(e.target.value)}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {ISSUE_PRIORITY_LIST.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <MessageSquare className="h-4 w-4 text-indigo-500" />
                Comments ({comments.length})
              </h3>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-4 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment on this issue..."
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="submit"
                disabled={postingComment || !newComment.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                Post
              </button>
            </form>

            {/* Comment List */}
            {loadingComments ? (
              <p className="py-4 text-center text-xs text-slate-500">
                Loading comments...
              </p>
            ) : comments.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                No comments yet on this issue.
              </p>
            ) : (
              <div className="space-y-2.5">
                {comments.map((c, idx) => {
                  const hasId = c.commentId !== null && c.commentId !== undefined;
                  const isEditingThis = hasId && editingCommentId === c.commentId;

                  return (
                    <div
                      key={c.commentId ?? `comment-${idx}`}
                      className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-mono font-medium">
                            {hasId ? `Comment #${c.commentId}` : 'Comment'}
                          </span>
                          <span>•</span>
                          <span>
                            Author & timestamp not returned by DisplayCommentDTO
                          </span>
                        </div>

                        {hasId && !isEditingThis && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCommentId(c.commentId);
                                setEditingCommentText(c.comment);
                              }}
                              className="rounded p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                              title="Edit comment"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(c.commentId)}
                              className="rounded p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
                              title="Delete comment"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {isEditingThis ? (
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="text"
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditedComment(c.commentId)}
                            className="rounded-lg bg-emerald-600 p-1.5 text-white hover:bg-emerald-700"
                            title="Save"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCommentId(null)}
                            className="rounded-lg border border-slate-300 p-1.5 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                            title="Cancel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <p className="mt-1.5 text-sm text-slate-800 dark:text-slate-200">
                          {c.comment}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteIssue}
        title={`Delete Issue #${issue.issueId}`}
        message={`Are you sure you want to delete "${issue.issueTitle}"? This permanently removes the issue from the database.`}
        confirmLabel="Delete Issue"
        loading={deletingIssue}
      />
    </>
  );
}
