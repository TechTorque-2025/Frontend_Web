/**
 * Project & Service API
 * All endpoints for project and service management
 * Port 8084 - Routes: /api/v1/projects & /api/v1/services
 */

import apiClient from './axios-config';
import {
  ProjectRequestDto,
  QuoteDto,
  ProgressUpdateDto,
  RejectionDto,
  ServiceNoteDto,
  ProjectDto,
  ServiceDto,
  ServicePhotoDto,
  ApiResponse,
} from '@/types/project.types';

// ============================================
// Custom Projects (Modifications) Endpoints
// ============================================

export const projectService = {
  /**
   * GET /api/v1/projects
   * List projects for the current customer
   */
  listCustomerProjects: async (): Promise<ProjectDto[]> => {
    const response = await apiClient.get<ApiResponse<ProjectDto[]>>('/api/v1/projects');
    return response.data.data || [];
  },

  /**
   * GET /api/v1/projects/all
   * List all projects (admin/employee only)
   */
  listAllProjects: async (): Promise<ProjectDto[]> => {
    const response = await apiClient.get<ApiResponse<ProjectDto[]>>('/api/v1/projects/all');
    return response.data.data || [];
  },

  /**
   * GET /api/v1/projects/{projectId}
   * Get details for a specific project
   */
  getProjectDetails: async (projectId: string): Promise<ProjectDto> => {
    const response = await apiClient.get<ApiResponse<ProjectDto>>(`/api/v1/projects/${projectId}`);
    if (!response.data.data) {
      throw new Error('Project not found');
    }
    return response.data.data;
  },

  /**
   * POST /api/v1/projects
   * Request a new modification project (customer only)
   */
  requestModification: async (projectData: ProjectRequestDto): Promise<ProjectDto> => {
    const response = await apiClient.post<ApiResponse<ProjectDto>>('/api/v1/projects', projectData);
    if (!response.data.data) {
      throw new Error('Failed to create project');
    }
    return response.data.data;
  },

  /**
   * PUT /api/v1/projects/{projectId}/quote
   * Submit a quote for a project (employee/admin only)
   */
  submitQuote: async (projectId: string, quoteData: QuoteDto): Promise<ProjectDto> => {
    const response = await apiClient.put<ApiResponse<ProjectDto>>(
      `/api/v1/projects/${projectId}/quote`,
      quoteData
    );
    if (!response.data.data) {
      throw new Error('Failed to submit quote');
    }
    return response.data.data;
  },

  /**
   * POST /api/v1/projects/{projectId}/accept
   * Accept a quote for a project (customer only)
   */
  acceptQuote: async (projectId: string): Promise<ProjectDto> => {
    const response = await apiClient.post<ApiResponse<ProjectDto>>(
      `/api/v1/projects/${projectId}/accept`
    );
    if (!response.data.data) {
      throw new Error('Failed to accept quote');
    }
    return response.data.data;
  },

  /**
   * POST /api/v1/projects/{projectId}/reject
   * Reject a quote for a project (customer only)
   */
  rejectQuote: async (projectId: string, rejectionData: RejectionDto): Promise<ProjectDto> => {
    const response = await apiClient.post<ApiResponse<ProjectDto>>(
      `/api/v1/projects/${projectId}/reject`,
      rejectionData
    );
    if (!response.data.data) {
      throw new Error('Failed to reject quote');
    }
    return response.data.data;
  },

  /**
   * PUT /api/v1/projects/{projectId}/progress
   * Update project progress (employee/admin only)
   */
  updateProgress: async (projectId: string, progressData: ProgressUpdateDto): Promise<ProjectDto> => {
    const response = await apiClient.put<ApiResponse<ProjectDto>>(
      `/api/v1/projects/${projectId}/progress`,
      progressData
    );
    if (!response.data.data) {
      throw new Error('Failed to update progress');
    }
    return response.data.data;
  },
};

// ============================================
// Standard Services Endpoints
// ============================================

export const serviceService = {
  /**
   * GET /api/v1/services
   * List services for the current customer
   */
  listCustomerServices: async (status?: string): Promise<ServiceDto[]> => {
    const response = await apiClient.get<ApiResponse<ServiceDto[]>>('/api/v1/services', {
      params: status ? { status } : undefined,
    });
    return response.data.data || [];
  },

  /**
   * GET /api/v1/services/{serviceId}
   * Get details for a specific service
   */
  getServiceDetails: async (serviceId: string): Promise<ServiceDto> => {
    const response = await apiClient.get<ApiResponse<ServiceDto>>(`/api/v1/services/${serviceId}`);
    if (!response.data.data) {
      throw new Error('Service not found');
    }
    return response.data.data;
  },

  /**
   * PATCH /api/v1/services/{serviceId}
   * Update service status, notes, or completion estimate (employee only)
   */
  updateService: async (serviceId: string, updateData: Record<string, unknown>): Promise<ServiceDto> => {
    const response = await apiClient.patch<Record<string, unknown>>(
      `/api/v1/services/${serviceId}`,
      updateData
    );
    return response as unknown as ServiceDto;
  },

  /**
   * POST /api/v1/services/{serviceId}/complete
   * Mark a service as complete and generate an invoice (employee only)
   */
  markServiceComplete: async (serviceId: string): Promise<Record<string, unknown>> => {
    const response = await apiClient.post<Record<string, unknown>>(
      `/api/v1/services/${serviceId}/complete`
    );
    return response.data;
  },

  /**
   * GET /api/v1/services/{serviceId}/notes
   * Get all notes for a service
   */
  getServiceNotes: async (serviceId: string): Promise<ServiceNoteDto[]> => {
    const response = await apiClient.get<ApiResponse<ServiceNoteDto[]>>(
      `/api/v1/services/${serviceId}/notes`
    );
    return response.data.data || [];
  },

  /**
   * POST /api/v1/services/{serviceId}/notes
   * Add a work note to a service (employee only)
   */
  addServiceNote: async (serviceId: string, noteData: ServiceNoteDto): Promise<ServiceNoteDto> => {
    const response = await apiClient.post<ApiResponse<ServiceNoteDto>>(
      `/api/v1/services/${serviceId}/notes`,
      noteData
    );
    if (!response.data.data) {
      throw new Error('Failed to add note');
    }
    return response.data.data;
  },

  /**
   * GET /api/v1/services/{serviceId}/photos
   * Get all progress photos for a service
   */
  getProgressPhotos: async (serviceId: string): Promise<ServicePhotoDto[]> => {
    const response = await apiClient.get<ApiResponse<ServicePhotoDto[]>>(
      `/api/v1/services/${serviceId}/photos`
    );
    return response.data.data || [];
  },

  /**
   * POST /api/v1/services/{serviceId}/photos
   * Upload progress photos for a service (employee only)
   */
  uploadProgressPhotos: async (serviceId: string, files: File[]): Promise<ServicePhotoDto[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await apiClient.post<ApiResponse<ServicePhotoDto[]>>(
      `/api/v1/services/${serviceId}/photos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data || [];
  },
};
