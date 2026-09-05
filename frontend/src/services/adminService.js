import apiClient, { unwrap } from './apiClient'

export const adminService = {
  // Analytics
  getUserGrowth: () =>
    apiClient.get('/admin/analytics/user-growth').then(unwrap),

  getPopularSchemes: () =>
    apiClient.get('/admin/analytics/popular-schemes').then(unwrap),

  getAgentPerformance: () =>
    apiClient.get('/admin/analytics/agent-performance').then(unwrap),

  getSearchTrends: () =>
    apiClient.get('/admin/analytics/search-trends').then(unwrap),

  getSystemHealth: () =>
    apiClient.get('/admin/analytics/system-health').then(unwrap),

  getKbStatus: () =>
    apiClient.get('/admin/analytics/kb-status').then(unwrap),

  // Audit
  getAuditLogs: (params = {}) =>
    apiClient.get('/admin/audit-logs', { params }).then(unwrap),

  // Feature Flags
  getFeatureFlags: () =>
    apiClient.get('/admin/feature-flags').then(unwrap),

  updateFeatureFlag: (flagName, enabled) =>
    apiClient.patch(`/admin/feature-flags/${flagName}`, { enabled }).then(unwrap),

  // User Management
  listUsers: (params = {}) =>
    apiClient.get('/admin/users', { params }).then(unwrap),

  getUser: (userId) =>
    apiClient.get(`/admin/users/${userId}`).then(unwrap),

  updateUserStatus: (userId, action) =>
    apiClient.patch(`/admin/users/${userId}/status`, { action }).then(unwrap),

  updateUserRole: (userId, role) =>
    apiClient.patch(`/admin/users/${userId}/role`, { role }).then(unwrap),

  // Demo Reset
  demoReset: () =>
    apiClient.post('/admin/demo-reset').then(unwrap),
}

