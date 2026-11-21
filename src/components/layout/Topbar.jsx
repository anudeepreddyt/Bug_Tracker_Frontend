import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  Plus,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { authApi } from '../../api/authApi';
import { getInitials } from '../../utils/formatters';

export default function Topbar({ onOpenMobileMenu, onOpenCreateIssue }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { syncWorkspace, loadingWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [serverOnline, setServerOnline] = useState(null);

  useEffect(() => {
    let mounted = true;
    authApi
      .healthCheck()
      .then(() => {
        if (mounted) setServerOnline(true);
      })
      .catch(() => {
        if (mounted) setServerOnline(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Backend connection indicator */}
        <div
          className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium sm:inline-flex ${
            serverOnline === true
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300'
              : serverOnline === false
              ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-300'
              : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400'
          }`}
          title="Live status from GET /api/healthcheck"
        >
          {serverOnline === false ? (
            <WifiOff className="h-3.5 w-3.5" />
          ) : (
            <Wifi className="h-3.5 w-3.5" />
          )}
          <span>
            {serverOnline === true
              ? 'Backend Connected'
              : serverOnline === false
              ? 'Backend Offline'
              : 'Checking API...'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenCreateIssue}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 sm:px-3.5 sm:py-2 sm:text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Issue</span>
        </button>

        <button
          onClick={() => syncWorkspace()}
          disabled={loadingWorkspace}
          title="Sync projects and issues from backend"
          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RefreshCw
            className={`h-4 w-4 ${loadingWorkspace ? 'animate-spin' : ''}`}
          />
        </button>

        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block dark:bg-slate-800" />

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {getInitials(user?.username)}
          </div>
          <div className="hidden text-left md:block">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              {user?.username || 'User'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {user?.role || 'USER'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign out"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
