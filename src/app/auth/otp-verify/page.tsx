'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ThemeToggle from '../../components/ThemeToggle'

export default function OTPVerifyPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      alert('Please enter all 6 digits')
      return
    }
    console.log('OTP submitted:', otpString)
    // Here you would typically verify the OTP
    alert('OTP verified successfully!')
    router.push('/auth/login')
  }

  const handleResendOTP = async () => {
    setIsResending(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsResending(false)
    setTimeLeft(300) // Reset timer
    setOtp(['', '', '', '', '', ''])
    alert('New OTP sent successfully!')
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
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold theme-text-primary">
              Enter Verification Code
            </h2>
          </div>
          <p className="mt-4 text-center text-lg theme-text-muted font-medium">
            We've sent a 6-digit verification code to your email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-12 space-y-8">
          <div className="space-y-6">
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  className="w-14 h-14 text-center text-xl font-bold theme-border-2 theme-bg-secondary theme-text-primary rounded-xl focus:theme-border-primary focus:outline-none transition-colors"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-base theme-text-secondary">
              Time remaining: {' '}
              <span className={`font-semibold ${timeLeft < 60 ? 'text-red-600 dark:text-red-400' : 'theme-text-primary'}`}>
                {formatTime(timeLeft)}
              </span>
            </p>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              className="theme-button-primary w-full text-lg font-semibold py-4 rounded-xl flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Verify Code
            </button>
          </div>

          <div className="text-center space-y-3">
            <p className="text-base theme-text-muted">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={timeLeft > 240 || isResending} // Can resend after 1 minute
              className={`font-semibold text-base ${
                timeLeft > 240 || isResending
                  ? 'theme-text-disabled cursor-not-allowed'
                  : 'theme-link'
              }`}
            >
              {isResending ? 'Sending...' : 'Resend Code'}
            </button>
          </div>

          <div className="text-center pt-6">
            <p className="text-base theme-text-muted">
              Want to try a different email?{' '}
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