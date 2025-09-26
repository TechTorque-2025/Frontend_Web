'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ThemeToggle from '../../components/ThemeToggle'
const Icon = ({ d, size = 10 }: { d: string; size?: number }) => ( <svg className={`w-${size} h-${size} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} /></svg>);
const BoltIcon = ({size = 10}) => <Icon d="M13 10V3L4 14h7v7l9-11h-7z" size={size} />;

// --- OTP Page Component ---
export default function OtpVerifyPage() {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter()

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.nextSibling && element.value) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("OTP Submitted:", otp.join(""));
    // Add verification logic here
    router.push('/auth/login'); // Redirect on success
  };

  return (
    <div className="min-h-screen theme-bg-primary font-sans">
      <header className="sticky-header shadow-lg border-b theme-border">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3 group"><div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110"><BoltIcon size={6} /></div><h1 className="text-2xl font-bold theme-text-primary hidden sm:block">TechTorque Auto</h1></Link>
            <div className="flex items-center space-x-4"><ThemeToggle /></div>
          </div>
        </div>
      </header>
      
      <main className="flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 automotive-hero">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 dark:opacity-10"></div>
        <div className="w-full max-w-lg relative z-10">
          <div className="automotive-card p-8 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black theme-text-primary">Enter Verification Code</h2>
              <p className="mt-4 text-lg theme-text-muted">A 6-digit code was sent to your email.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="flex justify-center gap-2 md:gap-4 mb-8">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    name="otp"
                    maxLength={1}
                    className="w-12 h-14 md:w-16 md:h-20 text-center text-2xl md:text-3xl font-bold theme-input"
                    value={data}
                    onChange={e => handleChange(e.target, index)}
                    onFocus={e => e.target.select()}
                    ref={el => {
                      inputRefs.current[index] = el;
                    }}
                    aria-label={`OTP digit ${index + 1}`}
                    title={`Enter digit ${index + 1} of your verification code`}
                  />
                ))}
              </div>
              <div>
                <button type="submit" className="theme-button-primary w-full text-lg font-semibold py-4 rounded-xl">
                  Verify & Proceed
                </button>
              </div>
            </form>
             <div className="text-center pt-8">
                <p className="text-base theme-text-muted">
                  Didn't receive the code?{' '}
                  <button className="theme-link font-semibold">
                    Resend Code
                  </button>
                </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

