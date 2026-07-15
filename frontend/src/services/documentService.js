import apiClient, { unwrap } from './apiClient'

export const documentService = {
  uploadDocument: (formData, onProgress) =>
    apiClient.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }).then(unwrap),

  getDocuments: (params = {}) =>
    apiClient.get('/documents', { params }).then(unwrap),

  getDocument: (id) =>
    apiClient.get(`/documents/${id}`).then(unwrap),
}
