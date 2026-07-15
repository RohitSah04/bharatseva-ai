import { useCallback, useEffect } from 'react'
import { profileService } from '@/services/profileService'
import { useProfileStore } from '@/store/profileStore'
import { useAuthStore } from '@/store/authStore'

export function useProfile() {
  const { profile, completeness, loading, error, setProfile, setLoading, setError } = useProfileStore()
  const { isAuthenticated } = useAuthStore()

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const res = await profileService.getProfile()
      const p = res.data
      setProfile(p, p.profile_completeness_pct)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, setProfile, setLoading, setError])

  useEffect(() => {
    if (isAuthenticated && !profile) {
      fetchProfile()
    }
  }, [isAuthenticated, profile, fetchProfile])

  const updateProfile = useCallback(async (data) => {
    setLoading(true)
    try {
      const res = await profileService.updateProfile(data)
      const p = res.data
      setProfile(p, p.profile_completeness_pct)
      return p
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Failed to update profile'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [setProfile, setLoading, setError])

  return { profile, completeness, loading, error, fetchProfile, updateProfile }
}
