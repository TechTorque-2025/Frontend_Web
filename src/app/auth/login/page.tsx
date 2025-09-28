'use client'

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import authService from '../../../services/authService';
import type { LoginRequest } from '../../../types/api';
import ThemeToggle from '../../components/ThemeToggle';

// Icon Components
const Icon = ({ d, size = 10 }: { d: string; size?: number }) => (
  <svg className={`w-${size} h-${size} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);
const BoltIcon = ({size = 10}) => <Icon d="M13 10V3L4 14h7v7l9-11h-7z" size={size} />;
const LockClosedIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;


// --- Login Page Component ---
export default function LoginPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsAccountLocked(false);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload: LoginRequest = {
      username: (formData.get('username') as string) || '',
      password: (formData.get('password') as string) || '',
    };
    try {
      await authService.login(payload);
      // Reset failed attempts on successful login
      setFailedAttempts(0);
      router.push('/dashboard');
    } catch (err: unknown) {
      let errorMessage = 'Login failed';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Check if account is locked
        if (errorMessage.includes('temporarily locked')) {
          setIsAccountLocked(true);
        } else if (errorMessage.includes('Invalid username or password')) {
          // Increment failed attempts for better UX (this is just visual feedback)
          setFailedAttempts(prev => Math.min(prev + 1, 3));
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-bg-primary font-sans">
       {/* Header */}
      <header className="sticky-header shadow-lg border-b theme-border">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                <BoltIcon size={6} />
              </div>
              <h1 className="text-2xl font-bold theme-text-primary hidden sm:block">
                TechTorque Auto
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="theme-text-muted hidden md:inline">New here?</span>
              <Link href="/auth/register" className="theme-button-primary">
                Sign Up
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 automotive-hero">
         <div className="absolute inset-0 bg-grid-pattern opacity-20 dark:opacity-10"></div>
         <div className="w-full max-w-lg relative z-10">
            <div className="automotive-card p-8 md:p-12">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black theme-text-primary">
                        Welcome Back
                    </h2>
                    <p className="mt-4 text-lg theme-text-muted">
                        Sign in to access your dashboard.
                    </p>
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-semibold theme-text-primary mb-2">Demo Users (Real Backend):</p>
                      <div className="text-xs theme-text-muted space-y-1">
                        <p><strong>SuperAdmin:</strong> superadmin / superadmin123</p>
                        <p><strong>Admin:</strong> admin / admin123</p>
                        <p><strong>Employee:</strong> employee / emp123</p>
                        <p><strong>Customer:</strong> customer / cust123</p>
                      </div>
                    </div>
                </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="theme-form-group">
             <label htmlFor="username" className="block text-sm font-semibold theme-text-secondary mb-2">
              Email or Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="theme-input w-full"
              placeholder="you@example.com or your-username"
            />
          </div>

                    <div className="theme-form-group">
                         <div className="flex justify-between items-baseline">
                             <label htmlFor="password" className="block text-sm font-semibold theme-text-secondary mb-2">
                                Password
                            </label>
                             <Link href="/auth/forgot-password" className="text-sm theme-link">
                                Forgot password?
                            </Link>
                         </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="theme-input w-full"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <div>
                        <button type="submit" disabled={loading} className="theme-button-primary w-full text-lg font-semibold py-4 rounded-xl flex items-center justify-center disabled:opacity-60">
                           <LockClosedIcon />
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>
                </form>
                
                {/* Enhanced Error Display */}
                {error && (
                  <div role="alert" className="mt-4 space-y-3">
                    <div className={`p-4 rounded-lg border-l-4 ${
                      isAccountLocked 
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300' 
                        : 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-800 dark:text-orange-300'
                    }`}>
                      <div className="flex items-start space-x-3">
                        {isAccountLocked ? (
                          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                        <div className="flex-1">
                          <p className="font-medium">
                            {isAccountLocked ? 'Account Temporarily Locked' : 'Login Failed'}
                          </p>
                          <p className="mt-1 text-sm">{error}</p>
                          
                          {!isAccountLocked && failedAttempts > 0 && failedAttempts < 3 && (
                            <p className="mt-2 text-xs opacity-75">
                              {failedAttempts}/3 failed attempts. Account will be locked for 15 minutes after 3 failed attempts.
                            </p>
                          )}
                          
                          {isAccountLocked && (
                            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border text-sm">
                              <p><strong>Security Notice:</strong></p>
                              <ul className="mt-1 list-disc list-inside space-y-1 text-xs">
                                <li>Your account has been temporarily locked due to multiple failed login attempts</li>
                                <li>This is a security measure to protect your account from unauthorized access</li>
                                <li>Please wait for the specified time before trying again</li>
                                <li>If you forgot your password, use the &quot;Forgot password?&quot; link above</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
             </div>
         </div>
      </main>
    </div>
  );
}

