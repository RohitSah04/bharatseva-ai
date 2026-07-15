import apiClient, { unwrap } from './apiClient'

export const savedSchemeService = {
  getSavedSchemes: () =>
    apiClient.get('/saved-schemes').then(unwrap),

  saveScheme: (schemeId) =>
    apiClient.post('/saved-schemes', { scheme_id: schemeId }).then(unwrap),

  removeSavedScheme: (schemeId) =>
    apiClient.delete(`/saved-schemes/${schemeId}`).then(unwrap),
}
