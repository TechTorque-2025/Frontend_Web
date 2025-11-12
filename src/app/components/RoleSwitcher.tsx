'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RoleSwitcherProps {
  roles: string[];
  currentRole: string;
  onRoleChange: (role: string) => void;
}

const roleConfig = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    icon: '👑',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    dashboardPath: '/dashboard',
  },
  ADMIN: {
    label: 'Admin',
    icon: '⚙️',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    dashboardPath: '/dashboard',
  },
  EMPLOYEE: {
    label: 'Employee',
    icon: '👷',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    dashboardPath: '/dashboard',
  },
  CUSTOMER: {
    label: 'Customer',
    icon: '👤',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    dashboardPath: '/dashboard',
  },
};

export default function RoleSwitcher({ roles, currentRole, onRoleChange }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Only show switcher if user has multiple roles
  if (!roles || roles.length <= 1) {
    return null;
  }

  // Sort roles by priority
  const sortedRoles = [...roles].sort((a, b) => {
    const priority = { SUPER_ADMIN: 0, ADMIN: 1, EMPLOYEE: 2, CUSTOMER: 3 };
    return (priority[a as keyof typeof priority] ?? 99) - (priority[b as keyof typeof priority] ?? 99);
  });

  const currentConfig = roleConfig[currentRole as keyof typeof roleConfig] || {
    label: currentRole,
    icon: '🔹',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    dashboardPath: '/dashboard',
  };

  const handleRoleSwitch = (role: string) => {
    onRoleChange(role);
    setIsOpen(false);
    // Optionally refresh the page to update the dashboard view
    router.refresh();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current Role Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${currentConfig.bgColor} hover:opacity-80`}
        title="Switch role view"
      >
        <span className="text-lg">{currentConfig.icon}</span>
        <span className={`text-sm font-medium hidden sm:inline ${currentConfig.color}`}>
          {currentConfig.label}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${currentConfig.color}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg theme-bg-primary border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold theme-text-muted uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 mb-2">
              Switch View
            </div>
            {sortedRoles.map((role) => {
              const config = roleConfig[role as keyof typeof roleConfig] || {
                label: role,
                icon: '🔹',
                color: 'text-gray-600',
                bgColor: 'bg-gray-100',
              };
              const isActive = role === currentRole;

              return (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? `${config.bgColor} ${config.color} font-medium`
                      : 'theme-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-lg">{config.icon}</span>
                  <span className="flex-1 text-left">{config.label}</span>
                  {isActive && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2">
            <p className="text-xs theme-text-muted">
              💡 Your current view affects the dashboard and available menu items
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
