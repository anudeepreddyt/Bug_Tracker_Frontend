import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Columns3,
  ListTodo,
  UserCog,
  Bug,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/kanban', label: 'Kanban Board', icon: Columns3 },
  { to: '/issues', label: 'All Issues', icon: ListTodo },
  { to: '/profile', label: 'Account Settings', icon: UserCog },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
    }`;

  const content = (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <Bug className="h-4 w-4" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              TrackFlow
            </span>
            <span className="block text-[10px] font-medium text-slate-400">
              Bug & Issue Tracker
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={linkClasses}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="border-t border-slate-100 p-4 dark:border-slate-800">
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Spring Boot API
          </p>
          <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">{content}</aside>

      {/* Mobile slide-over sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
            onClick={onClose}
          />
          <div className="relative z-10 w-64 max-w-[80vw]">{content}</div>
        </div>
      )}
    </>
  );
}
