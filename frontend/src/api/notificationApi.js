import api from './axios'

export const notificationApi = {
  getAll:      ()   => api.get('/notifications'),
  markAsRead:  (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: ()   => api.patch('/notifications/read-all'),
  clearRead:   ()   => api.delete('/notifications/clear-read'),
}
