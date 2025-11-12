'use client'

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import authService from '../../../services/authService';
import ThemeToggle from '../../components/ThemeToggle';

// Icon Components
const Icon = ({ d, size = 10 }: { d: string; size?: number }) => (
  <svg className={`w-${size} h-${size} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);
const BoltIcon = ({size = 10}) => <Icon d="M13 10V3L4 14h7v7l9-11h-7z" size={size} />;
const MailIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

function ResendVerificationContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState(emailParam || '');

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await authService.resendVerificationEmail(email);
      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend verification email';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {success ? (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold theme-text-primary mb-4">
            Email Sent!
          </h3>
          <p className="theme-text-muted mb-6">
            We&apos;ve sent a new verification link to <strong>{email}</strong>.
            Please check your inbox and click the link to verify your account.
          </p>
          <div className="space-y-3">
            <Link href="/auth/login" className="theme-button-primary w-full block">
              Back to Login
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setError(null);
              }}
              className="theme-button-secondary w-full"
            >
              Send Another Email
            </button>
          </div>
        </div>
      ) : (
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="theme-input w-full"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <button 
              type="submit" 
              disabled={loading} 
              className="theme-button-primary w-full text-lg font-semibold py-4 rounded-xl flex items-center justify-center disabled:opacity-60"
            >
              <MailIcon />
              {loading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div role="alert" className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!success && (
        <div className="mt-6 text-center">
          <p className="text-sm theme-text-muted">
            Remember your password?{' '}
            <Link href="/auth/login" className="theme-link font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      )}
    </>
  );
}

export default function ResendVerificationPage() {
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
              <Link href="/auth/login" className="theme-button-secondary">
                Back to Login
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
                Resend Verification Email
              </h2>
              <p className="mt-4 text-lg theme-text-muted">
                Enter your email address to receive a new verification link.
              </p>
            </div>

            <Suspense fallback={<div className="text-center theme-text-muted">Loading...</div>}>
              <ResendVerificationContent />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
