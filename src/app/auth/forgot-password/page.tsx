'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '../../components/ThemeToggle'
const Icon = ({ d, size = 10 }: { d: string; size?: number }) => ( <svg className={`w-${size} h-${size} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} /></svg>);
const BoltIcon = ({size = 10}) => <Icon d="M13 10V3L4 14h7v7l9-11h-7z" size={size} />;

// --- Forgot Password Page Component ---
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password reset requested for:', email);
    setIsSubmitted(true);
    // In a real app, you'd send an email here.
    setTimeout(() => {
      router.push('/auth/otp-verify');
    }, 2000);
  };

  return (
    <div className="min-h-screen theme-bg-primary font-sans">
      <header className="sticky-header shadow-lg border-b theme-border">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3 group"><div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110"><BoltIcon size={6} /></div><h1 className="text-2xl font-bold theme-text-primary hidden sm:block">TechTorque Auto</h1></Link>
            <div className="flex items-center space-x-4"><Link href="/auth/login" className="theme-link hidden md:inline-block">Back to Sign In</Link><ThemeToggle /></div>
          </div>
        </div>
      </header>
      
      <main className="flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 automotive-hero">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 dark:opacity-10"></div>
        <div className="w-full max-w-lg relative z-10">
          <div className="automotive-card p-8 md:p-12">
            {isSubmitted ? (
              <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                      <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h2 className="text-4xl font-bold theme-text-primary">Check your email</h2>
                  <p className="mt-4 text-lg theme-text-secondary">We've sent a verification code to <strong>{email}</strong></p>
                  <p className="mt-6 text-base theme-text-muted animate-pulse">Redirecting to OTP verification...</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-black theme-text-primary">Forgot Password?</h2>
                  <p className="mt-4 text-lg theme-text-muted">No problem. Enter your email to get a reset code.</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="theme-form-group">
                    <label htmlFor="email" className="block text-sm font-semibold theme-text-secondary mb-2">Email Address</label>
                    <input id="email" name="email" type="email" autoComplete="email" required className="theme-input w-full" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <button type="submit" className="theme-button-primary w-full text-lg font-semibold py-4 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        Send Reset Code
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

