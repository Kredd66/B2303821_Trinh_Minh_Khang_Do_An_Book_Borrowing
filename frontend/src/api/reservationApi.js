import api from './axios'

export const reservationApi = {
  create: (data) => api.post('/reservations', data),
  getMy: () => api.get('/reservations/my'),
  cancel: (id) => api.patch(`/reservations/${id}/cancel`),
}
