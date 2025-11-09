'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import appointmentService from '@/services/appointmentService'
import timeLoggingService from '@/services/timeLoggingService'
import type { ScheduleItemDto, ScheduleResponseDto } from '@/types/appointment'
import type { UserDto } from '@/types/api'
import type { TimeLogResponse } from '@/types/timeLogging'

interface EmployeeDashboardProps {
  profile: UserDto;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ profile }) => {
  const [schedule, setSchedule] = useState<ScheduleResponseDto | null>(null)
  const [timeLogs, setTimeLogs] = useState<TimeLogResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        const today = new Date()
        const date = today.toISOString().slice(0, 10)

        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)

        const [scheduleData, timeLogData] = await Promise.all([
          appointmentService.getEmployeeSchedule(date),
          timeLoggingService.getMyTimeLogs({
            from: startOfWeek.toISOString().slice(0, 10),
            to: endOfWeek.toISOString().slice(0, 10),
          }),
        ])

        setSchedule(scheduleData)
        // Ensure timeLogData is an array and filter out invalid entries
        const validTimeLogs = Array.isArray(timeLogData) 
          ? timeLogData.filter(log => log && log.logId)
          : []
        setTimeLogs(validTimeLogs)
        setError(null)
      } catch (err: unknown) {
        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load employee dashboard data'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const todaysAppointments = useMemo<ScheduleItemDto[]>(() => (
    schedule?.appointments ?? []
  ), [schedule])

  const totalHoursThisWeek = useMemo(() => (
    timeLogs.reduce((sum, log) => sum + (Number(log.hoursWorked) || 0), 0)
  ), [timeLogs])

  const workSummaryByDay = useMemo(() => {
    const summary: Record<string, number> = {}
    timeLogs.forEach((log) => {
      summary[log.workDate] = (summary[log.workDate] || 0) + (Number(log.hoursWorked) || 0)
    })
    return summary
  }, [timeLogs])

  const uniqueServiceCount = useMemo(() => {
    const ids = timeLogs
      .map((log) => log.serviceId)
      .filter((id): id is string => Boolean(id))
    return new Set(ids).size
  }, [timeLogs])

  const uniqueProjectCount = useMemo(() => {
    const ids = timeLogs
      .map((log) => log.projectId)
      .filter((id): id is string => Boolean(id))
    return new Set(ids).size
  }, [timeLogs])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold theme-text-primary mb-2">Employee Dashboard</h1>
        <p className="theme-text-muted">Welcome back, {profile.username}! Ready to provide excellent service today.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">Today&apos;s Schedule</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="theme-text-muted">Appointments Assigned</span>
              <span className="theme-text-primary font-semibold">{todaysAppointments.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Completed this week</span>
              <span className="theme-text-primary font-semibold">{timeLogs.filter((log) => log.description?.toLowerCase().includes('completed')).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Total hours logged (week)</span>
              <span className="theme-text-primary font-semibold">{totalHoursThisWeek.toFixed(1)} hrs</span>
            </div>
          </div>
        </div>

        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">Worklog Summary</h3>
          </div>
          <div className="space-y-3 text-sm">
            {Object.keys(workSummaryByDay).length === 0 ? (
              <p className="theme-text-muted">No work logs recorded this week.</p>
            ) : (
              Object.entries(workSummaryByDay).slice(-4).map(([date, hours]) => (
                <div key={date} className="flex justify-between">
                  <span className="theme-text-muted">{new Date(date).toLocaleDateString()}</span>
                  <span className="theme-text-primary font-semibold">{hours.toFixed(1)} hrs</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">Productivity</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="theme-text-muted">Recent logs</span>
              <span className="theme-text-primary font-semibold">{timeLogs.slice(-5).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Services worked on</span>
              <span className="theme-text-primary font-semibold">{uniqueServiceCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Projects supported</span>
              <span className="theme-text-primary font-semibold">{uniqueProjectCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="automotive-card p-6">
          <h3 className="text-xl font-semibold theme-text-primary mb-4">Today&apos;s Appointments</h3>
          <div className="space-y-4">
            {todaysAppointments.length === 0 ? (
              <p className="theme-text-muted text-sm">No appointments assigned for today.</p>
            ) : (
              todaysAppointments.map((appointment) => (
                <div key={appointment.appointmentId} className="border-b border-gray-200 dark:border-gray-700 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="theme-text-primary font-medium">{appointment.serviceType}</p>
                      <p className="theme-text-muted text-xs">
                        {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {appointment.specialInstructions && (
                        <p className="theme-text-muted text-xs mt-1">{appointment.specialInstructions}</p>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/appointments/${appointment.appointmentId}`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="automotive-card p-6">
          <h3 className="text-xl font-semibold theme-text-primary mb-4">Latest Time Logs</h3>
          <div className="space-y-3">
            {timeLogs.length === 0 ? (
              <p className="theme-text-muted text-sm">You haven&apos;t recorded any time logs yet.</p>
            ) : (
              timeLogs.slice(-5).reverse().map((log, index) => (
                <div key={log.logId || `timelog-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <p className="theme-text-primary text-sm font-medium">
                    {new Date(log.workDate).toLocaleDateString()} • {(Number(log.hoursWorked) || 0).toFixed(1)} hrs
                  </p>
                  {log.description && <p className="theme-text-muted text-xs mt-1">{log.description}</p>}
                </div>
              ))
            )}
          </div>
          <div className="mt-4">
            <Link href="/dashboard/time-logs" className="theme-button-primary text-center block">
              Manage Time Logs
            </Link>
          </div>
        </div>
      </div>

      <div className="automotive-card p-6">
        <h3 className="text-xl font-semibold theme-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/time-logs" className="theme-button-primary text-center">
            Add Time Log
          </Link>
          <Link href="/dashboard/schedule" className="theme-button-primary text-center">
            View Schedule
          </Link>
          <Link href="/dashboard/services" className="theme-button-primary text-center">
            Service Jobs
          </Link>
          <Link href="/profile" className="theme-button-secondary text-center">
            My Profile
          </Link>
        </div>
      </div>

      {loading && (
        <div className="mt-6 automotive-card p-4 text-sm theme-text-muted">Refreshing dashboard data...</div>
      )}
    </div>
  )
}

export default EmployeeDashboard