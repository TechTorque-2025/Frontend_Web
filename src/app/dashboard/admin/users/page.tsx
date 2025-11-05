'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { UserResponse } from '@/types/admin';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers(
        roleFilter !== 'ALL' ? { role: roleFilter } : undefined
      );
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const roleFilters = ['ALL', 'CUSTOMER', 'EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold theme-text-primary mb-2">User Management</h1>
        <p className="theme-text-muted">Manage system users and their roles</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Total users</p>
          <p className="text-2xl font-semibold theme-text-primary">{users.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Active</p>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
            {users.filter(u => u.enabled).length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Locked</p>
          <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
            {users.filter(u => u.accountLocked).length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Verified</p>
          <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
            {users.filter(u => u.emailVerified).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {roleFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setRoleFilter(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              roleFilter === filter
                ? 'bg-blue-600 text-white'
                : 'theme-bg-secondary theme-text-secondary hover:bg-blue-50 dark:hover:bg-blue-900/30'
            }`}
          >
            {filter.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase">Roles</th>
                <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {users.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold theme-text-primary">{user.fullName || user.username}</p>
                      <p className="text-sm theme-text-muted">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span key={role} className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {user.enabled ? (
                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300">
                          Disabled
                        </span>
                      )}
                      {user.accountLocked && (
                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 ml-1">
                          Locked
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm theme-text-secondary">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-sm theme-text-secondary">
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
