'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { projectService } from '@/services/projectService'
import type { ProjectResponseDto } from '@/types/project'
import { useDashboard } from '@/app/contexts/DashboardContext'

const STATUS_FILTERS = ['ALL', 'REQUESTED', 'QUOTE_PENDING', 'QUOTE_SUBMITTED', 'QUOTE_APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const
type StatusFilter = typeof STATUS_FILTERS[number]

const statusStyles: Record<string, string> = {
  REQUESTED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  QUOTE_PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  QUOTE_SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  QUOTE_APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  IN_PROGRESS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  COMPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

const formatDate = (value?: string) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function ProjectsPage() {
  const { roles } = useDashboard()
  const [projects, setProjects] = useState<ProjectResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  // Check if user is admin or super admin

  const loadProjects = async () => {
    try {
      setRefreshing(true)
      const data = await projectService.listCustomerProjects()
      // Ensure data is always an array
      setProjects(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to load projects'
      setError(message)
      setProjects([]) // Reset to empty array on error
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadProjects()
  }, [])

  const filteredProjects = useMemo(() => {
    if (!Array.isArray(projects)) return []
    if (statusFilter === 'ALL') return projects
    return projects.filter((project) => project.status === statusFilter)
  }, [projects, statusFilter])

  const summary = useMemo(() => {
    if (!Array.isArray(projects)) {
      return { total: 0, pending: 0, active: 0, completed: 0 }
    }
    const pending = projects.filter((p) => ['REQUESTED', 'QUOTE_PENDING', 'QUOTE_SUBMITTED'].includes(p.status)).length
    const active = projects.filter((p) => ['QUOTE_APPROVED', 'IN_PROGRESS'].includes(p.status)).length
    const completed = projects.filter((p) => p.status === 'COMPLETED').length

    return {
      total: projects.length,
      pending,
      active,
      completed,
    }
  }, [projects])

  if (loading) {
    return (
      <div className="automotive-card p-8 text-center">
        <p className="theme-text-muted">Loading projects...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold theme-text-primary">Custom Projects</h1>
          <p className="theme-text-muted">Request and track custom vehicle modification projects.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {roles.includes('CUSTOMER') && (
            <Link href="/dashboard/projects/request" className="theme-button-primary">+ Request Project</Link>
          )}
          <button
            type="button"
            className="theme-button-secondary"
            onClick={() => void loadProjects()}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="automotive-card p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Total projects</p>
          <p className="text-2xl font-semibold theme-text-primary">{summary.total}</p>
        </div>
        <div className="automotive-card p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Pending approval</p>
          <p className="text-2xl font-semibold theme-text-primary">{summary.pending}</p>
        </div>
        <div className="automotive-card p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Active projects</p>
          <p className="text-2xl font-semibold theme-text-primary">{summary.active}</p>
        </div>
        <div className="automotive-card p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Completed</p>
          <p className="text-2xl font-semibold theme-text-primary">{summary.completed}</p>
        </div>
      </div>

      <div className="automotive-card p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'theme-bg-secondary theme-text-secondary hover:bg-blue-50 dark:hover:bg-blue-900/30'
              }`}
            >
              {status === 'ALL' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {filteredProjects.length === 0 ? (
          <div className="py-12 text-center">
            <svg
              className="mx-auto w-24 h-24 text-gray-400 dark:text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-semibold theme-text-primary mb-2">No projects found</h3>
            <p className="theme-text-muted mb-6">
              {projects.length === 0
                ? "You haven't requested any custom projects yet."
                : `No ${statusFilter.toLowerCase().replace('_', ' ')} projects.`}
            </p>
            {projects.length === 0 && roles.includes('CUSTOMER') && (
              <Link href="/dashboard/projects/request" className="theme-button-primary inline-block">
                Request Your First Project
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="block rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
              >
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-lg font-semibold theme-text-primary">{project.projectType}</h2>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[project.status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="theme-text-muted text-sm">Requested {formatDate(project.createdAt)}</p>
                    </div>
                    {project.quotedPrice && (
                      <div className="text-right">
                        <p className="text-sm theme-text-muted">Quoted price</p>
                        <p className="text-xl font-semibold theme-text-primary">LKR {project.quotedPrice.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  <p className="theme-text-secondary text-sm line-clamp-2 mb-3">{project.description}</p>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                    <div>
                      <span className="block text-xs uppercase tracking-wide theme-text-muted">Vehicle</span>
                      <span className="block font-medium theme-text-primary">{project.vehicleId}</span>
                    </div>
                    {project.progressPercentage !== undefined && (
                      <div>
                        <span className="block text-xs uppercase tracking-wide theme-text-muted">Progress</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 transition-all"
                              style={{ width: `${project.progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold theme-text-primary">{project.progressPercentage}%</span>
                        </div>
                      </div>
                    )}
                    {project.desiredCompletionDate && (
                      <div>
                        <span className="block text-xs uppercase tracking-wide theme-text-muted">Target date</span>
                        <span className="block theme-text-primary">{formatDate(project.desiredCompletionDate)}</span>
                      </div>
                    )}
                    {project.completedAt && (
                      <div>
                        <span className="block text-xs uppercase tracking-wide theme-text-muted">Completed</span>
                        <span className="block theme-text-primary">{formatDate(project.completedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
