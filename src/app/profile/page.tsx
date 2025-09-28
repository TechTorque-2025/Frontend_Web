'use client'
import React, { useEffect, useState } from 'react'
import userService from '../../services/userService'
import type { UserDto } from '../../types/api'

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userService.getCurrentProfile()
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen p-8 theme-bg-primary">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold theme-text-primary mb-4">Profile</h1>
        {loading ? (
          <p className="theme-text-muted">Loading profile...</p>
        ) : profile ? (
          <div className="automotive-card p-6">
            <p><strong>Username:</strong> {profile.username}</p>
            <p className="mt-2"><strong>Email:</strong> {profile.email}</p>
          </div>
        ) : (
          <p className="theme-text-muted">No profile available.</p>
        )}
      </div>
    </div>
  )
}
