"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import websocketService from '@/services/websocketService';
import notificationService from '@/services/notificationService';
import type { NotificationResponse } from '@/types/notification';

interface NotificationContextType {
  notifications: NotificationResponse[];
  unreadCount: number;
  loading: boolean;
  isConnected: boolean;
  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  showToast: (notification: NotificationResponse) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
  userId: string | null;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, userId }) => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<NotificationResponse | null>(null);

  // Fetch notifications from REST API
  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    if (!userId) return;

    try {
      setLoading(true);
      const data = await notificationService.getNotifications(unreadOnly);
      setNotifications(data);

      // Also fetch unread count
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId, true);

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.notificationId === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);

      // Update local state
      const deletedNotification = notifications.find(n => n.notificationId === notificationId);
      setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));

      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [notifications]);

  // Show toast notification
  const showToast = useCallback((notification: NotificationResponse) => {
    setToastNotification(notification);

    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      setToastNotification(null);
    }, 5000);
  }, []);

  // WebSocket callbacks
  const handleNewNotification = useCallback((notification: NotificationResponse) => {
    console.log('New notification received:', notification);

    // Add to notifications list
    setNotifications(prev => [notification, ...prev]);

    // Show toast
    showToast(notification);
  }, [showToast]);

  const handleUnreadCountUpdate = useCallback((count: number) => {
    console.log('Unread count updated:', count);
    setUnreadCount(count);
  }, []);

  // Initialize WebSocket connection when userId changes
  useEffect(() => {
    if (!userId) {
      websocketService.disconnect();
      setIsConnected(false);
      return;
    }

    // Fetch initial notifications
    fetchNotifications();

    // Connect to WebSocket
    websocketService.connect(userId, handleNewNotification, handleUnreadCountUpdate);
    setIsConnected(true);

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
      setIsConnected(false);
    };
  }, [userId, fetchNotifications, handleNewNotification, handleUnreadCountUpdate]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    isConnected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    showToast,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {toastNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`
            max-w-sm p-4 rounded-lg shadow-lg border
            ${toastNotification.type === 'SUCCESS' ? 'bg-green-50 border-green-200' : ''}
            ${toastNotification.type === 'INFO' ? 'bg-blue-50 border-blue-200' : ''}
            ${toastNotification.type === 'WARNING' ? 'bg-yellow-50 border-yellow-200' : ''}
            ${toastNotification.type === 'ERROR' ? 'bg-red-50 border-red-200' : ''}
          `}>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">
                  {toastNotification.message}
                </p>
                {toastNotification.details && (
                  <p className="text-xs text-gray-600 mt-1">
                    {toastNotification.details}
                  </p>
                )}
              </div>
              <button
                onClick={() => setToastNotification(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
