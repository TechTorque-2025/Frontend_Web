'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { notificationHelpers } from '@/types/notification.types';

/**
 * Notifications Component
 * Displays real-time notifications in a dropdown
 * Can be placed in header/navbar
 */
export default function Notifications() {
  const { notifications, unreadCount, connected, markAsRead, markAllAsRead, clearAll, removeNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        {/* Bell Icon */}
        <svg
          className="w-6 h-6 theme-text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection Status Indicator */}
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
            connected ? 'bg-green-500' : 'bg-red-500'
          }`}
          title={connected ? 'Connected' : 'Disconnected'}
        />
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-96 max-h-[32rem] overflow-hidden rounded-lg shadow-lg theme-card z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="font-bold theme-text-primary">Notifications</h3>
                <p className="text-xs theme-text-secondary">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Mark all read
                    </button>
                    <button
                      onClick={clearAll}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Clear all
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-96">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <svg
                    className="w-16 h-16 theme-text-secondary mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="theme-text-secondary text-sm text-center">
                    No notifications yet
                  </p>
                  <p className="theme-text-secondary text-xs text-center mt-1">
                    We&apos;ll notify you when something important happens
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => {
                    const config = notificationHelpers.getConfig(notification.type);
                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center text-xl`}
                          >
                            {config.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium theme-text-primary text-sm">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="theme-text-secondary text-sm mt-1 line-clamp-2">
                              {notification.message}
                            </p>

                            {/* Progress Bar (if available) */}
                            {notification.progress !== undefined && (
                              <div className="mt-2">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs theme-text-secondary">
                                    Progress
                                  </span>
                                  <span className="text-xs font-medium theme-text-primary">
                                    {notification.progress}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                  <div
                                    className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all"
                                    style={{ width: `${notification.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Status Badge (if available) */}
                            {notification.status && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                  {notification.status}
                                </span>
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs theme-text-secondary">
                                {notificationHelpers.formatTimestamp(notification.timestamp)}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                className="text-xs text-red-600 dark:text-red-400 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
