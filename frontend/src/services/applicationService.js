import apiClient, { unwrap } from './apiClient'

export const applicationService = {
  getApplications: (params = {}) =>
    apiClient.get('/applications', { params }).then(unwrap),

  createApplication: (schemeId) =>
    apiClient.post('/applications', { scheme_id: schemeId }).then(unwrap),

  updateApplication: (id, data) =>
    apiClient.patch(`/applications/${id}`, data).then(unwrap),
}
