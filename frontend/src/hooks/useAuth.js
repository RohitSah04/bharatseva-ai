import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'
import { profileService } from '@/services/profileService'
import { useAuthStore } from '@/store/authStore'
import { useProfileStore } from '@/store/profileStore'

export function useAuth() {
  const { isAuthenticated, user, login, logout: storeLogout, refreshToken } = useAuthStore()
  const { setProfile, clearProfile } = useProfileStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loginUser = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const envelope = await authService.login(email, password)
      // envelope = { success, data: { access_token, refresh_token, expires_in, user_id, role }, error, meta }
      const tokenData = envelope.data

      // Store tokens and user identity immediately — role comes from the login response
      login({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        user: {
          id: tokenData.user_id,
          email,
          role: tokenData.role || 'citizen',
        },
      })

      // Fetch profile in background (non-blocking — failure is acceptable)
      try {
        const profileEnvelope = await profileService.getProfile()
        const p = profileEnvelope.data
        setProfile(p, p.profile_completeness_pct)
      } catch {
        // Profile may not exist yet on first login — that's fine
      }

      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }, [login, navigate, setProfile])

  const signupUser = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      await authService.signup(email, password)
      // Auto-login after successful signup (loginUser manages its own loading state)
      setLoading(false)
      await loginUser(email, password)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Signup failed. Please try again.')
      setLoading(false)
    }
  }, [loginUser])

  const logoutUser = useCallback(async () => {
    try {
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    } catch {
      // Ignore API errors on logout — always clear local state
    } finally {
      storeLogout()
      clearProfile()
      navigate('/login')
    }
  }, [refreshToken, storeLogout, navigate, clearProfile])

  return {
    isAuthenticated,
    user,
    loading,
    error,
    loginUser,
    signupUser,
    logoutUser,
  }
}
