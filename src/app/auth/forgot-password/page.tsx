'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ThemeToggle from '../../components/ThemeToggle'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Password reset requested for:', email)
    setIsSubmitted(true)
    // Here you would typically send the reset email and redirect to OTP page
    setTimeout(() => {
      router.push('/auth/otp-verify')
    }, 2000)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-bg-primary py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-end">
            <ThemeToggle />
          </div>
          <div>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-bold theme-text-primary">
              Check your email
            </h2>
            <p className="mt-4 text-lg theme-text-secondary">
              We've sent a verification code to {email}
            </p>
            <p className="mt-6 text-base theme-text-muted">
              Redirecting to OTP verification...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center theme-bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        <div>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold theme-text-primary">
              Forgot Password?
            </h2>
          </div>
          <p className="mt-4 text-center text-lg theme-text-muted font-medium">
            Enter your email address and we'll send you a verification code to reset your password.
          </p>
        </div>
        <form className="mt-12 space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
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
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              className="theme-button-primary w-full text-lg font-semibold py-4 rounded-xl flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Verification Code
            </button>
          </div>

          <div className="text-center pt-6">
            <p className="text-base theme-text-muted">
              Remember your password?{' '}
              <Link
                href="/auth/login"
                className="theme-link font-semibold text-lg"
              >
                Back to Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}