'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useNotifications } from '@/app/contexts/NotificationContext'

export default function NotificationBell() {
  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, fetchNotifications, isConnected } = useNotifications()
  const [open, setOpen] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
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
      setLocalError(null)
      await fetchNotifications()
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
      setLocalError(null)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to mark notification as read'
      setLocalError(message)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setLocalError(null)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to mark notifications as read'
      setLocalError(message)
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="theme-toggle relative"
        aria-label="Notifications"
      >
        <svg
          className="w-5 h-5 transition-transform duration-300 hover:rotate-12"
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
          <span className="absolute -top-1 -right-1 theme-badge-danger text-xs rounded-full px-2 py-px">
            {unreadCount}
          </span>
        )}
        {isConnected && (
          <span className="absolute bottom-0 right-0 w-2 h-2 theme-bg-success rounded-full border-2 border-[var(--bg-primary)]" title="Real-time connected"></span>
        )}
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-current opacity-0 transition-opacity duration-200 pointer-events-none"></div>
      </button>

      {open && (
        <div className="fixed right-4 top-20 w-80 automotive-card p-4 shadow-xl z-50 max-h-[500px] flex flex-col origin-top-right">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold theme-text-primary text-base">Notifications</span>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs theme-text-muted hover:theme-text-primary transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-8 text-center theme-text-muted text-sm">Loading notifications...</div>
          ) : (localError || error) ? (
            <div className="py-8 text-center theme-text-danger text-sm">{localError || error}</div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center theme-text-muted text-sm">No notifications yet.</div>
          ) : (
            <ul className="space-y-2 max-h-80 overflow-y-auto mb-3 pr-1">
              {notifications.map((notification) => (
                <li
                  key={notification.notificationId}
                  className={`p-3 rounded-lg border ${notification.read ? 'border-transparent theme-bg-secondary' : 'theme-alert-info'} transition-colors`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="theme-text-primary text-sm font-medium wrap-break-word">{notification.message}</p>
                      {notification.details && (
                        <p className="theme-text-muted text-xs mt-1 wrap-break-word">{notification.details}</p>
                      )}
                      <p className="theme-text-muted text-[11px] mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notification.notificationId)}
                        className="text-xs theme-text-info hover:underline whitespace-nowrap shrink-0"
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
            href="/dashboard/notifications"
            className="block w-full text-center mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors theme-bg-tertiary hover:theme-bg-hover theme-text-primary"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  )
}
