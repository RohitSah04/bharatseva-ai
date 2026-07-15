import apiClient, { unwrap } from './apiClient'

export const chatService = {
  sendMessage: (message, language) =>
    apiClient.post('/chat', { message, language }).then(unwrap),

  getHistory: (params = {}) =>
    apiClient.get('/chat/history', { params }).then(unwrap),
}
