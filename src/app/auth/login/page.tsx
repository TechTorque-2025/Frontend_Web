'use client'

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic
    console.log('Login attempt');
    router.push('/'); // Redirect to homepage after login
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
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
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
                        <button type="submit" className="theme-button-primary w-full text-lg font-semibold py-4 rounded-xl flex items-center justify-center">
                           <LockClosedIcon />
                            Sign In
                        </button>
                    </div>
                </form>
             </div>
         </div>
      </main>
    </div>
  );
}

