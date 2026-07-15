import apiClient, { unwrap } from './apiClient'

export const healthService = {
  getLiveness: () =>
    apiClient.get('/health').then(unwrap),

  getReadiness: () =>
    apiClient.get('/health/ready').then(unwrap),

  getVersion: () =>
    apiClient.get('/version').then(unwrap),
}
