'use client'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import userService from '@/services/userService'
import type { UserDto } from '@/types/api'

interface DashboardContextState {
  profile: UserDto | null
  loading: boolean
  roles: string[]
  refreshProfile: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextState | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserDto | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await userService.getCurrentProfile()
      const payload = (response.data?.data as UserDto | undefined) ?? (response.data as UserDto | null)
      setProfile(payload ?? null)
    } catch (error) {
      console.error('Failed to load dashboard profile', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const value = useMemo(() => ({
    profile,
    loading,
    roles: profile?.roles ?? [],
    refreshProfile: loadProfile,
  }), [profile, loading])

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard(): DashboardContextState {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
