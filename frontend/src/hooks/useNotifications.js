import { useCallback, useEffect } from 'react'
import { notificationService } from '@/services/notificationService'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'

export function useNotifications() {
  const { notifications, unreadCount, loading, setNotifications, markRead: storeMarkRead, markAllRead: storeMarkAllRead, setLoading } = useNotificationStore()
  const { isAuthenticated } = useAuthStore()

  const fetchNotifications = useCallback(async (params = {}) => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const res = await notificationService.getNotifications(params)
      setNotifications(res.data.notifications || [], res.data.unread_count || 0)
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, setNotifications, setLoading])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(() => fetchNotifications(), 60000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markRead = useCallback(async (id) => {
    try {
      await notificationService.markRead(id)
      storeMarkRead(id)
    } catch {}
  }, [storeMarkRead])

  const markAllRead = useCallback(async () => {
    try {
      await notificationService.markAllRead()
      storeMarkAllRead()
    } catch {}
  }, [storeMarkAllRead])

  return { notifications, unreadCount, loading, fetchNotifications, markRead, markAllRead }
}
