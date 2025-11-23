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

    // Extract meaningful error message from response
    let errorMessage = 'An error occurred';
    if (error.response?.data) {
      const data = error.response.data;
      // Try different possible error message fields
      errorMessage = data.message || data.error || data.msg || JSON.stringify(data);
    } else if (error.message) {
      errorMessage = error.message;
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
    enhancedError.response = error.response;
    enhancedError.config = error.config;
    enhancedError.original = error;

    return Promise.reject(enhancedError);
  }
);

export default apiClient;
