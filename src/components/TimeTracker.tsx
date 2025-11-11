'use client'
import { useEffect, useState } from 'react'
import { appointmentService } from '@/services/appointmentService'
import type { TimeSessionResponse } from '@/types/appointment'

interface TimeTrackerProps {
  appointmentId: string
  onClockIn?: () => void
  onClockOut?: () => void
}

export default function TimeTracker({ appointmentId, onClockIn, onClockOut }: TimeTrackerProps) {
  const [timeSession, setTimeSession] = useState<TimeSessionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Load active time session
  const loadTimeSession = async () => {
    try {
      const session = await appointmentService.getActiveTimeSession(appointmentId)
      setTimeSession(session)
      if (session) {
        setElapsedSeconds(session.elapsedSeconds)
      }
    } catch (err: unknown) {
      console.error('Failed to load time session:', err)
    }
  }

  useEffect(() => {
    loadTimeSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId])

  // Update timer every second if session is active
  useEffect(() => {
    if (!timeSession?.active) return

    const interval = setInterval(async () => {
      try {
        const session = await appointmentService.getActiveTimeSession(appointmentId)
        if (session) {
          setElapsedSeconds(session.elapsedSeconds)
        }
      } catch (err) {
        console.error('Failed to update timer:', err)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [appointmentId, timeSession?.active])

  const handleClockIn = async () => {
    try {
      setLoading(true)
      setError(null)
      const session = await appointmentService.clockIn(appointmentId)
      setTimeSession(session)
      setElapsedSeconds(session.elapsedSeconds)
      onClockIn?.()
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to clock in'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!window.confirm('Clock out and complete work? This will log your time automatically.')) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      const session = await appointmentService.clockOut(appointmentId)
      setTimeSession(session)
      alert(`Work completed! ${session.hoursWorked?.toFixed(2)} hours logged.`)
      onClockOut?.()
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to clock out'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  if (!timeSession || !timeSession.active) {
    return (
      <div>
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <button
          onClick={handleClockIn}
          disabled={loading}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {loading ? 'Starting...' : '⏱️ Clock In & Start Work'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">⏱️ Work in Progress</h3>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-500 text-white animate-pulse">
            ● ACTIVE
          </span>
        </div>
        
        <div className="text-center my-6">
          <div className="text-5xl font-mono font-bold text-blue-900 dark:text-blue-100 tracking-wider">
            {formatTime(elapsedSeconds)}
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">Time Elapsed</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-600 dark:text-blue-400">Started at</p>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              {new Date(timeSession.clockInTime).toLocaleTimeString()}
            </p>
          </div>
          <div>
            <p className="text-blue-600 dark:text-blue-400">Estimated hours</p>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              {(elapsedSeconds / 3600).toFixed(2)} hrs
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleClockOut}
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {loading ? 'Completing...' : '✓ Clock Out & Complete Work'}
      </button>

      <p className="text-xs text-center theme-text-muted">
        Time is automatically logged when you clock out
      </p>
    </div>
  )
}
