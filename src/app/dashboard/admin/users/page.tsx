'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { authService } from '@/services/authService';
import { UserResponse } from '@/types/admin';
import { CreateEmployeeRequest, CreateAdminRequest } from '@/types/api';
import { useDashboard } from '@/app/contexts/DashboardContext';

export default function AdminUsersPage() {
  const { roles: currentUserRoles } = useDashboard();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUserType, setCreateUserType] = useState<'employee' | 'admin'>('employee');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRoles, setEditingRoles] = useState<string[]>([]);

  // Check current user permissions
  const isSuperAdmin = currentUserRoles.includes('SUPER_ADMIN');
  const isAdmin = currentUserRoles.includes('ADMIN') || isSuperAdmin;

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

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      if (createUserType === 'employee') {
        const payload: CreateEmployeeRequest = {
          username: formData.get('username') as string,
          email: formData.get('email') as string,
          password: formData.get('password') as string,
          firstName: formData.get('firstName') as string,
          lastName: formData.get('lastName') as string,
          department: formData.get('department') as string,
        };
        await authService.createEmployee(payload);
      } else {
        const payload: CreateAdminRequest = {
          username: formData.get('username') as string,
          email: formData.get('email') as string,
          password: formData.get('password') as string,
          firstName: formData.get('firstName') as string,
          lastName: formData.get('lastName') as string,
        };
        await authService.createAdmin(payload);
      }

      setShowCreateModal(false);
      await loadUsers();
      alert(`${createUserType === 'employee' ? 'Employee' : 'Admin'} created successfully!`);
    } catch (err) {
      console.error('Failed to create user:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      const errorMessage = error?.response?.status === 403
        ? 'Permission denied. You do not have the required permissions to create this user type.'
        : error?.response?.data?.message || 'Failed to create user. Please try again.';
      alert(errorMessage);
    }
  };

  const handleStartEditRoles = (user: UserResponse) => {
    setEditingUserId(user.userId);
    setEditingRoles(user.roles || []);
  };

  const handleCancelEditRoles = () => {
    setEditingUserId(null);
    setEditingRoles([]);
  };

  const handleSaveRoles = async (userId: string) => {
    try {
      // Validation: Ensure at least one role is selected
      if (editingRoles.length === 0) {
        alert('Please select at least one role for the user.');
        return;
      }

      await adminService.updateUser(userId, { roles: editingRoles });
      setEditingUserId(null);
      setEditingRoles([]);
      await loadUsers();
      alert('Roles updated successfully!');
    } catch (err) {
      console.error('Failed to update roles:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update roles. Please try again.';
      alert(errorMessage);
    }
  };

  const handleToggleRole = (role: string) => {
    if (editingRoles.includes(role)) {
      // Prevent removing the last role
      if (editingRoles.length === 1) {
        alert('A user must have at least one role.');
        return;
      }
      setEditingRoles(editingRoles.filter(r => r !== role));
    } else {
      setEditingRoles([...editingRoles, role]);
    }
  };

  // Check if a role can be modified
  const isRoleProtected = (role: string): boolean => {
    return role === 'CUSTOMER' || role === 'SUPER_ADMIN';
  };

  // Check if user can be edited (not customer)
  const canEditUser = (user: UserResponse): boolean => {
    const isCustomer = user.roles.includes('CUSTOMER');
    return !isCustomer;
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

  // Block access for customers and employees
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-8 text-center">
          <svg
            className="mx-auto w-16 h-16 text-red-600 dark:text-red-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">Access Denied</h2>
          <p className="text-red-700 dark:text-red-300">
            This page is only accessible to admins and super admins.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold theme-text-primary mb-2">User Management</h1>
          <p className="theme-text-muted">Manage system users and their roles</p>
        </div>
        <div className="flex gap-2">
          {/* Regular ADMIN can create employees */}
          {isAdmin && (
            <button
              onClick={() => {
                setCreateUserType('employee');
                setShowCreateModal(true);
              }}
              className="theme-button-primary"
            >
              + Add Employee
            </button>
          )}
          {/* Only SUPER_ADMIN can create other admins */}
          {isSuperAdmin && (
            <button
              onClick={() => {
                setCreateUserType('admin');
                setShowCreateModal(true);
              }}
              className="theme-button-primary bg-purple-600 hover:bg-purple-700"
            >
              + Add Admin
            </button>
          )}
        </div>
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
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase">Actions</th>}
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
                    {editingUserId === user.userId ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {/* Editable roles */}
                          {['EMPLOYEE', 'ADMIN'].map((role) => (
                            <button
                              key={role}
                              onClick={() => handleToggleRole(role)}
                              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                                editingRoles.includes(role)
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                              }`}
                              title={`Click to ${editingRoles.includes(role) ? 'remove' : 'add'} ${role} role`}
                            >
                              {role}
                            </button>
                          ))}
                          
                          {/* Show protected roles (read-only) */}
                          {user.roles.filter(role => isRoleProtected(role)).map((role) => (
                            <span
                              key={role}
                              className="px-3 py-1 rounded text-xs font-semibold bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed opacity-75"
                              title={`${role} role cannot be modified`}
                            >
                              {role} 🔒
                            </span>
                          ))}
                        </div>
                        <p className="text-xs theme-text-muted mt-2">
                          💡 <strong>Tip:</strong> Select multiple roles to give users combined access. 
                          {editingRoles.length > 1 && (
                            <span className="text-blue-600 dark:text-blue-400"> Currently selected: {editingRoles.length} roles</span>
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(user.roles) && user.roles.length > 0 ? (
                          user.roles.map((role) => {
                            const isProtected = isRoleProtected(role);
                            return (
                              <span
                                key={role}
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  isProtected
                                    ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                }`}
                                title={isProtected ? 'Protected role' : ''}
                              >
                                {role} {isProtected && '🔒'}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-xs theme-text-muted">No roles</span>
                        )}
                      </div>
                    )}
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
                  {isAdmin && (
                    <td className="px-6 py-4">
                      {canEditUser(user) ? (
                        editingUserId === user.userId ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveRoles(user.userId)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEditRoles}
                              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEditRoles(user)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                          >
                            Edit Roles
                          </button>
                        )
                      ) : (
                        <span className="text-xs theme-text-muted italic">Customer (Read-only)</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold theme-text-primary mb-4">
              Create {createUserType === 'employee' ? 'Employee' : 'Admin'}
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg theme-bg-primary theme-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg theme-bg-primary theme-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg theme-bg-primary theme-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg theme-bg-primary theme-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg theme-bg-primary theme-text-primary"
                />
              </div>
              {createUserType === 'employee' && (
                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg theme-bg-primary theme-text-primary"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 theme-button-primary"
                >
                  Create {createUserType === 'employee' ? 'Employee' : 'Admin'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 theme-button-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
