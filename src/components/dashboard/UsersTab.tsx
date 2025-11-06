'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/lib/api/admin.service';
import {
  UserDetailsDto,
  UserUpdateFormData,
  UserStatus,
  USER_STATUS_CONFIG,
} from '@/types/admin.types';
import { adminValidation } from '@/lib/utils/admin-validation';
import { UserRole } from '@/types/auth.types';

/**
 * UsersTab Component
 * Admin-only user management
 */
export default function UsersTab() {
  const [users, setUsers] = useState<UserDetailsDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetailsDto | null>(null);

  // Form state
  const [formData, setFormData] = useState<UserUpdateFormData>({
    role: '',
    status: '',
    email: '',
    phoneNumber: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.users.listAllUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserDetailsDto) => {
    setSelectedUser(user);
    setFormData({
      role: user.role,
      status: user.status,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
    });
    setShowEditModal(true);
  };

  const handleViewDetails = (user: UserDetailsDto) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const errors = adminValidation.validateUserUpdate(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      const response = await adminService.users.updateUser(selectedUser.id, formData);
      if (response.success) {
        await fetchUsers();
        setShowEditModal(false);
        setFormErrors({});
      }
    } catch (err) {
      setFormErrors({ submit: 'Failed to update user' });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      setSubmitting(true);
      const response = await adminService.users.deactivateUser(userId);
      if (response.success) {
        await fetchUsers();
      }
    } catch (err) {
      alert('Failed to deactivate user');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="theme-text-secondary">Loading users...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold theme-text-primary">User Management</h2>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 theme-button-secondary"
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="theme-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center theme-text-secondary">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="theme-text-primary font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="theme-text-secondary text-sm">{user.phoneNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap theme-text-secondary">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${USER_STATUS_CONFIG[user.status as UserStatus]?.colorClass || ''}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeactivateUser(user.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        disabled={submitting}
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-card max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold theme-text-primary mb-4">
              Edit User: {selectedUser.firstName} {selectedUser.lastName}
            </h3>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block theme-text-primary mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full theme-input"
                  required
                >
                  <option value="">Select Role</option>
                  <option value={UserRole.CUSTOMER}>Customer</option>
                  <option value={UserRole.EMPLOYEE}>Employee</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                  <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block theme-text-primary mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full theme-input"
                  required
                >
                  <option value="">Select Status</option>
                  <option value={UserStatus.ACTIVE}>Active</option>
                  <option value={UserStatus.INACTIVE}>Inactive</option>
                  <option value={UserStatus.SUSPENDED}>Suspended</option>
                </select>
              </div>

              <div>
                <label className="block theme-text-primary mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full theme-input"
                />
                {formErrors.email && <p className="theme-error">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block theme-text-primary mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="10 digits"
                  className="w-full theme-input"
                />
                {formErrors.phoneNumber && <p className="theme-error">{formErrors.phoneNumber}</p>}
              </div>

              {formErrors.submit && <p className="theme-error">{formErrors.submit}</p>}

              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="flex-1 theme-button-primary">
                  {submitting ? 'Updating...' : 'Update User'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setFormErrors({});
                  }}
                  className="flex-1 theme-button-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-card max-w-lg w-full">
            <h3 className="text-xl font-bold theme-text-primary mb-4">User Details</h3>
            <div className="space-y-3">
              <div>
                <p className="theme-text-secondary text-sm">Name</p>
                <p className="theme-text-primary font-medium">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
              </div>
              <div>
                <p className="theme-text-secondary text-sm">Email</p>
                <p className="theme-text-primary">{selectedUser.email}</p>
              </div>
              <div>
                <p className="theme-text-secondary text-sm">Phone Number</p>
                <p className="theme-text-primary">{selectedUser.phoneNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="theme-text-secondary text-sm">Role</p>
                <p className="theme-text-primary">{selectedUser.role}</p>
              </div>
              <div>
                <p className="theme-text-secondary text-sm">Status</p>
                <p className="theme-text-primary">{selectedUser.status}</p>
              </div>
              <div>
                <p className="theme-text-secondary text-sm">Created At</p>
                <p className="theme-text-primary">
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </p>
              </div>
              {selectedUser.updatedAt && (
                <div>
                  <p className="theme-text-secondary text-sm">Updated At</p>
                  <p className="theme-text-primary">
                    {new Date(selectedUser.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="mt-6 w-full theme-button-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
