"use client";
import api from '../lib/apiClient';
import Cookies from 'js-cookie';
import type { 
  LoginRequest, 
  RegisterRequest, 
  CreateEmployeeRequest, 
  CreateAdminRequest 
} from '../types/api';

const TOKEN_COOKIE = 'tt_access_token';

export const authService = {
  async login(payload: LoginRequest) {
    const res = await api.post('/api/v1/auth/login', payload);
    // backend returns token in body
    const token = res.data?.token || res.data?.accessToken || null;
    console.log('Login response:', res.data);
    console.log('Extracted token:', token);
    if (token) {
      Cookies.set(TOKEN_COOKIE, token, { expires: 7 });
      console.log('Token saved to cookie');
    }
    return res.data;
  },


  async register(payload: RegisterRequest) {
    const res = await api.post('/api/v1/auth/register', payload);
    return res.data;
  },
  async createEmployee(payload: CreateEmployeeRequest) {
    const res = await api.post('/api/v1/auth/users/employee', payload);
    return res.data;
  },
  async createAdmin(payload: CreateAdminRequest) {
    const res = await api.post('/api/v1/auth/users/admin', payload);
    return res.data;
  },
  async testEndpoint() {
    const res = await api.get('/api/v1/auth/test');
    return res.data;
  },
  async healthCheck() {
    const res = await api.get('/api/v1/auth/health');
    return res.data;
  },
  logout() {
    Cookies.remove(TOKEN_COOKIE);
  },
  getToken() {
    return Cookies.get(TOKEN_COOKIE) || null;
  },
};

// Request interceptor to attach token
api.interceptors.request.use((config) => {
  try {
    const token = Cookies.get(TOKEN_COOKIE);
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (err) {
    // log to help debugging in production builds
  console.warn('auth interceptor error', err);
  }
  return config;
});

export default authService;
