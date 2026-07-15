import apiClient, { unwrap } from './apiClient'

export const notificationService = {
  getNotifications: (params = {}) =>
    apiClient.get('/notifications', { params }).then(unwrap),

  markRead: (id) =>
    apiClient.patch(`/notifications/${id}/read`).then(unwrap),

  markAllRead: () =>
    apiClient.patch('/notifications/read-all').then(unwrap),
}
