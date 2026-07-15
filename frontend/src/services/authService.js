import apiClient, { unwrap } from './apiClient'

export const authService = {
  signup: (email, password) =>
    apiClient.post('/auth/signup', { email, password }).then(unwrap),

  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }).then(unwrap),

  refresh: (refreshToken) =>
    apiClient.post('/auth/refresh', { refresh_token: refreshToken }).then(unwrap),

  logout: (refreshToken) =>
    apiClient.post('/auth/logout', { refresh_token: refreshToken }).then(unwrap),

  requestPasswordReset: (email) =>
    apiClient.post('/auth/password-reset/request', { email }).then(unwrap),

  confirmPasswordReset: (token, newPassword) =>
    apiClient.post('/auth/password-reset/confirm', { token, new_password: newPassword }).then(unwrap),
}
