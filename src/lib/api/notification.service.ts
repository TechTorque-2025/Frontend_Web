/**
 * Notification Service API
 * All endpoints for sending notifications
 * Port 8089 - Routes: /api/v1/notifications/*
 *
 * Note: These endpoints are typically used by backend services
 * to send notifications to users via WebSocket.
 * Frontend primarily receives notifications via WebSocket connection.
 */

import apiClient from './axios-config';
import { UpdateMessage } from '@/types/notification.types';

// ============================================
// Notification Service
// ============================================

export const notificationService = {
  /**
   * POST /api/v1/notifications/appointment
   * Send appointment update notification
   */
  sendAppointmentUpdate: async (message: UpdateMessage): Promise<Record<string, unknown>> => {
    const response = await apiClient.post<Record<string, unknown>>(
      '/api/v1/notifications/appointment',
      message
    );
    return response.data;
  },

  /**
   * POST /api/v1/notifications/project
   * Send project update notification
   */
  sendProjectUpdate: async (message: UpdateMessage): Promise<Record<string, unknown>> => {
    const response = await apiClient.post<Record<string, unknown>>(
      '/api/v1/notifications/project',
      message
    );
    return response.data;
  },

  /**
   * POST /api/v1/notifications/service-progress
   * Send service progress update notification
   */
  sendServiceProgress: async (message: UpdateMessage): Promise<Record<string, unknown>> => {
    const response = await apiClient.post<Record<string, unknown>>(
      '/api/v1/notifications/service-progress',
      message
    );
    return response.data;
  },

  /**
   * POST /api/v1/notifications/time-log
   * Send time log update notification
   */
  sendTimeLogUpdate: async (message: UpdateMessage): Promise<Record<string, unknown>> => {
    const response = await apiClient.post<Record<string, unknown>>(
      '/api/v1/notifications/time-log',
      message
    );
    return response.data;
  },

  /**
   * POST /api/v1/notifications/user/{userId}
   * Send notification to specific user
   */
  sendUserNotification: async (
    userId: string,
    message: UpdateMessage
  ): Promise<Record<string, unknown>> => {
    const response = await apiClient.post<Record<string, unknown>>(
      `/api/v1/notifications/user/${userId}`,
      message
    );
    return response.data;
  },

  /**
   * POST /api/v1/notifications/broadcast
   * Broadcast message to all users
   */
  broadcastMessage: async (message: UpdateMessage): Promise<Record<string, unknown>> => {
    const response = await apiClient.post<Record<string, unknown>>(
      '/api/v1/notifications/broadcast',
      message
    );
    return response.data;
  },

  /**
   * GET /api/v1/notifications/health
   * Health check endpoint
   */
  healthCheck: async (): Promise<Record<string, unknown>> => {
    const response = await apiClient.get<Record<string, unknown>>(
      '/api/v1/notifications/health'
    );
    return response.data;
  },
};

// ============================================
// WebSocket Hook (Client-side notification receiver)
// ============================================

/**
 * Custom hook for WebSocket notifications
 * This connects to the WebSocket service and receives real-time notifications
 *
 * Usage in components:
 * const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
 */
export interface UseNotificationsReturn {
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    entityId?: string;
    userId?: string;
    data?: Record<string, unknown>;
    progress?: number;
    status?: string;
  }>;
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

// Note: The actual WebSocket implementation will be in a separate hook file
// This is just the API service layer for HTTP endpoints
