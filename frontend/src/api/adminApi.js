import api from './axios'

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
}
