import api from './axios'

export const borrowApi = {
  create:         (data)       => api.post('/borrows', data),
  getMy:          (params)     => api.get('/borrows/my', { params }),
  getAll:         (params)     => api.get('/borrows', { params }),
  cancel:         (id)         => api.delete(`/borrows/${id}`),
  approve:        (id, data)   => api.patch(`/borrows/${id}/approve`, data),
  // bookIds[] optional — nếu ko truyền → thao tác tất cả sách đang mượn
  return:         (id, data)   => api.patch(`/borrows/${id}/return`, data),
  reportLost:     (id, data)   => api.patch(`/borrows/${id}/lost`, data),
  requestRenewal: (id, data)   => api.patch(`/borrows/${id}/request-renewal`, data),
  approveRenewal: (id, data)   => api.patch(`/borrows/${id}/approve-renewal`, data),
}