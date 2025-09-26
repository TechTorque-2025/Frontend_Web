'use client'

import Link from "next/link";
import React from 'react';
import { useTheme } from './contexts/ThemeContext';

// --- ThemeToggle Component (from ThemeToggle.tsx) ---
function ThemeToggle() {
  // isDark and toggleTheme will be provided by the ThemeProvider in layout.tsx
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="flex items-center justify-center w-6 h-6">
        {isDark ? (
           <svg
            className="w-5 h-5 transition-transform duration-300 hover:rotate-12"
            fill="currentColor"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 transition-transform duration-300 hover:rotate-12"
            fill="currentColor"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
      </div>
    </button>
  );
}


// --- Icon Components for better reusability ---
const Icon = ({ d, className }: { d: string; className?: string }) => (
  <svg
    className={`w-10 h-10 text-white ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

const BoltIcon = () => <Icon d="M13 10V3L4 14h7v7l9-11h-7z" />;
const WrenchIcon = () => <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />;
const ShieldCheckIcon = () => <Icon d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917l9 3 9-3a12.02 12.02 0 00-2.382-9.971z" />;
const ClockIcon = () => <Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />;
const CpuChipIcon = () => <Icon d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.7 9.3l.01-.01M16.3 9.3l.01-.01M7.7 14.7l.01.01M16.3 14.7l.01.01M4 11h16M4 16h16" />;
const CheckCircleIcon = () => <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />;


// --- Main Home Component ---
export default function Home() {
  return (
    <div className="min-h-screen theme-bg-primary font-sans">
      {/* Header */}
      <header className="sticky-header shadow-lg border-b theme-border">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                <BoltIcon />
              </div>
              <h1 className="text-2xl font-bold theme-text-primary hidden sm:block">
                TechTorque Auto
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
               <Link
                href="/auth/login"
                className="theme-link hidden md:inline-block"
              >
                Sign In
              </Link>
               <Link
                href="/auth/register"
                className="theme-button-primary"
              >
                Get Started
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="automotive-hero relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-20 dark:opacity-10"></div>
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="mb-8 animate-fadeInUp">
              <span className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-300/30 theme-text-primary font-semibold text-sm uppercase tracking-wider mb-6">
                Next-Generation Auto Care
              </span>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black theme-text-primary mb-6 leading-tight animate-fadeInUp stagger-1">
              Drive the Future of 
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-600 to-teal-500">
                Vehicle Service
              </span>
            </h2>
            
            <p className="text-xl theme-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed font-medium animate-fadeInUp stagger-2">
              Our platform combines cutting-edge diagnostics, real-time tracking, and seamless appointment management to deliver an unparalleled automotive service experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto animate-fadeInUp stagger-3">
              <Link
                href="/auth/register"
                className="theme-button-primary text-lg font-semibold px-8 py-4 rounded-xl w-full sm:w-auto"
              >
                Join Now
              </Link>
              <Link
                href="#features"
                className="theme-button-secondary text-lg font-semibold px-8 py-4 rounded-xl w-full sm:w-auto"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 theme-bg-secondary">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold theme-text-primary">
                A Smarter Way to Service
              </h3>
              <p className="text-lg theme-text-muted mt-4 max-w-2xl mx-auto">
                Discover the powerful features that make TechTorque the ultimate solution for vehicle owners and service technicians.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="automotive-card p-8 group">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                    <WrenchIcon />
                  </div>
                </div>
                <h4 className="text-2xl font-bold theme-text-primary mb-4 text-center">
                  AI Diagnostics
                </h4>
                <p className="theme-text-secondary text-base leading-relaxed text-center">
                  Leverage AI to predict maintenance needs and diagnose issues with incredible accuracy, saving you time and money.
                </p>
              </div>
              
              <div className="automotive-card p-8 group">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg">
                    <ClockIcon />
                  </div>
                </div>
                <h4 className="text-2xl font-bold theme-text-primary mb-4 text-center">
                  Real-Time Tracking
                </h4>
                <p className="theme-text-secondary text-base leading-relaxed text-center">
                  Monitor your vehicle&apos;s service progress live from our customer portal. No more waiting and wondering.
                </p>
              </div>
              
              <div className="automotive-card p-8 group">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center shadow-lg">
                    <ShieldCheckIcon />
                  </div>
                </div>
                <h4 className="text-2xl font-bold theme-text-primary mb-4 text-center">
                  Verified Service History
                </h4>
                <p className="theme-text-secondary text-base leading-relaxed text-center">
                  Access a complete, tamper-proof digital log of all services and parts, boosting your vehicle&apos;s resale value.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h3 className="text-4xl font-bold theme-text-primary">
                        Simple Steps to Excellence
                    </h3>
                    <p className="text-lg theme-text-muted mt-4">
                        Our streamlined process makes premium auto care effortless.
                    </p>
                </div>
                <div className="relative">
                    {/* The connecting line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border-color transform -translate-x-1/2"></div>

                    <div className="timeline-item">
                        <div className="timeline-icon bg-blue-500">
                           <CheckCircleIcon />
                        </div>
                        <div className="timeline-content">
                            <h4 className="font-bold text-xl mb-2 theme-text-primary">1. Book Instantly</h4>
                            <p className="theme-text-secondary">Schedule your service in seconds through our intuitive online portal or mobile app.</p>
                        </div>
                    </div>

                    <div className="timeline-item">
                        <div className="timeline-icon bg-emerald-500">
                           <CpuChipIcon/>
                        </div>
                        <div className="timeline-content right">
                            <h4 className="font-bold text-xl mb-2 theme-text-primary">2. Smart Diagnosis</h4>
                            <p className="theme-text-secondary">Our technicians use AI-powered tools for a precise and efficient vehicle health check.</p>
                        </div>
                    </div>

                    <div className="timeline-item">
                        <div className="timeline-icon bg-violet-500">
                            <BoltIcon />
                        </div>
                        <div className="timeline-content">
                            <h4 className="font-bold text-xl mb-2 theme-text-primary">3. Expert Service</h4>
                            <p className="theme-text-secondary">Track the progress in real-time as our certified experts get to work on your vehicle.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        {/* Tech Stack Preview */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 theme-bg-secondary">
          <div className="max-w-6xl mx-auto text-center">
            <h3 className="text-3xl font-bold theme-text-primary mb-12">
              Engineered with Leading Technologies
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-6">
              {[
                'Next.js', 'TypeScript', 'Tailwind CSS', 'WebSocket',
                'Docker', 'Kubernetes', 'PostgreSQL', 'Redis'
              ].map((tech) => (
                <div key={tech} className="tech-stack-item-v2">
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t theme-border theme-bg-tertiary">
        <div className="max-w-7xl mx-auto text-center">
           <div className="flex justify-center items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                <BoltIcon />
              </div>
              <h2 className="text-2xl font-bold theme-text-primary">TechTorque Auto</h2>
           </div>
           <div className="flex justify-center gap-6 mb-8">
                <Link href="#" className="theme-link">Home</Link>
                <Link href="#" className="theme-link">Services</Link>
                <Link href="#" className="theme-link">About</Link>
                <Link href="#" className="theme-link">Contact</Link>
           </div>
          <p className="theme-text-muted">
            © 2025 TechTorque Auto Services. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

