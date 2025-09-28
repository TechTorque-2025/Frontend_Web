import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

let API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';

const createClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add a request interceptor to include the auth token
  client.interceptors.request.use(
    (config) => {
      const token = Cookies.get('tt_access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add a response interceptor to handle auth errors
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Clear token and redirect to login
        Cookies.remove('tt_access_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};

let api = createClient(API_BASE);

export const setApiBaseUrl = (baseUrl: string) => {
  API_BASE = baseUrl;
  api = createClient(API_BASE);
};

export const getApiBaseUrl = () => API_BASE;

export default api;
