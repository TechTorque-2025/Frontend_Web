'use client'
import React, { useEffect, useState } from 'react'
import userService from '../../services/userService'
import Link from 'next/link'
import type { UserDto } from '../../types/api'

export default function DashboardPage() {
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold theme-text-primary mb-4">Dashboard</h1>
        {loading ? (
          <p className="theme-text-muted">Loading profile...</p>
        ) : profile ? (
          <div className="automotive-card p-6">
            <h2 className="text-xl font-semibold">Welcome, {profile.username}</h2>
            <p className="mt-2">Email: {profile.email}</p>
            <p className="mt-2">Roles: {(profile.roles || []).join(', ')}</p>
            <div className="mt-4">
              <Link href="/profile" className="theme-button-secondary">View Profile</Link>
            </div>
          </div>
        ) : (
          <div className="automotive-card p-6">
            <p className="theme-text-muted">No profile found. Try logging in.</p>
            <div className="mt-4"><Link href="/auth/login" className="theme-button-primary">Sign In</Link></div>
          </div>
        )}
      </div>
    </div>
  )
}
