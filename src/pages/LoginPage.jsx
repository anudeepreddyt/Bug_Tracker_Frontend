import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Bug, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ username: username.trim(), password });
      toast.success(`Welcome back, ${username.trim()}!`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials or unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
            <Bug className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sign in to TrackFlow
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Enter your credentials to access your Bug Tracker workspace
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200/90 bg-white p-7 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Username
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-3.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-3.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-60"
            >
              <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
