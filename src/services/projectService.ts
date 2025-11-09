"use client";
import api from '../lib/apiClient';
import type {
  CreateServiceDto,
  ServiceResponseDto,
  CompletionDto,
  NoteDto,
  ProjectRequestDto,
  ProjectResponseDto,
  QuoteDto,
  ProgressUpdateDto,
  PhotoUploadResponse,
  ApiResponse
} from '../types/project';

export const projectService = {
  // ===== STANDARD SERVICES (Appointment-based) =====
  
  async listCustomerServices(status?: string): Promise<ServiceResponseDto[]> {
    const res = await api.get('/services', { params: { status } });
    return res.data;
  },

  async createService(data: CreateServiceDto): Promise<ApiResponse> {
    const res = await api.post('/services', data);
    return res.data;
  },

  async getServiceDetails(serviceId: string): Promise<ServiceResponseDto> {
    const res = await api.get(`/services/${serviceId}`);
    return res.data;
  },

  // Service Notes
  async getServiceNotes(serviceId: string): Promise<NoteDto[]> {
    const res = await api.get(`/services/${serviceId}/notes`);
    return res.data;
  },

  async addServiceNote(serviceId: string, note: NoteDto): Promise<ApiResponse> {
    const res = await api.post(`/services/${serviceId}/notes`, note);
    return res.data;
  },

  // Service Photos
  async getProgressPhotos(serviceId: string): Promise<string[]> {
    const res = await api.get(`/services/${serviceId}/photos`);
    return res.data;
  },

  async uploadProgressPhotos(serviceId: string, files: File[]): Promise<PhotoUploadResponse> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const res = await api.post(`/services/${serviceId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Service Completion
  async markServiceComplete(serviceId: string, data: CompletionDto): Promise<ApiResponse> {
    const res = await api.post(`/services/${serviceId}/complete`, data);
    return res.data;
  },

  // ===== CUSTOM PROJECTS (Modifications) =====
  
  async listCustomerProjects(): Promise<ProjectResponseDto[]> {
    const res = await api.get('/projects');
    return res.data;
  },

  async requestProject(data: ProjectRequestDto): Promise<ApiResponse> {
    const res = await api.post('/projects', data);
    return res.data;
  },

  async getProjectDetails(projectId: string): Promise<ProjectResponseDto> {
    const res = await api.get(`/projects/${projectId}`);
    return res.data;
  },

  async submitQuote(projectId: string, quote: QuoteDto): Promise<ApiResponse> {
    const res = await api.put(`/projects/${projectId}/quote`, quote);
    return res.data;
  },

  async approveQuote(projectId: string): Promise<ApiResponse> {
    const res = await api.post(`/projects/${projectId}/approve`);
    return res.data;
  },

  async rejectQuote(projectId: string, reason?: string): Promise<ApiResponse> {
    const res = await api.post(`/projects/${projectId}/reject`, { reason });
    return res.data;
  },

  async updateProgress(projectId: string, update: ProgressUpdateDto): Promise<ApiResponse> {
    const res = await api.put(`/projects/${projectId}/progress`, update);
    return res.data;
  },

  async completeProject(projectId: string): Promise<ApiResponse> {
    const res = await api.post(`/projects/${projectId}/complete`);
    return res.data;
  },

  // Project Photos
  async getProjectPhotos(projectId: string): Promise<string[]> {
    const res = await api.get(`/projects/${projectId}/photos`);
    return res.data;
  },

  async uploadProjectPhotos(projectId: string, files: File[]): Promise<PhotoUploadResponse> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const res = await api.post(`/projects/${projectId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
};

export default projectService;
