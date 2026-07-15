import apiClient, { unwrap } from './apiClient'

export const profileService = {
  getProfile: () =>
    apiClient.get('/profile').then(unwrap),

  updateProfile: (data) =>
    apiClient.put('/profile', data).then(unwrap),
}
