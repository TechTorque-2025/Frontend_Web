'use client';

/**
 * User Profile Page
 * View and edit user profile information
 */

import { useState, FormEvent } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/lib/api/auth.service';
import { ChangePasswordFormData, FormErrors } from '@/types/auth.types';

function ProfileContent() {
  const { user, logout, updateUser } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState<ChangePasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');

  if (!user) {
    return null;
  }

  // Validate password form
  const validatePasswordForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/.test(passwordForm.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, number, and special character';
    }

    if (!passwordForm.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (apiError) {
      setApiError('');
    }
  };

  // Submit password change
  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    if (!validatePasswordForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setSuccessMessage('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });

      // Close the form after a delay
      setTimeout(() => {
        setIsChangingPassword(false);
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError('Failed to change password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen theme-bg-primary">
      {/* Header */}
      <header className="sticky-header shadow-lg border-b theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <a href="/dashboard" className="text-blue-600 hover:text-blue-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </a>
              <div>
                <h1 className="text-xl font-bold theme-text-primary">My Profile</h1>
              </div>
            </div>
            <button
              onClick={logout}
              className="theme-button-secondary text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Information */}
        <div className="automotive-card p-6 mb-6">
          <h2 className="text-2xl font-bold theme-text-primary mb-6">Profile Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text-muted mb-2">Username</label>
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md theme-text-primary">
                {user.username}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium theme-text-muted mb-2">Email</label>
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md theme-text-primary">
                {user.email}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium theme-text-muted mb-2">User ID</label>
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md theme-text-primary">
                #{user.id}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium theme-text-muted mb-2">Roles</label>
              <div className="flex flex-wrap gap-2">
                {user.roles.map(role => (
                  <span
                    key={role}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium theme-text-muted mb-2">Account Status</label>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  user.enabled
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}
              >
                {user.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="automotive-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold theme-text-primary">Security</h2>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="theme-button-primary text-sm"
              >
                Change Password
              </button>
            )}
          </div>

          {isChangingPassword ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-3 rounded">
                  <p className="text-sm">{successMessage}</p>
                </div>
              )}

              {/* Error Message */}
              {apiError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded">
                  <p className="text-sm">{apiError}</p>
                </div>
              )}

              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium theme-text-primary mb-2">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm theme-bg-primary theme-text-primary ${
                    errors.currentPassword ? 'border-red-500' : 'theme-border'
                  }`}
                />
                {errors.currentPassword && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.currentPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium theme-text-primary mb-2">
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm theme-bg-primary theme-text-primary ${
                    errors.newPassword ? 'border-red-500' : 'theme-border'
                  }`}
                />
                {errors.newPassword && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium theme-text-primary mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type="password"
                  value={passwordForm.confirmNewPassword}
                  onChange={handlePasswordChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm theme-bg-primary theme-text-primary ${
                    errors.confirmNewPassword ? 'border-red-500' : 'theme-border'
                  }`}
                />
                {errors.confirmNewPassword && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.confirmNewPassword}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 theme-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmNewPassword: '',
                    });
                    setErrors({});
                    setApiError('');
                  }}
                  className="flex-1 theme-button-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="theme-text-secondary">
              Keep your account secure by using a strong password.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
