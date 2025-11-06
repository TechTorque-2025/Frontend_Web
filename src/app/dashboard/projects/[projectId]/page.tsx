'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { projectService } from '@/services/projectService';
import { ProjectResponseDto, ProjectStatus } from '@/types/project';
import { useDashboard } from '@/app/contexts/DashboardContext';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useDashboard();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<ProjectResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjectDetails(projectId);
      setProject(data);
    } catch (err) {
      console.error('Failed to load project:', err);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleApproveQuote = async () => {
    if (!project || !confirm('Are you sure you want to approve this quote?')) return;

    try {
      setActionLoading(true);
      await projectService.approveQuote(projectId);
      await loadProject();
    } catch (err) {
      console.error('Failed to approve quote:', err);
      alert(err instanceof Error ? err.message : 'Failed to approve quote');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectQuote = async () => {
    if (!project || !confirm('Are you sure you want to reject this quote?')) return;

    try {
      setActionLoading(true);
      await projectService.rejectQuote(projectId);
      await loadProject();
    } catch (err) {
      console.error('Failed to reject quote:', err);
      alert(err instanceof Error ? err.message : 'Failed to reject quote');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString()}`;
  };

  const statusStyles: Record<ProjectStatus, string> = {
    REQUESTED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    QUOTE_PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    QUOTE_SUBMITTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    QUOTE_APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    COMPLETED: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-8 text-center">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">Error Loading Project</h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error || 'Project not found'}</p>
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const isCustomer = profile?.roles?.includes('CUSTOMER');
  const canApproveQuote = isCustomer && project.status === 'QUOTE_SUBMITTED';

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 theme-text-muted hover:theme-text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold theme-text-primary mb-2">{project.projectType}</h1>
            <p className="theme-text-muted">Project ID: {project.id}</p>
          </div>
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${statusStyles[project.status]}`}>
            {project.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Quote Actions (for customers) */}
      {canApproveQuote && (
        <div className="mb-6 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold theme-text-primary mb-1">Quote Ready for Review</h3>
              <p className="theme-text-secondary text-sm mb-4">
                A quote has been submitted for your project. Please review the details below and approve or reject.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleApproveQuote}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : 'Approve Quote'}
                </button>
                <button
                  onClick={handleRejectQuote}
                  disabled={actionLoading}
                  className="px-6 py-2.5 border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {/* Project Overview */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
          <h2 className="text-xl font-semibold theme-text-primary mb-4">Project Overview</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold theme-text-muted mb-1">Description</label>
              <p className="theme-text-primary">{project.description}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold theme-text-muted mb-1">Vehicle ID</label>
                <p className="theme-text-primary">{project.vehicleId}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold theme-text-muted mb-1">Requested Date</label>
                <p className="theme-text-primary">{formatDate(project.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
          <h2 className="text-xl font-semibold theme-text-primary mb-4">Financial Details</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {project.budget && (
              <div>
                <label className="block text-sm font-semibold theme-text-muted mb-1">Customer Budget</label>
                <p className="text-2xl font-bold theme-text-primary">{formatCurrency(project.budget)}</p>
              </div>
            )}
            {project.quotedPrice && (
              <div>
                <label className="block text-sm font-semibold theme-text-muted mb-1">Quoted Price</label>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(project.quotedPrice)}</p>
              </div>
            )}
            {project.actualCost && (
              <div>
                <label className="block text-sm font-semibold theme-text-muted mb-1">Actual Cost</label>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(project.actualCost)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quote Details */}
        {(project.quoteNotes || project.quoteSubmittedAt) && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
            <h2 className="text-xl font-semibold theme-text-primary mb-4">Quote Details</h2>
            {project.quoteNotes && (
              <div className="mb-4">
                <label className="block text-sm font-semibold theme-text-muted mb-1">Notes</label>
                <p className="theme-text-primary whitespace-pre-wrap">{project.quoteNotes}</p>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              {project.quoteSubmittedAt && (
                <div>
                  <label className="block text-sm font-semibold theme-text-muted mb-1">Quote Submitted</label>
                  <p className="theme-text-primary">{formatDate(project.quoteSubmittedAt)}</p>
                </div>
              )}
              {project.quoteApprovedAt && (
                <div>
                  <label className="block text-sm font-semibold theme-text-muted mb-1">Quote Approved</label>
                  <p className="theme-text-primary">{formatDate(project.quoteApprovedAt)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
          <h2 className="text-xl font-semibold theme-text-primary mb-4">Timeline</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {project.desiredCompletionDate && (
                <div>
                  <label className="block text-sm font-semibold theme-text-muted mb-1">Desired Completion</label>
                  <p className="theme-text-primary">{formatDate(project.desiredCompletionDate)}</p>
                </div>
              )}
              {project.startedAt && (
                <div>
                  <label className="block text-sm font-semibold theme-text-muted mb-1">Started</label>
                  <p className="theme-text-primary">{formatDate(project.startedAt)}</p>
                </div>
              )}
              {project.completedAt && (
                <div>
                  <label className="block text-sm font-semibold theme-text-muted mb-1">Completed</label>
                  <p className="theme-text-primary">{formatDate(project.completedAt)}</p>
                </div>
              )}
            </div>
            {project.progressPercentage !== undefined && project.status === 'IN_PROGRESS' && (
              <div>
                <label className="block text-sm font-semibold theme-text-muted mb-2">Progress</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                      style={{ width: `${project.progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-xl font-bold theme-text-primary">{project.progressPercentage}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
