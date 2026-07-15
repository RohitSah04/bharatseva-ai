import { create } from 'zustand'

export const useSchemeStore = create((set) => ({
  schemes: [],
  total: 0,
  page: 1,
  perPage: 20,
  loading: false,
  error: null,
  filters: { category: '', state: '', occupation: '', q: '' },

  setSchemes: (schemes, total, page, perPage) =>
    set({ schemes, total, page, perPage, error: null }),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters }, page: 1 })),

  setPage: (page) => set({ page }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
