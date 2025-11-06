'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { projectService } from '@/lib/api/project.service';
import {
  ProjectDto,
  ProjectStatus,
  ProjectFormData,
  QuoteFormData,
  ProgressFormData,
  RejectionDto,
  PROJECT_STATUS_CONFIG,
} from '@/types/project.types';
import {
  validateProjectForm,
  validateQuoteForm,
  validateProgressForm,
  formatCurrency,
} from '@/lib/utils/project-validation';
import { vehicleService } from '@/lib/api/vehicle.service';
import { VehicleDto } from '@/types/vehicle.types';

export default function ProjectsTab() {
  const { user, hasAnyRole } = useAuth();
  const isEmployee = hasAnyRole(['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN']);

  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectDto | null>(null);

  // Modal states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Form states
  const [projectForm, setProjectForm] = useState<ProjectFormData>({
    vehicleId: '',
    description: '',
    budget: '',
  });
  const [quoteForm, setQuoteForm] = useState<QuoteFormData>({
    quoteAmount: '',
    notes: '',
  });
  const [progressForm, setProgressForm] = useState<ProgressFormData>({
    progress: '',
    notes: '',
  });
  const [rejectionReason, setRejectionReason] = useState('');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load projects and vehicles
  useEffect(() => {
    loadData();
  }, [isEmployee]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [projectsData, vehiclesData] = await Promise.all([
        isEmployee ? projectService.listAllProjects() : projectService.listCustomerProjects(),
        vehicleService.listCustomerVehicles(),
      ]);

      setProjects(projectsData);
      setVehicles(vehiclesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  // Request new modification
  const handleRequestProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateProjectForm(projectForm);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      setIsSubmitting(true);
      await projectService.requestModification({
        vehicleId: projectForm.vehicleId,
        description: projectForm.description,
        budget: projectForm.budget ? parseFloat(projectForm.budget) : undefined,
      });

      setShowRequestModal(false);
      setProjectForm({ vehicleId: '', description: '', budget: '' });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request project');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit quote (employee only)
  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    const errors = validateQuoteForm(quoteForm);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      setIsSubmitting(true);
      await projectService.submitQuote(selectedProject.projectId, {
        quoteAmount: parseFloat(quoteForm.quoteAmount),
        notes: quoteForm.notes || undefined,
      });

      setShowQuoteModal(false);
      setQuoteForm({ quoteAmount: '', notes: '' });
      setSelectedProject(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quote');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Accept quote (customer only)
  const handleAcceptQuote = async (projectId: string) => {
    try {
      setIsSubmitting(true);
      await projectService.acceptQuote(projectId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept quote');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reject quote (customer only)
  const handleRejectQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      setIsSubmitting(true);
      await projectService.rejectQuote(selectedProject.projectId, {
        reason: rejectionReason || undefined,
      });

      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedProject(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject quote');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update progress (employee only)
  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    const errors = validateProgressForm(progressForm);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      setIsSubmitting(true);
      await projectService.updateProgress(selectedProject.projectId, {
        progress: parseInt(progressForm.progress, 10),
        notes: progressForm.notes || undefined,
      });

      setShowProgressModal(false);
      setProgressForm({ progress: '', notes: '' });
      setSelectedProject(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open modals
  const openQuoteModal = (project: ProjectDto) => {
    setSelectedProject(project);
    setShowQuoteModal(true);
  };

  const openProgressModal = (project: ProjectDto) => {
    setSelectedProject(project);
    setProgressForm({
      progress: project.progress.toString(),
      notes: '',
    });
    setShowProgressModal(true);
  };

  const openRejectModal = (project: ProjectDto) => {
    setSelectedProject(project);
    setShowRejectModal(true);
  };

  const openDetailsModal = (project: ProjectDto) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  // Get vehicle display name
  const getVehicleName = (vehicleId: string): string => {
    const vehicle = vehicles.find(v => v.vehicleId === vehicleId);
    return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEmployee ? 'All Custom Projects' : 'My Custom Projects'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Request custom vehicle modifications and track progress
          </p>
        </div>
        {!isEmployee && (
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Request Modification
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Projects list */}
      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">
            {isEmployee ? 'No projects available' : 'No custom projects yet. Request your first modification!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div
              key={project.projectId}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {getVehicleName(project.vehicleId)}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        PROJECT_STATUS_CONFIG[project.status].bgClass
                      } ${PROJECT_STATUS_CONFIG[project.status].textClass}`}
                    >
                      {PROJECT_STATUS_CONFIG[project.status].label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <span>Budget: {formatCurrency(project.budget)}</span>
                    <span>Quote: {formatCurrency(project.quoteAmount)}</span>
                    <span>Progress: {project.progress}%</span>
                    <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => openDetailsModal(project)}
                    className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                  >
                    Details
                  </button>

                  {/* Customer actions */}
                  {!isEmployee && project.status === ProjectStatus.QUOTED && (
                    <>
                      <button
                        onClick={() => handleAcceptQuote(project.projectId)}
                        disabled={isSubmitting}
                        className="px-3 py-1 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => openRejectModal(project)}
                        disabled={isSubmitting}
                        className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {/* Employee actions */}
                  {isEmployee && project.status === ProjectStatus.REQUESTED && (
                    <button
                      onClick={() => openQuoteModal(project)}
                      className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    >
                      Submit Quote
                    </button>
                  )}
                  {isEmployee && project.status === ProjectStatus.ACCEPTED && (
                    <button
                      onClick={() => openProgressModal(project)}
                      className="px-3 py-1 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors"
                    >
                      Update Progress
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar for accepted projects */}
              {project.status === ProjectStatus.ACCEPTED && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Request Project Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Request Custom Modification
            </h3>
            <form onSubmit={handleRequestProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vehicle *
                </label>
                <select
                  value={projectForm.vehicleId}
                  onChange={(e) => setProjectForm({ ...projectForm, vehicleId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </option>
                  ))}
                </select>
                {formErrors.vehicleId && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.vehicleId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description * (10-2000 characters)
                </label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe the modifications you want..."
                />
                {formErrors.description && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Budget (optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={projectForm.budget}
                  onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
                {formErrors.budget && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.budget}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(false);
                    setProjectForm({ vehicleId: '', description: '', budget: '' });
                    setFormErrors({});
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Quote Modal */}
      {showQuoteModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Submit Quote
            </h3>
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getVehicleName(selectedProject.vehicleId)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                {selectedProject.description}
              </p>
            </div>
            <form onSubmit={handleSubmitQuote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quote Amount * ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={quoteForm.quoteAmount}
                  onChange={(e) => setQuoteForm({ ...quoteForm, quoteAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
                {formErrors.quoteAmount && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.quoteAmount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={quoteForm.notes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Additional details about the quote..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuoteModal(false);
                    setQuoteForm({ quoteAmount: '', notes: '' });
                    setSelectedProject(null);
                    setFormErrors({});
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Progress Modal */}
      {showProgressModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Update Progress
            </h3>
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getVehicleName(selectedProject.vehicleId)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Current: {selectedProject.progress}%
              </p>
            </div>
            <form onSubmit={handleUpdateProgress} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Progress * (0-100%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progressForm.progress}
                  onChange={(e) => setProgressForm({ ...progressForm, progress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {formErrors.progress && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.progress}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={progressForm.notes}
                  onChange={(e) => setProgressForm({ ...progressForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Progress update details..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProgressModal(false);
                    setProgressForm({ progress: '', notes: '' });
                    setSelectedProject(null);
                    setFormErrors({});
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Progress'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Quote Modal */}
      {showRejectModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Reject Quote
            </h3>
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quote: {formatCurrency(selectedProject.quoteAmount)}
              </p>
            </div>
            <form onSubmit={handleRejectQuote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason (optional, max 500 characters)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Why are you rejecting this quote?"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedProject(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Rejecting...' : 'Reject Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Project Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle</label>
                <p className="text-gray-900 dark:text-white">{getVehicleName(selectedProject.vehicleId)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <p>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      PROJECT_STATUS_CONFIG[selectedProject.status].bgClass
                    } ${PROJECT_STATUS_CONFIG[selectedProject.status].textClass}`}
                  >
                    {PROJECT_STATUS_CONFIG[selectedProject.status].label}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedProject.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Budget</label>
                  <p className="text-gray-900 dark:text-white">{formatCurrency(selectedProject.budget)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quote Amount</label>
                  <p className="text-gray-900 dark:text-white">{formatCurrency(selectedProject.quoteAmount)}</p>
                </div>
              </div>

              {selectedProject.quoteNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quote Notes</label>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedProject.quoteNotes}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</label>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-900 dark:text-white">{selectedProject.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${selectedProject.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {selectedProject.progressNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress Notes</label>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedProject.progressNotes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedProject.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedProject.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedProject.estimatedCompletionDate && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Completion</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedProject.estimatedCompletionDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedProject(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
