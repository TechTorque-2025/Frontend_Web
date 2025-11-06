'use client';

/**
 * Authentication Context Provider
 * Manages global authentication state and user sessions
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import {
  AuthContextType,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  UserRole
} from '@/types/auth.types';
import { authService, userService } from '@/lib/api/auth.service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_COOKIE_NAME = 'auth_token';
const USER_STORAGE_KEY = 'auth_user';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = Cookies.get(TOKEN_COOKIE_NAME);
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser) as AuthUser);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid data
        Cookies.remove(TOKEN_COOKIE_NAME);
        localStorage.removeItem(USER_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fetch current user profile
  const fetchCurrentUser = useCallback(async () => {
    try {
      const userData = await userService.getCurrentUser();
      const authUser: AuthUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        roles: userData.roles,
        permissions: userData.permissions,
        enabled: userData.enabled,
      };
      setUser(authUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      throw error;
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);

      if (response.success && response.token) {
        // Store token in cookie (7 days expiration)
        Cookies.set(TOKEN_COOKIE_NAME, response.token, {
          expires: 7,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production'
        });

        setToken(response.token);

        // Fetch user profile
        await fetchCurrentUser();

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router, fetchCurrentUser]);

  // Register function
  const register = useCallback(async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);

      if (response.success && response.token) {
        // Store token
        Cookies.set(TOKEN_COOKIE_NAME, response.token, {
          expires: 7,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production'
        });

        setToken(response.token);

        // Fetch user profile
        await fetchCurrentUser();

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router, fetchCurrentUser]);

  // Logout function
  const logout = useCallback(() => {
    // Clear token and user data
    Cookies.remove(TOKEN_COOKIE_NAME);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);

    // Redirect to home
    router.push('/');
  }, [router]);

  // Update user function
  const updateUser = useCallback((updatedUser: AuthUser) => {
    setUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role: UserRole): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  }, [user]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.some(role => user.roles.includes(role));
  }, [user]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
