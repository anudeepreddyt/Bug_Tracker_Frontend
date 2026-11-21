import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CreateIssueModal from '../issues/CreateIssueModal';

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createIssueOpen, setCreateIssueOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenCreateIssue={() => setCreateIssueOpen(true)}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      <CreateIssueModal
        isOpen={createIssueOpen}
        onClose={() => setCreateIssueOpen(false)}
      />
    </div>
  );
}
