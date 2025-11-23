import React, { Suspense } from "react";
import Link from "next/link";
import ThemeToggle from "../../components/ThemeToggle";
import ResetPasswordForm from "./ResetPasswordForm";

// (removed unused Icon helper)


export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen theme-bg-primary font-sans">
      <header className="sticky-header shadow-lg border-b theme-border">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="automotive-accent w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-lg">TT</span>
              </div>
              <h1 className="text-2xl font-bold theme-text-primary hidden sm:block">
                TechTorque
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="theme-link hidden md:inline-block"
              >
                Back to Sign In
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 automotive-hero">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 dark:opacity-10"></div>
        <div className="w-full max-w-lg relative z-10">
          <div className="automotive-card p-8 md:p-12">
            <Suspense
              fallback={
                <div className="text-center p-8">
                  <p className="theme-text-muted">Loading...</p>
                </div>
              }
            >
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
