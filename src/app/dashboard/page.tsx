'use client';

/**
 * Dashboard Page
 * Role-based dashboard with conditional tab rendering
 * Tabs shown based on user role: CUSTOMER, EMPLOYEE, ADMIN, SUPER_ADMIN
 */

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth.types';
import VehiclesTab from '@/components/dashboard/VehiclesTab';
import ProfileTab from '@/components/dashboard/ProfileTab';
import AppointmentsTab from '@/components/dashboard/AppointmentsTab';
import ProjectsTab from '@/components/dashboard/ProjectsTab';
import TimeLogsTab from '@/components/dashboard/TimeLogsTab';
import PaymentsTab from '@/components/dashboard/PaymentsTab';
import UsersTab from '@/components/dashboard/UsersTab';
import AnalyticsTab from '@/components/dashboard/AnalyticsTab';
import ReportsTab from '@/components/dashboard/ReportsTab';
import ServicesConfigTab from '@/components/dashboard/ServicesConfigTab';
import Notifications from '@/components/Notifications';
import NotificationHistoryTab from '@/components/dashboard/NotificationHistoryTab';
import ChatbotTab from '@/components/dashboard/ChatbotTab';

// Dashboard tab types
type DashboardTab = 'overview' | 'vehicles' | 'appointments' | 'projects' | 'time-logs' | 'users' | 'analytics' | 'reports' | 'services' | 'payments' | 'notifications' | 'chatbot' | 'profile';

interface TabConfig {
  id: DashboardTab;
  label: string;
  icon: React.ReactElement;
  roles: UserRole[];
  description: string;
}

// Tab configuration - each tab has allowed roles
const TAB_CONFIGS: TabConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    roles: [UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    description: 'Dashboard overview and quick stats'
  },
  {
    id: 'vehicles',
    label: 'My Vehicles',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
      </svg>
    ),
    roles: [UserRole.CUSTOMER],
    description: 'Manage your registered vehicles'
  },
  {
    id: 'appointments',
    label: 'Appointments',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    roles: [UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    description: 'Book and manage service appointments'
  },
  {
    id: 'projects',
    label: 'Custom Projects',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    roles: [UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    description: 'Request and manage custom vehicle modifications'
  },
  {
    id: 'time-logs',
    label: 'Time Logs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    roles: [UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    description: 'Log work hours on projects'
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    roles: [UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    description: 'View invoices and payment history'
  },
  {
    id: 'services',
    label: 'Service Management',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    description: 'Configure service types and pricing'
  },
  {
    id: 'users',
    label: 'User Management',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    description: 'Manage users, roles, and permissions'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    description: 'Business analytics and insights'
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    description: 'Generate business reports'
  },
  {
    id: 'notifications',
    label: 'Notification History',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    roles: [UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    description: 'View notification history and manage notifications'
  },
  {
    id: 'chatbot',
    label: 'AI Assistant',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    roles: [UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    description: 'Chat with AI assistant for appointments and support'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    roles: [UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    description: 'View and manage your profile'
  },
];

function DashboardContent() {
  const { user, logout, hasAnyRole } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Filter tabs based on user roles
  const availableTabs = TAB_CONFIGS.filter(tab =>
    hasAnyRole(tab.roles)
  );

  // Set first available tab as active on mount
  if (availableTabs.length > 0 && !availableTabs.some(tab => tab.id === activeTab)) {
    setActiveTab(availableTabs[0].id);
  }

  return (
    <div className="min-h-screen theme-bg-primary">
      {/* Header */}
      <header className="sticky-header shadow-lg border-b theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold theme-text-primary">TechTorque Dashboard</h1>
                <p className="text-sm theme-text-muted">Welcome, {user?.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {user?.roles[0] || 'USER'}
                </span>
              </div>
              <Notifications />
              <button
                onClick={logout}
                className="theme-button-secondary text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-6 border-b theme-border overflow-x-auto">
          <nav className="flex space-x-1 min-w-max">
            {availableTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent theme-text-muted hover:text-blue-600 dark:hover:text-blue-400 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="automotive-card p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold theme-text-primary mb-4">Dashboard Overview</h2>
              <p className="theme-text-secondary mb-6">
                Welcome to your TechTorque dashboard. Your role: <strong>{user?.roles[0]}</strong>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTabs.slice(1).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="p-4 border theme-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-blue-600 dark:text-blue-400">
                        {tab.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold theme-text-primary">{tab.label}</h3>
                        <p className="text-sm theme-text-muted mt-1">{tab.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vehicles' && <VehiclesTab />}

          {activeTab === 'appointments' && <AppointmentsTab />}

          {activeTab === 'projects' && <ProjectsTab />}

          {activeTab === 'time-logs' && <TimeLogsTab />}

          {activeTab === 'payments' && <PaymentsTab />}

          {activeTab === 'services' && <ServicesConfigTab />}

          {activeTab === 'users' && <UsersTab />}

          {activeTab === 'analytics' && <AnalyticsTab />}

          {activeTab === 'reports' && <ReportsTab />}

          {activeTab === 'notifications' && <NotificationHistoryTab />}

          {activeTab === 'chatbot' && <ChatbotTab />}

          {activeTab === 'profile' && <ProfileTab />}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
