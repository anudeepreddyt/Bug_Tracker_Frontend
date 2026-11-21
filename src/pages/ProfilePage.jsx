import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, KeyRound, UserCheck, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/authApi';
import { formatDateTime } from '../utils/formatters';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function ProfilePage() {
  const { user, refreshProfile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [updatingDetails, setUpdatingDetails] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() && !newEmail.trim()) {
      toast.error('Provide a new username or email address to update.');
      return;
    }
    setUpdatingDetails(true);
    try {
      await authApi.updateDetails({
        newUsername: newUsername.trim() || undefined,
        newEmail: newEmail.trim() || undefined,
      });
      toast.success(
        newUsername.trim()
          ? 'Username updated. Please sign in again with your new username.'
          : 'Account details updated.'
      );
      if (newUsername.trim()) {
        logout();
        navigate('/login', { replace: true });
      } else {
        setNewEmail('');
        await refreshProfile();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setUpdatingDetails(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      toast.error('Password must be at least 4 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setUpdatingPassword(true);
    try {
      const msg = await authApi.updatePassword(newPassword);
      toast.success(typeof msg === 'string' ? msg : 'Password updated.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await authApi.deleteUser();
      toast.success('Your account has been deleted.');
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Failed to delete account.');
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          View your profile metadata from <code>GET /api/getuser</code> and manage credentials.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {user?.username || 'Authenticated User'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user?.email || 'No email returned'}
            </p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-4">
          <div>
            <dt className="text-slate-400">User ID</dt>
            <dd className="mt-1 font-mono font-semibold text-slate-900 dark:text-slate-100">
              {user?.userId ? `${user.userId}` : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">System Role</dt>
            <dd className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
              {user?.role || 'USER'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Account Created</dt>
            <dd className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
              {formatDateTime(user?.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Last Updated</dt>
            <dd className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
              {formatDateTime(user?.updatedAt)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Update Details Form */}
      <form
        onSubmit={handleUpdateDetails}
        className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Update Profile Details (PUT /api/updatedetails)
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              New Username
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder={user?.username || 'New username'}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              New Email
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder={user?.email || 'New email'}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updatingDetails}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {updatingDetails ? 'Updating...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* Update Password Form */}
      <form
        onSubmit={handleUpdatePassword}
        className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Change Password (PATCH /api/updatepassword)
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updatingPassword}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
          >
            {updatingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="flex items-center justify-between rounded-2xl border border-rose-200/90 bg-rose-50/60 p-5 dark:border-rose-900/60 dark:bg-rose-950/30">
        <div>
          <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-300">
            Delete Account
          </h3>
          <p className="mt-0.5 text-xs text-rose-600/90 dark:text-rose-400">
            Permanently deletes your user record via DELETE /api/deleteuser.
          </p>
        </div>
        <button
          onClick={() => setDeleteAccountOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-700"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete Account
        </button>
      </div>

      <ConfirmDialog
        isOpen={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Your Account"
        message="This will permanently delete your account from the Bug Tracker backend. Are you sure?"
        confirmLabel="Delete My Account"
        loading={deletingAccount}
      />
    </div>
  );
}
