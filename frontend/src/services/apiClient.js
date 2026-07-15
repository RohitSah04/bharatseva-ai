import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

// In development: VITE_API_BASE_URL is empty → baseURL is '/api/v1' → Vite proxy forwards to backend.
// In production: VITE_API_BASE_URL is the full backend URL → requests go directly.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000,  // 90 s — AI calls (chat/copilot/eligibility) can take 30-60 s
})

// Request interceptor — attach JWT Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor — transparent token refresh on 401
let isRefreshing = false
let refreshQueue = []

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = useAuthStore.getState().refreshToken

      if (!refreshToken) {
        useAuthStore.getState().logout()
        return Promise.reject(error)
      }

      try {
        // Use a fresh axios instance (not apiClient) to avoid interceptor loop
        const response = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        })
        const { access_token } = response.data.data
        useAuthStore.getState().setAccessToken(access_token)

        refreshQueue.forEach(({ resolve }) => resolve(access_token))
        refreshQueue = []

        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        refreshQueue.forEach(({ reject }) => reject(refreshError))
        refreshQueue = []
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

// unwrap: returns the full backend envelope { success, data, error, meta }
// Consumers then access .data for the payload and .meta.degraded for AI status.
export const unwrap = (response) => response.data

export default apiClient
