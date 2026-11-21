import axios from 'axios';
import { STORAGE_KEYS } from '../utils/constants';
import { isTokenExpired } from '../utils/jwtUtils';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT Bearer token & check local expiry
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (token) {
      if (isTokenExpired(token)) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject(
          new Error('Your session has expired. Please sign in again.')
        );
      }
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalize Spring Boot GobalException (HTTP 200 with ErrorResponse body)
// as well as standard 401/403/500 & network errors.
api.interceptors.response.use(
  (response) => {
    const data = response.data;
    // Backend GobalException.java returns ResponseEntity.ok(ErrorResponse) where
    // ErrorResponse = { message: string, status: 403, localDateTime: string }
    if (
      data &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      typeof data.message === 'string' &&
      typeof data.status === 'number' &&
      data.status >= 400 &&
      'localDateTime' in data
    ) {
      const appError = new Error(data.message);
      appError.status = data.status;
      appError.isBackendHandledError = true;
      return Promise.reject(appError);
    }
    return response;
  },
  (error) => {
    if (!error.response) {
      // Network error or CORS blocked preflight
      const netErr = new Error(
        'Unable to reach the backend server. Verify Spring Boot is running on http://localhost:8080 and CORS is configured.'
      );
      netErr.isNetworkError = true;
      return Promise.reject(netErr);
    }

    const { status, data } = error.response;

    if (status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.dispatchEvent(new CustomEvent('auth:expired'));
      return Promise.reject(
        new Error('Unauthorized or expired session. Please sign in again.')
      );
    }

    if (status === 403) {
      const msg =
        (typeof data === 'object' && data?.message) ||
        (typeof data === 'string' && data) ||
        'Access denied (403 Forbidden). You may lack permissions or your JWT token is invalid.';
      return Promise.reject(new Error(msg));
    }

    // Spring Validation errors or generic error payloads
    let extractedMessage = `Request failed with status ${status}`;
    if (typeof data === 'string' && data.trim()) {
      extractedMessage = data;
    } else if (data && typeof data === 'object') {
      if (data.message) {
        extractedMessage = data.message;
      } else if (data.error) {
        extractedMessage = data.error;
      } else if (data.errors && Array.isArray(data.errors)) {
        extractedMessage = data.errors
          .map((e) => e.defaultMessage || e.message || JSON.stringify(e))
          .join(', ');
      }
    }

    return Promise.reject(new Error(extractedMessage));
  }
);

export default api;
