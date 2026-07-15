import apiClient, { unwrap } from './apiClient'

export const deadlineService = {
  getDeadlines: (params = {}) =>
    apiClient.get('/deadlines', { params }).then(unwrap),
}
