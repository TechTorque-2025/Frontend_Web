'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useNotifications } from '@/app/contexts/NotificationContext'

export default function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, fetchNotifications, isConnected } = useNotifications()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleToggle = async () => {
    const nextState = !open
    setOpen(nextState)
    if (nextState) {
      await fetchNotifications()
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
      setError(null)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to mark notification as read'
      setError(message)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setError(null)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to mark notifications as read'
      setError(message)
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-full theme-button-secondary"
        aria-label="Notifications"
      >
        <svg
          className="w-5 h-5 theme-text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-[1px]">
            {unreadCount}
          </span>
        )}
        {isConnected && (
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" title="Real-time connected"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 automotive-card p-4 shadow-xl z-50">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold theme-text-primary">Notifications</span>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs theme-text-muted hover:theme-text-primary"
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-6 text-center theme-text-muted text-sm">Loading notifications...</div>
          ) : error ? (
            <div className="py-6 text-center text-red-500 text-sm">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="py-6 text-center theme-text-muted text-sm">No notifications yet.</div>
          ) : (
            <ul className="space-y-3 max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <li
                  key={notification.notificationId}
                  className={`p-3 rounded-lg border border-transparent ${notification.read ? 'theme-bg-primary' : 'bg-blue-50 dark:bg-blue-900/30'} transition-colors`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="theme-text-primary text-sm font-medium">{notification.message}</p>
                      {notification.details && (
                        <p className="theme-text-muted text-xs mt-1">{notification.details}</p>
                      )}
                      <p className="theme-text-muted text-[11px] mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notification.notificationId)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            className="block text-center theme-button-secondary text-sm mt-3"
            href="/dashboard/notifications"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  )
}
