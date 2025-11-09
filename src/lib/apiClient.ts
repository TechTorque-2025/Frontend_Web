import axios from 'axios';
import Cookies from 'js-cookie';
import { config } from '@/config/runtime';

// Use runtime configuration instead of build-time env vars
const API_BASE_URL = config.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor (Your existing code is perfect)
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('tt_access_token');
    if (token) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      config.headers.Authorization = `Bearer ${token}`;
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

    // Extract meaningful error message from response
    let errorMessage = 'An error occurred';
    if (error.response?.data) {
      const data = error.response.data;
      // Try different possible error message fields
      errorMessage = data.message || data.error || data.msg || JSON.stringify(data);
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Create a new error with the extracted message
    const enhancedError = new Error(errorMessage);
    return Promise.reject(enhancedError);
  }
);

export default apiClient;
