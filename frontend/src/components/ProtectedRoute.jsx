import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { PageLoader } from '@/components/LoadingSpinner'

/**
 * Local failsafe: if hydrating is still true after 6 seconds (AuthHydrator's
 * 5-second failsafe should have fired by then), force it to false so the user
 * is never permanently blocked.  This is a belt-and-suspenders guard only.
 */
function useHydrationFailsafe() {
  const { hydrating, logout, setHydrated } = useAuthStore()
  useEffect(() => {
    if (!hydrating) return
    const t = setTimeout(() => {
      const state = useAuthStore.getState()
      if (state.hydrating) {
        if (state.isAuthenticated) {
          state.logout()
        } else {
          state.setHydrated()
        }
      }
    }, 6000)
    return () => clearTimeout(t)
  }, [hydrating, logout, setHydrated])
}

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, user, hydrating } = useAuthStore()
  useHydrationFailsafe()

  // While the silent token refresh is in-flight (post page-reload), show a
  // loader rather than redirecting or rendering pages with a null accessToken.
  if (hydrating) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, hydrating } = useAuthStore()
  useHydrationFailsafe()

  if (hydrating) {
    return <PageLoader />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}