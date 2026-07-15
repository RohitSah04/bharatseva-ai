import apiClient, { unwrap } from './apiClient'

export const schemeService = {
  getSchemes: (params = {}) =>
    apiClient.get('/schemes', { params }).then(unwrap),

  getScheme: (id) =>
    apiClient.get(`/schemes/${id}`).then(unwrap),
}
