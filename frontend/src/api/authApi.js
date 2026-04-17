import api from './axios'

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:          ()     => api.get('/auth/me'),
  updateProfile:  (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.patch('/auth/change-password', data),
  getAllUsers:    (params) => api.get('/auth/users', { params }),
  toggleUserStatus: (id)   => api.patch(`/auth/users/${id}/status`),
}