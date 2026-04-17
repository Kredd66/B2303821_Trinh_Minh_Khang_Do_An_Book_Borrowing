import api from './axios'

export const bookApi = {
  getAll:      (params) => api.get('/books', { params }),
  getById:     (id)     => api.get(`/books/${id}`),
  create:      (data)   => api.post('/books', data),
  update:      (id, data) => api.put(`/books/${id}`, data),
  updateStock: (id, data) => api.patch(`/books/${id}/stock`, data),
  delete:      (id)     => api.delete(`/books/${id}`),
  restore:     (id)     => api.patch(`/books/${id}/restore`),
}