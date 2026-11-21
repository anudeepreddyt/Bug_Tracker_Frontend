import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import KanbanPage from './pages/KanbanPage';
import IssuesPage from './pages/IssuesPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <WorkspaceProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Protected Workspace Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route
                    path="projects/:projectId"
                    element={<ProjectDetailsPage />}
                  />
                  <Route path="kanban" element={<KanbanPage />} />
                  <Route path="issues" element={<IssuesPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </WorkspaceProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
