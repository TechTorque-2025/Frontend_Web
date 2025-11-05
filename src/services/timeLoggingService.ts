"use client";
import api from '../lib/apiClient';
import type {
  TimeLogRequest,
  TimeLogUpdateRequest,
  TimeLogResponse,
  TimeLogSummaryResponse
} from '../types/timeLogging';

export const timeLoggingService = {
  // Create Time Log
  async createTimeLog(data: TimeLogRequest): Promise<TimeLogResponse> {
    const res = await api.post('/time-logs', data);
    return res.data;
  },

  // Get My Time Logs
  async getMyTimeLogs(params?: {
    from?: string; // YYYY-MM-DD
    to?: string;   // YYYY-MM-DD
  }): Promise<TimeLogResponse[]> {
    const res = await api.get('/time-logs', { params });
    return res.data;
  },

  // Get Time Log by ID
  async getTimeLogById(logId: string): Promise<TimeLogResponse> {
    const res = await api.get(`/time-logs/${logId}`);
    return res.data;
  },

  // Update Time Log
  async updateTimeLog(logId: string, data: TimeLogUpdateRequest): Promise<TimeLogResponse> {
    const res = await api.put(`/time-logs/${logId}`, data);
    return res.data;
  },

  // Delete Time Log
  async deleteTimeLog(logId: string): Promise<void> {
    await api.delete(`/time-logs/${logId}`);
  },

  // Get Summary
  async getSummary(params: {
    period: 'daily' | 'weekly';
    date: string; // YYYY-MM-DD
  }): Promise<TimeLogSummaryResponse> {
    const res = await api.get('/time-logs/summary', { params });
    return res.data;
  },

  // Get Time Logs by Service
  async getTimeLogsByService(serviceId: string): Promise<TimeLogResponse[]> {
    const res = await api.get('/time-logs/service', { 
      params: { serviceId } 
    });
    return res.data;
  },

  // Get Time Logs by Project
  async getTimeLogsByProject(projectId: string): Promise<TimeLogResponse[]> {
    const res = await api.get('/time-logs/project', { 
      params: { projectId } 
    });
    return res.data;
  },
};

export default timeLoggingService;
