import { create } from 'zustand'

export const useSavedSchemeStore = create((set) => ({
  savedSchemes: [],
  savedIds: new Set(),
  loading: false,
  error: null,

  // Replace both savedSchemes and savedIds from the API response
  setSavedSchemes: (schemes) =>
    set({
      savedSchemes: schemes,
      savedIds: new Set(schemes.map((s) => s.scheme_id)),
      error: null,
    }),

  // Optimistic add — updates both sets atomically
  addSavedScheme: (schemeId, placeholderName = '') =>
    set((state) => ({
      savedIds: new Set([...state.savedIds, schemeId]),
      savedSchemes: state.savedSchemes.some((s) => s.scheme_id === schemeId)
        ? state.savedSchemes
        : [...state.savedSchemes, { scheme_id: schemeId, scheme_name: placeholderName, saved_at: new Date().toISOString() }],
    })),

  // Optimistic remove — updates both sets atomically
  removeSavedScheme: (schemeId) =>
    set((state) => {
      const newIds = new Set(state.savedIds)
      newIds.delete(schemeId)
      return {
        savedIds: newIds,
        savedSchemes: state.savedSchemes.filter((s) => s.scheme_id !== schemeId),
      }
    }),

  // Clear on logout so a new user gets a clean slate
  clearSavedSchemes: () =>
    set({ savedSchemes: [], savedIds: new Set(), loading: false, error: null }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))

