"use client";
import api from '../lib/apiClient';
import type {
  NotificationResponse,
  SubscribeRequest,
  SubscriptionResponse,
  MarkAsReadRequest,
  UnsubscribeRequest,
  ApiResponse
} from '../types/notification';

export const notificationService = {
  // Get all notifications
  async getNotifications(unreadOnly = false): Promise<NotificationResponse[]> {
    const res = await api.get('/notifications', { 
      params: { unread: unreadOnly || undefined } 
    });
    return res.data;
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const res = await api.get<ApiResponse>('/notifications/count/unread');
    return (res.data.data as { count: number }).count || 0;
  },

  // Mark notification as read/unread
  async markAsRead(notificationId: string, read = true): Promise<ApiResponse> {
    const res = await api.patch<ApiResponse>(`/notifications/${notificationId}`, { 
      read 
    } as MarkAsReadRequest);
    return res.data;
  },

  // Delete notification
  async deleteNotification(notificationId: string): Promise<ApiResponse> {
    const res = await api.delete<ApiResponse>(`/notifications/${notificationId}`);
    return res.data;
  },

  // Subscribe to push notifications
  async subscribe(data: SubscribeRequest): Promise<SubscriptionResponse> {
    const res = await api.post<SubscriptionResponse>('/notifications/subscribe', data);
    return res.data;
  },

  // Unsubscribe from push notifications
  async unsubscribe(data: UnsubscribeRequest): Promise<ApiResponse> {
    const res = await api.delete<ApiResponse>('/notifications/subscribe', { data });
    return res.data;
  },

  // Mark all as read
  async markAllAsRead(): Promise<void> {
    const notifications = await this.getNotifications(true);
    await Promise.all(
      notifications.map(notif => this.markAsRead(notif.notificationId))
    );
  },
};

export default notificationService;
