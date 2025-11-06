'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notifyService } from '@/lib/api/notify.service';
import {
  NotificationResponse,
  NotificationFormData,
  NotificationFormErrors,
  NotificationStatus,
  NOTIFICATION_STATUS_CONFIG,
  NOTIFICATION_TYPE_OPTIONS,
  NOTIFICATION_CATEGORY_OPTIONS,
} from '@/types/notify.types';
import { notifyValidation, notifyHelpers } from '@/lib/utils/notify-validation';

/**
 * NotificationHistoryTab Component
 * View and manage notification history (Admin/Employee only)
 */
export default function NotificationHistoryTab() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationResponse | null>(null);

  // Form state
  const [formData, setFormData] = useState<NotificationFormData>({
    userId: '',
    type: 'IN_APP',
    category: 'SYSTEM',
    subject: '',
    message: '',
    recipientEmail: '',
    recipientPhone: '',
  });
  const [formErrors, setFormErrors] = useState<NotificationFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Filter state
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user?.id, filter]);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = filter === 'unread'
        ? await notifyService.getUnreadNotifications(String(user.id))
        : await notifyService.getUserNotifications(String(user.id));
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user?.id) return;

    try {
      const count = await notifyService.getUnreadCount(String(user.id));
      setUnreadCount(count.count || 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = notifyValidation.validateNotification(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      await notifyService.createNotification(formData);
      await fetchNotifications();
      setShowCreateModal(false);
      setFormErrors({});
      setFormData({
        userId: '',
        type: 'IN_APP',
        category: 'SYSTEM',
        subject: '',
        message: '',
        recipientEmail: '',
        recipientPhone: '',
      });
    } catch (err) {
      setFormErrors({ submit: 'Failed to create notification' });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notifyService.markAsRead(notificationId);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    try {
      await notifyService.markAllAsRead(String(user.id));
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      await notifyService.deleteNotification(notificationId);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (err) {
      alert('Failed to delete notification');
      console.error(err);
    }
  };

  const handleViewDetails = (notification: NotificationResponse) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
  };

  if (loading) {
    return <div className="theme-text-secondary">Loading notification history...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold theme-text-primary">Notification History</h2>
          <p className="theme-text-secondary text-sm">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All notifications read'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
            className="theme-button-secondary"
          >
            {filter === 'all' ? 'Show Unread Only' : 'Show All'}
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="theme-button-secondary">
              Mark All Read
            </button>
          )}
          <button onClick={() => setShowCreateModal(true)} className="theme-button-primary">
            + Create Notification
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 theme-card">
            <p className="theme-text-secondary">No notifications found</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`theme-card ${!notification.readAt ? 'border-l-4 border-blue-500' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 flex-1">
                  {/* Icons */}
                  <div className="flex flex-col gap-1">
                    <span className="text-2xl">
                      {notifyHelpers.getCategoryIcon(notification.category)}
                    </span>
                    <span className="text-xs">
                      {notifyHelpers.getTypeIcon(notification.type)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold theme-text-primary">{notification.subject}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${NOTIFICATION_STATUS_CONFIG[notification.status as NotificationStatus]?.colorClass || ''}`}>
                        {notification.status}
                      </span>
                    </div>
                    <p className="theme-text-secondary text-sm mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs theme-text-secondary">
                      <span>Category: {notification.category}</span>
                      <span>Type: {notification.type}</span>
                      <span>{notifyHelpers.getTimeAgo(notification.createdAt)}</span>
                      {notification.readAt && (
                        <span>Read: {notifyHelpers.getTimeAgo(notification.readAt)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(notification)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View
                  </button>
                  {!notification.readAt && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-sm text-green-600 dark:text-green-400 hover:underline"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-card max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold theme-text-primary mb-4">Create Notification</h3>
            <form onSubmit={handleCreateNotification} className="space-y-4">
              <div>
                <label className="block theme-text-primary mb-1">User ID *</label>
                <input
                  type="text"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full theme-input"
                  required
                />
                {formErrors.userId && <p className="theme-error">{formErrors.userId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block theme-text-primary mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full theme-input"
                    required
                  >
                    {NOTIFICATION_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block theme-text-primary mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full theme-input"
                    required
                  >
                    {NOTIFICATION_CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block theme-text-primary mb-1">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full theme-input"
                  required
                />
                {formErrors.subject && <p className="theme-error">{formErrors.subject}</p>}
              </div>

              <div>
                <label className="block theme-text-primary mb-1">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full theme-input"
                  rows={4}
                  required
                />
                {formErrors.message && <p className="theme-error">{formErrors.message}</p>}
              </div>

              <div>
                <label className="block theme-text-primary mb-1">Recipient Email (optional)</label>
                <input
                  type="email"
                  value={formData.recipientEmail}
                  onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                  className="w-full theme-input"
                />
                {formErrors.recipientEmail && <p className="theme-error">{formErrors.recipientEmail}</p>}
              </div>

              <div>
                <label className="block theme-text-primary mb-1">Recipient Phone (optional)</label>
                <input
                  type="tel"
                  value={formData.recipientPhone}
                  onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                  placeholder="+1234567890"
                  className="w-full theme-input"
                />
                {formErrors.recipientPhone && <p className="theme-error">{formErrors.recipientPhone}</p>}
              </div>

              {formErrors.submit && <p className="theme-error">{formErrors.submit}</p>}

              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="flex-1 theme-button-primary">
                  {submitting ? 'Creating...' : 'Create Notification'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormErrors({});
                  }}
                  className="flex-1 theme-button-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Details Modal */}
      {showDetailsModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold theme-text-primary mb-4">Notification Details</h3>
            <div className="space-y-3">
              <div>
                <p className="theme-text-secondary text-sm">Subject</p>
                <p className="theme-text-primary font-medium">{selectedNotification.subject}</p>
              </div>
              <div>
                <p className="theme-text-secondary text-sm">Message</p>
                <p className="theme-text-primary">{selectedNotification.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="theme-text-secondary text-sm">Type</p>
                  <p className="theme-text-primary">{selectedNotification.type}</p>
                </div>
                <div>
                  <p className="theme-text-secondary text-sm">Category</p>
                  <p className="theme-text-primary">{selectedNotification.category}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="theme-text-secondary text-sm">Status</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${NOTIFICATION_STATUS_CONFIG[selectedNotification.status as NotificationStatus]?.colorClass || ''}`}>
                    {selectedNotification.status}
                  </span>
                </div>
                <div>
                  <p className="theme-text-secondary text-sm">User ID</p>
                  <p className="theme-text-primary">{selectedNotification.userId}</p>
                </div>
              </div>
              <div>
                <p className="theme-text-secondary text-sm">Created At</p>
                <p className="theme-text-primary">
                  {notifyHelpers.formatTimestamp(selectedNotification.createdAt)}
                </p>
              </div>
              {selectedNotification.sentAt && (
                <div>
                  <p className="theme-text-secondary text-sm">Sent At</p>
                  <p className="theme-text-primary">
                    {notifyHelpers.formatTimestamp(selectedNotification.sentAt)}
                  </p>
                </div>
              )}
              {selectedNotification.readAt && (
                <div>
                  <p className="theme-text-secondary text-sm">Read At</p>
                  <p className="theme-text-primary">
                    {notifyHelpers.formatTimestamp(selectedNotification.readAt)}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="mt-6 w-full theme-button-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
