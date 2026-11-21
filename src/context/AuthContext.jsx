import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { authApi } from '../api/authApi';
import { STORAGE_KEYS } from '../utils/constants';
import {
  extractUsernameFromToken,
  getTokenRemainingMs,
  isTokenExpired,
} from '../utils/jwtUtils';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (saved && !isTokenExpired(saved)) return saved;
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    return null;
  });

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(Boolean(token));

  const logout = useCallback(async () => {
    const activeToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    try {
      if (activeToken && !isTokenExpired(activeToken)) {
        await authApi.signOut();
      }
    } catch {
      // Always clear local auth state even if backend signout fails or token is already blacklisted
    } finally {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      setToken(null);
      setUser(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const activeToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!activeToken || isTokenExpired(activeToken)) {
      logout();
      setLoading(false);
      return null;
    }
    try {
      const profile = await authApi.getCurrentUser();
      setUser(profile);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
      return profile;
    } catch (err) {
      // Fallback to username decoded from JWT if profile fetch fails transiently
      const sub = extractUsernameFromToken(activeToken);
      if (sub) {
        const fallback = { username: sub };
        setUser((prev) => prev || fallback);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      refreshProfile().catch(() => {});
    } else {
      setLoading(false);
    }
  }, [token, refreshProfile]);

  // Auto-logout timer when JWT expires
  useEffect(() => {
    if (!token) return;
    const remaining = getTokenRemainingMs(token);
    if (remaining <= 0) {
      logout();
      return;
    }
    const timer = setTimeout(() => {
      logout();
    }, remaining);

    return () => clearTimeout(timer);
  }, [token, logout]);

  // Listen for 401/expired events dispatched by Axios interceptor
  useEffect(() => {
    const handleExpired = () => logout();
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [logout]);

  const login = async ({ username, password }) => {
    const jwt = await authApi.signIn({ username, password });
    if (!jwt || typeof jwt !== 'string' || jwt.split('.').length !== 3) {
      throw new Error('Authentication server did not return a valid JWT token.');
    }
    localStorage.setItem(STORAGE_KEYS.TOKEN, jwt);
    setToken(jwt);

    try {
      const profile = await authApi.getCurrentUser();
      setUser(profile);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
      return profile;
    } catch {
      const fallbackUser = { username };
      setUser(fallbackUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  };

  const register = async ({ username, email, password }) => {
    // Public registration strictly uses USER role
    return await authApi.signUp({ username, email, password }, 'USER');
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && !isTokenExpired(token)),
    loading,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
