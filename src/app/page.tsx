import Link from "next/link";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen theme-bg-primary">
      {/* Header */}
      <header className="theme-bg-secondary shadow-lg border-b theme-border">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold theme-text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TechTorque Auto Services
              </h1>
              <div className="flex items-center mt-3 text-lg theme-text-muted font-medium">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Advanced Service Management & Appointment System
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-extrabold theme-text-primary mb-6">
            Welcome to the Future of
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500">
              Auto Service Management
            </span>
          </h2>
          <p className="text-xl theme-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
            Streamline your automotive service experience with our cutting-edge platform. 
            Real-time tracking, seamless appointments, and professional service management.
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="theme-card p-8 group">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-2xl font-bold theme-text-primary mb-4 text-center">
                Customer Portal
              </h4>
              <p className="theme-text-secondary text-lg leading-relaxed text-center">
                Track service progress in real-time, book appointments effortlessly, 
                and request custom modifications with our intuitive interface.
              </p>
            </div>
            
            <div className="theme-card p-8 group">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-2xl font-bold theme-text-primary mb-4 text-center">
                Employee Dashboard
              </h4>
              <p className="theme-text-secondary text-lg leading-relaxed text-center">
                Comprehensive time logging, progress tracking, and appointment 
                management tools designed for maximum efficiency.
              </p>
            </div>
            
            <div className="theme-card p-8 group">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-2xl font-bold theme-text-primary mb-4 text-center">
                Real-time Updates
              </h4>
              <p className="theme-text-secondary text-lg leading-relaxed text-center">
                Instant notifications via WebSocket technology. Stay informed 
                about service status changes and important updates.
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
          <div className="flex flex-wrap justify-center gap-4">
            {['Next.js', 'TypeScript', 'Tailwind CSS', 'WebSocket', 'Docker', 'Kubernetes'].map((tech) => (
              <span key={tech} className="glass px-4 py-2 rounded-full theme-text-primary font-medium">
                {tech}
              </span>
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
