/**
 * Notification Management API
 * All endpoints for notification CRUD operations
 * Port 8090 - Routes: /api/v1/notify/*
 */

import apiClient from './axios-config';
import { NotificationRequest, NotificationResponse } from '@/types/notify.types';

// ============================================
// Notification Management Service
// ============================================

export const notifyService = {
  /**
   * POST /api/v1/notify
   * Create and send a notification to a user
   */
  createNotification: async (
    data: NotificationRequest
  ): Promise<NotificationResponse> => {
    const response = await apiClient.post<NotificationResponse>('/api/v1/notify', data);
    return response.data;
  },

  /**
   * GET /api/v1/notify/user/{userId}
   * Get all notifications for a specific user
   */
  getUserNotifications: async (userId: string): Promise<NotificationResponse[]> => {
    const response = await apiClient.get<NotificationResponse[]>(
      `/api/v1/notify/user/${userId}`
    );
    return response.data;
  },

  /**
   * GET /api/v1/notify/user/{userId}/unread
   * Get all unread notifications for a user
   */
  getUnreadNotifications: async (userId: string): Promise<NotificationResponse[]> => {
    const response = await apiClient.get<NotificationResponse[]>(
      `/api/v1/notify/user/${userId}/unread`
    );
    return response.data;
  },

  /**
   * GET /api/v1/notify/user/{userId}/unread/count
   * Get count of unread notifications
   */
  getUnreadCount: async (userId: string): Promise<Record<string, number>> => {
    const response = await apiClient.get<Record<string, number>>(
      `/api/v1/notify/user/${userId}/unread/count`
    );
    return response.data;
  },

  /**
   * PUT /api/v1/notify/{notificationId}/read
   * Mark a specific notification as read
   */
  markAsRead: async (notificationId: number): Promise<Record<string, string>> => {
    const response = await apiClient.put<Record<string, string>>(
      `/api/v1/notify/${notificationId}/read`
    );
    return response.data;
  },

  /**
   * PUT /api/v1/notify/user/{userId}/read-all
   * Mark all notifications as read for a user
   */
  markAllAsRead: async (userId: string): Promise<Record<string, string>> => {
    const response = await apiClient.put<Record<string, string>>(
      `/api/v1/notify/user/${userId}/read-all`
    );
    return response.data;
  },

  /**
   * DELETE /api/v1/notify/{notificationId}
   * Delete a specific notification
   */
  deleteNotification: async (notificationId: number): Promise<Record<string, string>> => {
    const response = await apiClient.delete<Record<string, string>>(
      `/api/v1/notify/${notificationId}`
    );
    return response.data;
  },

  /**
   * GET /api/v1/notify/health
   * Health check endpoint
   */
  healthCheck: async (): Promise<Record<string, string>> => {
    const response = await apiClient.get<Record<string, string>>('/api/v1/notify/health');
    return response.data;
  },
};
