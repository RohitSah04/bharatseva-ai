import { useCallback, useEffect } from 'react'
import { savedSchemeService } from '@/services/savedSchemeService'
import { useAuthStore } from '@/store/authStore'
import { useSavedSchemeStore } from '@/store/savedSchemeStore'

export function useSavedSchemes() {
  const {
    savedSchemes, savedIds, loading,
    setSavedSchemes, addSavedScheme, removeSavedScheme, setLoading,
  } = useSavedSchemeStore()
  const { isAuthenticated } = useAuthStore()

  const fetchSaved = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const res = await savedSchemeService.getSavedSchemes()
      setSavedSchemes(res.data.saved_schemes || [])
    } catch {
      // network errors are non-fatal — keep current state
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, setLoading, setSavedSchemes])

  useEffect(() => { fetchSaved() }, [fetchSaved])

  const saveScheme = useCallback(async (schemeId, schemeName = '') => {
    // Snapshot before optimistic update so we can revert fully
    const prevSchemes = useSavedSchemeStore.getState().savedSchemes
    const prevIds = useSavedSchemeStore.getState().savedIds

    addSavedScheme(schemeId, schemeName)

    try {
      await savedSchemeService.saveScheme(schemeId)
      // Sync full details from server (fills in proper scheme_name if placeholder was used)
      await fetchSaved()
    } catch (err) {
      const code = err.response?.status
      if (code === 409) {
        // Already saved on server — just sync to be safe
        await fetchSaved()
        return
      }
      // Real error — revert to snapshot
      setSavedSchemes(prevSchemes)
      throw err
    }
  }, [fetchSaved, addSavedScheme, setSavedSchemes])

  const removeScheme = useCallback(async (schemeId) => {
    // Snapshot before optimistic removal
    const prevSchemes = useSavedSchemeStore.getState().savedSchemes

    removeSavedScheme(schemeId) // optimistic

    try {
      await savedSchemeService.removeSavedScheme(schemeId)
      await fetchSaved()
    } catch (err) {
      // Revert to full snapshot (restores both savedSchemes and savedIds)
      setSavedSchemes(prevSchemes)
      throw err
    }
  }, [fetchSaved, removeSavedScheme, setSavedSchemes])

  const isSaved = useCallback((schemeId) => savedIds.has(schemeId), [savedIds])

  const toggleSave = useCallback(async (schemeId, schemeName = '') => {
    if (isSaved(schemeId)) {
      await removeScheme(schemeId)
    } else {
      await saveScheme(schemeId, schemeName)
    }
  }, [isSaved, saveScheme, removeScheme])

  return { savedSchemes, savedIds, loading, fetchSaved, saveScheme, removeScheme, isSaved, toggleSave }
}
