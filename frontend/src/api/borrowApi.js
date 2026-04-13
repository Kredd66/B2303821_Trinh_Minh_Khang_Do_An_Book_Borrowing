import api from './axios'

export const borrowApi = {
  create:  (data)   => api.post('/borrows', data),
  getMy:   (params) => api.get('/borrows/my', { params }),
  getAll:  (params) => api.get('/borrows', { params }),
  approve: (id, data) => api.patch(`/borrows/${id}/approve`, data),
  return:  (id)     => api.patch(`/borrows/${id}/return`),
}