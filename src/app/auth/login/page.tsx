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
  const [warning, setWarning] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setWarning(null);
    setUnverifiedEmail(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = (formData.get('username') as string) || '';
    const payload: LoginRequest = {
      username: email,
      password: (formData.get('password') as string) || '',
    };
    try {
      const response = await authService.login(payload);

      // Check if email is not verified and show warning
      if (response.emailVerified === false) {
        setWarning('⚠️ Please verify your email within 7 days to continue using the service. Check your inbox for the verification link.');
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      
      // Check if error is about email verification
      if (errorMessage.includes('verify your email') || errorMessage.includes('email address')) {
        setUnverifiedEmail(email);
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }
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
                {error && (
                  <div role="alert" className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
                    {unverifiedEmail && (
                      <Link 
                        href={`/auth/resend-verification?email=${encodeURIComponent(unverifiedEmail)}`}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        Resend Verification Email →
                      </Link>
                    )}
                  </div>
                )}
                {warning && (
                  <div role="alert" className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">{warning}</p>
                  </div>
                )}
             </div>
         </div>
      </main>
    </div>
  );
}
