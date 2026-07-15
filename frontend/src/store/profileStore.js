import { create } from 'zustand'

export const useProfileStore = create((set) => ({
  profile: null,
  completeness: 0,
  loading: false,
  error: null,

  setProfile: (profile, completeness) =>
    set({ profile, completeness: completeness ?? 0, error: null }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearProfile: () => set({ profile: null, completeness: 0, error: null, loading: false }),
}))
