import { useCallback, useEffect, useState } from 'react'
import { savedSchemeService } from '@/services/savedSchemeService'
import { useAuthStore } from '@/store/authStore'

export function useSavedSchemes() {
  const [savedSchemes, setSavedSchemes] = useState([])
  const [savedIds, setSavedIds] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuthStore()

  const fetchSaved = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const res = await savedSchemeService.getSavedSchemes()
      const schemes = res.data.saved_schemes || []
      setSavedSchemes(schemes)
      setSavedIds(new Set(schemes.map((s) => s.scheme_id)))
    } catch {} finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => { fetchSaved() }, [fetchSaved])

  const saveScheme = useCallback(async (schemeId) => {
    try {
      await savedSchemeService.saveScheme(schemeId)
      setSavedIds((prev) => new Set([...prev, schemeId]))
      await fetchSaved()
    } catch (err) {
      const code = err.response?.status
      if (code === 409) return // Already saved
      throw err
    }
  }, [fetchSaved])

  const removeScheme = useCallback(async (schemeId) => {
    try {
      await savedSchemeService.removeSavedScheme(schemeId)
      setSavedIds((prev) => { const s = new Set(prev); s.delete(schemeId); return s })
      await fetchSaved()
    } catch (err) { throw err }
  }, [fetchSaved])

  const isSaved = useCallback((schemeId) => savedIds.has(schemeId), [savedIds])
  const toggleSave = useCallback(async (schemeId) => {
    if (isSaved(schemeId)) {
      await removeScheme(schemeId)
    } else {
      await saveScheme(schemeId)
    }
  }, [isSaved, saveScheme, removeScheme])

  return { savedSchemes, savedIds, loading, fetchSaved, saveScheme, removeScheme, isSaved, toggleSave }
}
