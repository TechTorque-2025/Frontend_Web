import axios from 'axios';
import Cookies from 'js-cookie';

// The base URL is now a constant, correctly pointing to the API Gateway.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
      Cookies.remove('tt_access_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
