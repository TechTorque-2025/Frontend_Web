'use client'

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import authService from '../../../services/authService';
import type { RegisterRequest } from '../../../types/api';
import ThemeToggle from '../../components/ThemeToggle';

// Icon Components
const Icon = ({ d, size = 10 }: { d: string; size?: number }) => (
  <svg className={`w-${size} h-${size} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);
const BoltIcon = ({size = 10}) => <Icon d="M13 10V3L4 14h7v7l9-11h-7z" size={size} />;
const UserPlusIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;

// --- Register Page Component ---
export default function RegisterPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload: RegisterRequest = {
      fullName: (formData.get('name') as string) || '',
      email: (formData.get('email') as string) || '',
      password: (formData.get('password') as string) || '',
    };
    try {
      await authService.register(payload);
      router.push('/auth/login');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
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
               <span className="theme-text-muted hidden md:inline">Already have an account?</span>
               <Link href="/auth/login" className="theme-button-secondary">
                Sign In
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
                        Create an Account
                    </h2>
                    <p className="mt-4 text-lg theme-text-muted">
                       Join us to streamline your vehicle care.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="theme-form-group">
                         <label htmlFor="name" className="block text-sm font-semibold theme-text-secondary mb-2">
                            Full Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            className="theme-input w-full"
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="theme-form-group">
                         <label htmlFor="email" className="block text-sm font-semibold theme-text-secondary mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="theme-input w-full"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="theme-form-group">
                         <label htmlFor="password" className="block text-sm font-semibold theme-text-secondary mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            className="theme-input w-full"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <div>
                        <button type="submit" disabled={loading} className="theme-button-primary w-full text-lg font-semibold py-4 rounded-xl flex items-center justify-center disabled:opacity-60">
                            <UserPlusIcon />
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </div>
                </form>
                {error && (
                  <div role="alert" className="mt-4 text-sm text-red-600">
                    {error}
                  </div>
                )}
             </div>
         </div>
      </main>
    </div>
  );
}

