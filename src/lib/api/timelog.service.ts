/**
 * Time Logging API
 * All endpoints for employee work time tracking
 * Port 8085 - Routes: /api/v1/time-logs
 */

import apiClient from './axios-config';
import {
  TimeLogRequestDto,
  TimeLogUpdateDto,
  TimeLogDto,
  TimeLogSummaryDto,
  ApiResponse,
  SummaryPeriod,
} from '@/types/timelog.types';

// ============================================
// Time Logging Endpoints
// ============================================

export const timeLogService = {
  /**
   * POST /api/v1/time-logs
   * Log work time for a service or project (employee only)
   */
  logWorkTime: async (logData: TimeLogRequestDto): Promise<TimeLogDto> => {
    const response = await apiClient.post<ApiResponse<TimeLogDto>>('/api/v1/time-logs', logData);
    if (!response.data.data) {
      throw new Error('Failed to log work time');
    }
    return response.data.data;
  },

  /**
   * GET /api/v1/time-logs
   * Get an employee's time logs for a given period
   */
  getMyLogs: async (fromDate?: string, toDate?: string): Promise<TimeLogDto[]> => {
    const response = await apiClient.get<ApiResponse<TimeLogDto[]>>('/api/v1/time-logs', {
      params: {
        fromDate,
        toDate,
      },
    });
    return response.data.data || [];
  },

  /**
   * GET /api/v1/time-logs/{logId}
   * Get details for a specific time log entry
   */
  getLogDetails: async (logId: string): Promise<TimeLogDto> => {
    const response = await apiClient.get<ApiResponse<TimeLogDto>>(`/api/v1/time-logs/${logId}`);
    if (!response.data.data) {
      throw new Error('Time log not found');
    }
    return response.data.data;
  },

  /**
   * PUT /api/v1/time-logs/{logId}
   * Update a time log entry (employee can only update their own)
   */
  updateLog: async (logId: string, updateData: TimeLogUpdateDto): Promise<TimeLogDto> => {
    const response = await apiClient.put<ApiResponse<TimeLogDto>>(
      `/api/v1/time-logs/${logId}`,
      updateData
    );
    if (!response.data.data) {
      throw new Error('Failed to update time log');
    }
    return response.data.data;
  },

  /**
   * DELETE /api/v1/time-logs/{logId}
   * Delete a time log entry (employee can only delete their own)
   */
  deleteLog: async (logId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/time-logs/${logId}`);
  },

  /**
   * GET /api/v1/time-logs/summary
   * Get a daily or weekly summary of work logged (employee only)
   */
  getSummary: async (period: SummaryPeriod, date: string): Promise<TimeLogSummaryDto> => {
    const response = await apiClient.get<ApiResponse<TimeLogSummaryDto>>('/api/v1/time-logs/summary', {
      params: {
        period,
        date,
      },
    });
    if (!response.data.data) {
      throw new Error('Failed to fetch summary');
    }
    return response.data.data;
  },

  /**
   * GET /api/v1/time-logs/service/{serviceId}
   * Get all time logs for a specific service (for internal/customer/employee use)
   */
  getLogsForService: async (serviceId: string): Promise<TimeLogDto[]> => {
    const response = await apiClient.get<ApiResponse<TimeLogDto[]>>(
      `/api/v1/time-logs/service/${serviceId}`
    );
    return response.data.data || [];
  },
};
