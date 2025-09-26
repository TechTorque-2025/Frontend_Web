import Link from "next/link";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen theme-bg-primary">
      {/* Header */}
      <header className="theme-bg-secondary shadow-lg border-b theme-border">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold theme-text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TechTorque Auto Services
                </h1>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
                    CERTIFIED SERVICE
                  </span>
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-semibold">
                    24/7 SUPPORT
                  </span>
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="automotive-hero relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-300/30 text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wider mb-6">
              Automotive Excellence Since 2024
            </span>
          </div>
          
          <h2 className="text-6xl lg:text-7xl font-black theme-text-primary mb-8 leading-tight">
            Revolutionary
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500">
              Auto Service
            </span>
            <span className="block text-4xl lg:text-5xl font-bold theme-text-secondary mt-2">
              Management Platform
            </span>
          </h2>
          
          <p className="text-2xl theme-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Experience the future of automotive care with real-time tracking, AI-powered diagnostics, 
            and seamless appointment management designed for modern vehicle owners.
          </p>
          
          {/* Authentication Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link
              href="/auth/login"
              className="theme-button-primary text-lg font-semibold px-8 py-4 rounded-xl w-full sm:w-auto flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </Link>
            
            <Link
              href="/auth/register"
              className="theme-button-success text-lg font-semibold px-8 py-4 rounded-xl w-full sm:w-auto flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Get Started
            </Link>
          </div>
          
          <Link
            href="/auth/forgot-password"
            className="theme-link text-lg mt-6 inline-block"
          >
            Forgot your password?
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold theme-text-primary text-center mb-16">
            Platform Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="automotive-card p-10 group">
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-2xl font-black theme-text-primary mb-6 text-center">
                Customer Experience Hub
              </h4>
              <p className="theme-text-secondary text-lg leading-relaxed text-center">
                Advanced customer portal with real-time vehicle tracking, instant appointment booking, 
                service history analytics, and personalized maintenance recommendations.
              </p>
            </div>
            
            <div className="automotive-card p-10 group">
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-2xl font-black theme-text-primary mb-6 text-center">
                Technician Workspace
              </h4>
              <p className="theme-text-secondary text-lg leading-relaxed text-center">
                Professional dashboard with diagnostic tools integration, time tracking systems, 
                parts inventory management, and performance analytics for service optimization.
              </p>
            </div>
            
            <div className="automotive-card p-10 group">
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-2xl font-black theme-text-primary mb-6 text-center">
                Smart Notifications
              </h4>
              <p className="theme-text-secondary text-lg leading-relaxed text-center">
                AI-powered notification system with WebSocket technology, predictive maintenance alerts, 
                service reminders, and multi-channel communication preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 theme-bg-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-8">
            <svg className="w-8 h-8 theme-text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-2xl font-bold theme-text-primary">
              Built with Modern Technology
            </h3>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              'Next.js',
              'TypeScript', 
              'Tailwind CSS',
              'WebSocket',
              'Docker',
              'Kubernetes',
              'PostgreSQL',
              'Redis'
            ].map((tech) => (
              <div key={tech} className="tech-stack-item">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t theme-border">
        <div className="max-w-7xl mx-auto text-center">
          <p className="theme-text-muted">
            © 2024 TechTorque Auto Services. Enterprise Application Development Project.
          </p>
        </div>
      </footer>
    </div>
  );
}
