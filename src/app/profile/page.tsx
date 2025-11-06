'use client'
import React, { useEffect, useState } from 'react'
import userService from '../../services/userService'
import authService from '../../services/authService'
import { useRouter } from 'next/navigation'
import type { UserDto } from '../../types/api'

interface UserPreferences {
  notifications?: {
    email?: boolean
    sms?: boolean
    push?: boolean
  }
  language?: string
  reminders?: boolean
  updates?: boolean
  marketing?: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserDto | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [changePasswordMode, setChangePasswordMode] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    photoUrl: '',
  })

  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    loadProfileAndPreferences()
  }, [])

  const loadProfileAndPreferences = async () => {
    try {
      setLoading(true)
      const profileRes = await userService.getCurrentProfile()
      setProfile(profileRes.data)

      // Pre-fill edit form
      setEditFormData({
        fullName: profileRes.data?.fullName || '',
        phone: profileRes.data?.phone || '',
        address: profileRes.data?.address || '',
        photoUrl: profileRes.data?.profilePhoto || '',
      })

      // Load preferences
      try {
        const prefsRes = await userService.getUserPreferences()
        setPreferences(prefsRes.data)
      } catch (err) {
        console.log('Preferences not available')
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePreferencesChange = (field: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const saveProfile = async () => {
    setError(null)
    setSuccess(null)
    setSavingProfile(true)

    try {
      await userService.updateProfile(
        editFormData.fullName,
        editFormData.phone,
        editFormData.address
      )

      if (editFormData.photoUrl) {
        await userService.uploadProfilePhoto(editFormData.photoUrl)
      }

      setSuccess('Profile updated successfully')
      setEditing(false)
      await loadProfileAndPreferences()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const changePassword = async () => {
    setError(null)
    setSuccess(null)

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordFormData.newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    setSavingPassword(true)

    try {
      await userService.changeCurrentUserPassword({
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
      })

      setSuccess('Password changed successfully')
      setChangePasswordMode(false)
      setPasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setSavingPassword(false)
    }
  }

  const savePreferences = async () => {
    setError(null)
    setSuccess(null)
    setSavingPreferences(true)

    try {
      await userService.updateUserPreferences(preferences || {})
      setSuccess('Preferences updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences')
    } finally {
      setSavingPreferences(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 theme-bg-primary flex items-center justify-center">
        <p className="theme-text-muted text-lg">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 theme-bg-primary">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold theme-text-primary">My Profile</h1>
          <div className="flex gap-4">
            {profile?.roles?.some(role => role === 'ADMIN' || role === 'SUPER_ADMIN') && (
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Admin Dashboard
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        {profile ? (
          <div className="space-y-6">
            {/* Profile Overview */}
            <div className="automotive-card p-6">
              <h2 className="text-2xl font-bold theme-text-primary mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm theme-text-muted">Username</p>
                  <p className="text-lg font-semibold theme-text-primary">{profile.username}</p>
                </div>
                <div>
                  <p className="text-sm theme-text-muted">Email</p>
                  <p className="text-lg font-semibold theme-text-primary">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm theme-text-muted">Role</p>
                  <p className="text-lg font-semibold theme-text-primary capitalize">
                    {profile.roles?.join(', ') || 'User'}
                  </p>
                </div>
                <div>
                  <p className="text-sm theme-text-muted">Member Since</p>
                  <p className="text-lg font-semibold theme-text-primary">
                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Details Edit */}
            <div className="automotive-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold theme-text-primary">Personal Information</h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={editFormData.fullName}
                      onChange={handleProfileChange}
                      className="theme-input w-full"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleProfileChange}
                      className="theme-input w-full"
                      placeholder="Your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={editFormData.address}
                      onChange={handleProfileChange}
                      className="theme-input w-full"
                      placeholder="Your address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-2">Profile Photo URL</label>
                    <input
                      type="url"
                      name="photoUrl"
                      value={editFormData.photoUrl}
                      onChange={handleProfileChange}
                      className="theme-input w-full"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={saveProfile}
                      disabled={savingProfile}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {savingProfile ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm theme-text-muted">Full Name</p>
                    <p className="text-lg font-semibold theme-text-primary">{editFormData.fullName || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm theme-text-muted">Phone</p>
                    <p className="text-lg font-semibold theme-text-primary">{editFormData.phone || 'Not set'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm theme-text-muted">Address</p>
                    <p className="text-lg font-semibold theme-text-primary">{editFormData.address || 'Not set'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Change Password */}
            <div className="automotive-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold theme-text-primary">Security</h2>
                {!changePasswordMode && (
                  <button
                    onClick={() => setChangePasswordMode(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Change Password
                  </button>
                )}
              </div>

              {changePasswordMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-2">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordFormData.currentPassword}
                      onChange={handlePasswordChange}
                      className="theme-input w-full"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-2">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordFormData.newPassword}
                      onChange={handlePasswordChange}
                      className="theme-input w-full"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordFormData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="theme-input w-full"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={changePassword}
                      disabled={savingPassword}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {savingPassword ? 'Changing...' : 'Change Password'}
                    </button>
                    <button
                      onClick={() => setChangePasswordMode(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="theme-text-muted">Your password is secure. Click above to change it.</p>
              )}
            </div>

            {/* Preferences */}
            {preferences && (
              <div className="automotive-card p-6">
                <h2 className="text-2xl font-bold theme-text-primary mb-4">Preferences</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-3">Notifications</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences.notifications?.email || false}
                          onChange={(e) =>
                            handlePreferencesChange('notifications', {
                              ...preferences.notifications,
                              email: e.target.checked,
                            })
                          }
                          className="mr-2 w-4 h-4"
                        />
                        <span className="theme-text-secondary">Email Notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences.notifications?.sms || false}
                          onChange={(e) =>
                            handlePreferencesChange('notifications', {
                              ...preferences.notifications,
                              sms: e.target.checked,
                            })
                          }
                          className="mr-2 w-4 h-4"
                        />
                        <span className="theme-text-secondary">SMS Notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences.notifications?.push || false}
                          onChange={(e) =>
                            handlePreferencesChange('notifications', {
                              ...preferences.notifications,
                              push: e.target.checked,
                            })
                          }
                          className="mr-2 w-4 h-4"
                        />
                        <span className="theme-text-secondary">Push Notifications</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-2">Language</label>
                    <select
                      value={preferences.language || 'en'}
                      onChange={(e) => handlePreferencesChange('language', e.target.value)}
                      className="theme-input w-full"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={savePreferences}
                      disabled={savingPreferences}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {savingPreferences ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="automotive-card p-6">
            <p className="theme-text-muted text-center">Unable to load profile. Please try logging in again.</p>
            <button
              onClick={handleLogout}
              className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
