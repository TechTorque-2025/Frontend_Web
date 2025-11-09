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
    // api baseURL already includes '/api/v1'
    const res = await api.post('/auth/login', payload);
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
    const res = await api.post('/auth/register', payload);
    return res.data;
  },
  async forgotPassword(email: string) {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  async resetPassword(token: string, newPassword: string) {
    const res = await api.post('/auth/reset-password', { token, newPassword });
    return res.data;
  },
  async refreshToken(refreshToken: string) {
    const res = await api.post('/auth/refresh', { refreshToken });
    const token = res.data?.token || res.data?.accessToken || null;
    if (token) {
      Cookies.set(TOKEN_COOKIE, token, { expires: 7 });
    }
    return res.data;
  },
  async resendVerificationEmail(email: string) {
    const res = await api.post('/auth/resend-verification', { email });
    return res.data;
  },
  async createEmployee(payload: CreateEmployeeRequest) {
    const res = await api.post('/auth/users/employee', payload);
    return res.data;
  },
  async createAdmin(payload: CreateAdminRequest) {
    const res = await api.post('/auth/users/admin', payload);
    return res.data;
  },
  async testEndpoint() {
    const res = await api.get('/auth/test');
    return res.data;
  },
  async healthCheck() {
    const res = await api.get('/auth/health');
    return res.data;
  },
  logout() {
    Cookies.remove(TOKEN_COOKIE);
  },
  getToken() {
    return Cookies.get(TOKEN_COOKIE) || null;
  },
  async verifyEmail(token: string) {
    console.log('authService.verifyEmail called with token:', token);
    try {
      const res = await api.post('/auth/verify-email', { token });
      console.log('Verification API response:', res.data);
      // Save token to cookie after verification
      const accessToken = res.data?.token || res.data?.accessToken || null;
      if (accessToken) {
        Cookies.set(TOKEN_COOKIE, accessToken, { expires: 7 });
        console.log('Access token saved to cookie');
      }
      return res.data;
    } catch (error) {
      console.error('Verification API error:', error);
      throw error;
    }
  },
};

export default authService;
