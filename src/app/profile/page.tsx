'use client'
import React, { useEffect, useState } from 'react'
import userService from '../../services/userService'
import authService from '../../services/authService'
import { useProfilePhotoCache } from '../../lib/useProfilePhotoCache'
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
  const [resendingVerification, setResendingVerification] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const { photo: profilePhoto, uploadPhoto, loading: photoLoading } = useProfilePhotoCache()

  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file
      const validation = userService.validateImageFile(file)
      if (!validation.valid) {
        setError(validation.error || 'Invalid image file')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadProfilePhotoFile = async () => {
    const photoInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = photoInput?.files?.[0]

    if (!file) {
      setError('Please select a photo to upload')
      return
    }

    setUploadingPhoto(true)
    setError(null)
    setSuccess(null)

    try {
      await uploadPhoto(file)
      setSuccess('Profile photo uploaded successfully')
      setPhotoPreview(null)
      // Reset file input
      if (photoInput) {
        photoInput.value = ''
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
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

            {/* Profile Photo Section */}
            <div className="automotive-card p-6">
              <h2 className="text-2xl font-bold theme-text-primary mb-4">Profile Photo</h2>
              <div className="space-y-4">
                {/* Current Photo Display */}
                <div className="flex flex-col items-center gap-4">
                  {photoPreview ? (
                    <>
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <img src={photoPreview} alt="Photo preview" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Preview (not yet uploaded)</p>
                    </>
                  ) : profilePhoto ? (
                    <>
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-500 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <img src={profilePhoto} alt="Current profile photo" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400">Current photo</p>
                    </>
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-400 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-2">Choose Photo</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/tiff"
                      onChange={handlePhotoSelect}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        dark:file:bg-blue-900 dark:file:text-blue-300"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Supported formats: JPEG, PNG, GIF, WebP, BMP, TIFF (Max 5MB)
                    </p>
                  </div>

                  {photoPreview && (
                    <button
                      onClick={uploadProfilePhotoFile}
                      disabled={uploadingPhoto}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                    </button>
                  )}
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

            {/* Email Verification Status */}
            <div className={`automotive-card p-6 border-l-4 ${profile?.emailVerified ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold theme-text-primary mb-2">Email Verification</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {profile?.emailVerified ? (
                        <>
                          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-lg font-semibold text-green-700 dark:text-green-400">Email Verified ✓</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-lg font-semibold text-orange-700 dark:text-orange-400">Email Not Verified</span>
                        </>
                      )}
                    </div>

                    {!profile?.emailVerified && profile?.emailVerificationDeadline && (
                      <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded border border-orange-200 dark:border-orange-700">
                        <p className="text-sm theme-text-secondary mb-2">
                          <strong>Deadline:</strong> Please verify your email by {new Date(profile.emailVerificationDeadline).toLocaleDateString()} to continue using the service.
                        </p>
                        <p className="text-xs theme-text-muted">
                          Time remaining: {Math.ceil((new Date(profile.emailVerificationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>
                    )}

                    {profile?.emailVerified && (
                      <p className="text-sm theme-text-muted">Your email address has been verified. You have full access to all features.</p>
                    )}
                  </div>
                </div>

                {!profile?.emailVerified && (
                  <button
                    onClick={async () => {
                      setResendingVerification(true)
                      setError(null)
                      setSuccess(null)
                      try {
                        await authService.resendVerificationEmail(profile?.email || '')
                        setSuccess('Verification email sent! Please check your inbox.')
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed to resend verification email')
                      } finally {
                        setResendingVerification(false)
                      }
                    }}
                    disabled={resendingVerification}
                    className="ml-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {resendingVerification ? 'Sending...' : 'Resend Email'}
                  </button>
                )}
              </div>
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
