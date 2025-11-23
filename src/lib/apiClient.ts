import axios from 'axios';
import Cookies from 'js-cookie';
import { config } from '@/config/runtime';

// Use runtime configuration instead of build-time env vars
const API_BASE_URL = config.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

// Helper function to decode JWT (for debugging only)
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Request interceptor (Your existing code is perfect)
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('tt_access_token');
    if (token) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      config.headers.Authorization = `Bearer ${token}`;

      // 🔍 DEBUG: Log the username from JWT token
      const payload = decodeJWT(token);
      if (payload && config.url?.includes('/vehicles')) {
        console.log('🔍 [DEBUG] Making request to:', config.url);
        console.log('🔍 [DEBUG] JWT username (sub):', payload.sub);
        console.log('🔍 [DEBUG] JWT roles:', payload.roles);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (Your existing code is perfect)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're already on the login page or if it's a login request
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        Cookies.remove('tt_access_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }

    // Helper: extract a short, readable message from common server response shapes
    function extractShortErrorMessage(payload: unknown): string {
      if (!payload) return 'An error occurred';

      // Common FastAPI / Python responses frequently put the human-friendly
      // message into `detail` (string/array/object). Other APIs may use
      // `message`, `error` or `msg` fields.
      const asAny = payload as Record<string, unknown>;

      const candidates = [asAny.detail, asAny.message, asAny.error, asAny.msg];

      for (const c of candidates) {
        if (typeof c === 'string' && c.trim()) return c.trim();
        if (Array.isArray(c) && c.length) {
          // array payloads might include nested validation errors; join first elements
          try {
            return JSON.stringify(c[0]);
          } catch {
            return String(c[0]);
          }
        }

        if (typeof c === 'object' && c !== null) {
          // If we get an object, try to serialize the most useful key/value pair
          const keys = Object.keys(c as Record<string, unknown>);
          if (keys.length) {
            const candidate = (c as Record<string, unknown>)[keys[0]];
            if (typeof candidate === 'string') return candidate;
            try {
              return JSON.stringify(candidate);
            } catch {
              return String(candidate);
            }
          }
        }
      }

      // Fallback to a compact string of the whole object
      try {
        return JSON.stringify(payload);
      } catch {
        return String(payload);
      }
    }

    // Extract meaningful error message from response, but keep it safe for UI
    let errorMessage = 'An error occurred';
    if (error.response?.data) {
      const data = error.response.data;
      const candidate = extractShortErrorMessage(data);
      // Keep messages short (single-line) so they are safe to show in UIs and logs
      errorMessage = candidate.split(/\r?\n/)[0].slice(0, 300);
    } else if (error.message) {
      errorMessage = String(error.message).split(/\r?\n/)[0].slice(0, 300);
    }

    // Create a new Error and attach useful response metadata so callers
    // can inspect status / response details instead of only seeing
    // the generic axios message (e.g. "Request failed with status code 502").
    const enhancedError = new Error(errorMessage) as Error & {
      status?: number;
      response?: unknown;
      config?: Record<string, unknown> | undefined;
      original?: unknown;
    };

    // Preserve important axios error metadata so higher-level code can
    // branch based on status, read a response body, etc.
    enhancedError.status = error.response?.status;
    // preserve the raw response so callers can inspect the full payload if needed
    enhancedError.response = error.response;
    enhancedError.config = error.config;
    enhancedError.original = error;

    return Promise.reject(enhancedError);
  }
);

export default apiClient;
