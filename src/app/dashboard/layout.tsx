'use client'
import Link from 'next/link'
import { useMemo, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import ThemeToggle from '@/app/components/ThemeToggle'
import NotificationBell from '@/app/components/NotificationBell'
import { DashboardProvider, useDashboard } from '@/app/contexts/DashboardContext'
import { authService } from '@/services/authService'

interface NavItem {
  href: string
  label: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  )
}

function DashboardShell({ children }: { children: ReactNode }) {
  const { profile, loading, roles } = useDashboard()
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const navSections = useMemo<NavSection[]>(() => buildNavigation(roles), [roles])
  const handleLogout = () => {
    authService.logout()
    window.location.href = '/auth/login'
  }

  const renderNavItems = (items: NavItem[]) => (
    <ul className="space-y-2">
      {items.map((item) => {
        const active = pathname === item.href
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'theme-button-primary'
                  : 'theme-text-muted hover:theme-text-primary hover:bg-blue-100/50 dark:hover:bg-blue-900/20'
              }`}
              onClick={() => setMobileNavOpen(false)}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="min-h-screen theme-bg-primary">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r border-gray-200 dark:border-gray-800 p-6 space-y-6">
          <Link href="/" className="flex items-center">
            <div className="automotive-accent w-9 h-9 rounded-full mr-3 flex items-center justify-center">
              <span className="text-white font-bold text-sm">TT</span>
            </div>
            <span className="text-xl font-bold theme-text-primary">TechTorque</span>
          </Link>

          <nav className="flex-1 overflow-y-auto space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                <p className="text-xs uppercase tracking-wide theme-text-muted mb-2">{section.title}</p>
                {renderNavItems(section.items)}
              </div>
            ))}
          </nav>

          <div className="mt-auto text-sm theme-text-muted">
            {loading ? 'Loading profile…' : profile ? `Signed in as ${profile.username}` : 'Not signed in'}
          </div>
        </aside>

        {/* Content area */}
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:dark:bg-slate-900/80 border-b border-gray-200 dark:border-gray-800">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="lg:hidden inline-flex items-center justify-center p-2 rounded-md theme-button-secondary"
                    onClick={() => setMobileNavOpen((prev) => !prev)}
                    aria-label="Toggle navigation"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h1 className="text-lg font-semibold theme-text-primary">Dashboard</h1>
                </div>
                <div className="flex items-center gap-3">
                  <NotificationBell />
                  <ThemeToggle />
                  <button
                    onClick={handleLogout}
                    className="theme-button-secondary text-sm px-3 py-2"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile nav drawer */}
            {mobileNavOpen && (
              <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 px-4 pb-4">
                {navSections.map((section) => (
                  <div key={section.title} className="py-3">
                    <p className="text-xs uppercase tracking-wide theme-text-muted mb-2">{section.title}</p>
                    {renderNavItems(section.items)}
                  </div>
                ))}
              </div>
            )}
          </header>

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
            {loading && !profile ? (
              <div className="automotive-card p-6 text-center theme-text-muted">Loading your dashboard...</div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function buildNavigation(roles: string[]): NavSection[] {
  const hasRole = (role: string) => roles?.includes(role)

  const baseSection: NavSection = {
    title: 'Overview',
    items: [
      { href: '/dashboard', label: 'Home' },
      { href: '/dashboard/vehicles', label: 'Vehicles' },
      { href: '/dashboard/appointments', label: 'Appointments' },
      { href: '/dashboard/invoices', label: 'Invoices' },
      { href: '/dashboard/projects', label: 'Projects' },
      { href: '/dashboard/notifications', label: 'Notifications' },
    ],
  }

  // Add Payments link only for customers
  if (hasRole('CUSTOMER')) {
    baseSection.items.push({ href: '/dashboard/payments', label: 'Payment History' })
  }

  const sections: NavSection[] = [baseSection]

  if (hasRole('EMPLOYEE') || hasRole('ADMIN') || hasRole('SUPER_ADMIN')) {
    sections.push({
      title: 'Operations',
      items: [
        { href: '/dashboard/time-logs', label: 'Time Logs' },
        { href: '/dashboard/schedule', label: 'My Schedule' },
        { href: '/dashboard/services', label: 'Service Jobs' },
      ],
    })
  }

  if (hasRole('ADMIN') || hasRole('SUPER_ADMIN')) {
    sections.push({
      title: 'Administration',
      items: [
        { href: '/dashboard/admin', label: 'Admin Overview' },
        { href: '/dashboard/admin/users', label: 'Users' },
        { href: '/dashboard/admin/service-types', label: 'Service Types' },
        { href: '/dashboard/admin/reports', label: 'Reports' },
        { href: '/dashboard/admin/audit-logs', label: 'Audit Logs' },
        { href: '/dashboard/admin/config', label: 'System Config' },
      ],
    })
  }

  return sections
}
