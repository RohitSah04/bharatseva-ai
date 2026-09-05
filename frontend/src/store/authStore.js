import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      // hydrating: true while the app is re-acquiring an access token after a
      // page reload (isAuthenticated=true but accessToken=null from localStorage).
      // ProtectedRoute renders a loader while this is true.
      hydrating: false,

      login: ({ accessToken, refreshToken, user }) =>
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          hydrating: false,
        }),

      setAccessToken: (accessToken) =>
        set({ accessToken, hydrating: false }),

      setUser: (user) =>
        set({ user }),

      setHydrated: () =>
        set({ hydrating: false }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          hydrating: false,
        }),

      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'bharatseva_auth',
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Do NOT persist accessToken (XSS risk) or hydrating
      }),
      onRehydrateStorage: () => (state) => {
        // After localStorage rehydration: if we have a refreshToken and
        // isAuthenticated=true but no accessToken, mark as hydrating so
        // ProtectedRoute waits for the first refresh to complete.
        if (state && state.isAuthenticated && state.refreshToken && !state.accessToken) {
          state.hydrating = true
        }
      },
    },
  ),
)

