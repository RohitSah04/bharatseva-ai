import { lazy, Suspense, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import axios from 'axios'

// Layouts
import { AuthLayout } from './layouts/AuthLayout'
import { CitizenLayout } from './layouts/CitizenLayout'
import { AdminLayout } from './layouts/AdminLayout'

// Guards
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import { PageLoader } from './components/LoadingSpinner'

// Eagerly loaded (critical path)
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

// Lazy loaded (code splitting)
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const SchemesPage = lazy(() => import('./pages/SchemesPage'))
const SchemeDetailPage = lazy(() => import('./pages/SchemeDetailPage'))
const CopilotPage = lazy(() => import('./pages/CopilotPage'))
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'))
const TrackerPage = lazy(() => import('./pages/TrackerPage'))
const DeadlinesPage = lazy(() => import('./pages/DeadlinesPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const SavedSchemesPage = lazy(() => import('./pages/SavedSchemesPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))
const AdminAnalyticsPage = lazy(() => import('./pages/AdminAnalyticsPage'))
const AdminAuditPage = lazy(() => import('./pages/AdminAuditPage'))
const AdminFlagsPage = lazy(() => import('./pages/AdminFlagsPage'))
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Accessibility skip link
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 btn-primary text-sm"
    >
      Skip to main content
    </a>
  )
}

/**
 * AuthHydrator — runs once on mount.
 *
 * If the persisted store says we're authenticated but has no accessToken
 * (typical page reload), attempt a silent refresh.
 *
 * Guarantees: `hydrating` ALWAYS becomes false, regardless of outcome.
 * A hard 5-second failsafe ensures the spinner cannot last forever.
 */
function AuthHydrator() {
  const didRun = useRef(false)

  useEffect(() => {
    // Strict-mode guard — only run once
    if (didRun.current) return
    didRun.current = true

    const { isAuthenticated, refreshToken, accessToken, setAccessToken, logout, setHydrated } =
      useAuthStore.getState()

    // Not in a hydration-needed state — ensure hydrating is false and bail
    if (!isAuthenticated || !refreshToken || accessToken) {
      setHydrated()
      return
    }

    // 5-second hard failsafe — if the refresh call never resolves we still unblock the UI
    const failsafe = setTimeout(() => {
      const { hydrating } = useAuthStore.getState()
      if (hydrating) {
        logout() // clear corrupt state
      }
    }, 5000)

    // Perform the silent refresh using a plain axios instance (not apiClient)
    // to avoid the response interceptor triggering another refresh loop.
    axios
      .post(`${BASE_URL}/api/v1/auth/refresh`, { refresh_token: refreshToken })
      .then((res) => {
        const newToken = res.data?.data?.access_token
        if (newToken) {
          setAccessToken(newToken) // also sets hydrating → false internally
        } else {
          logout()
        }
      })
      .catch(() => {
        logout() // expired / invalid refresh token — clear everything
      })
      .finally(() => {
        clearTimeout(failsafe)
        // Belt-and-suspenders: ensure hydrating is always false after the call
        const { hydrating } = useAuthStore.getState()
        if (hydrating) {
          useAuthStore.getState().setHydrated()
        }
      })
  }, [])

  return null
}

function App() {
  return (
    <>
      <SkipLink />
      {/* AuthHydrator runs once, silently resolves the hydrating state */}
      <AuthHydrator />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth routes */}
          <Route element={<PublicOnlyRoute><AuthLayout /></PublicOnlyRoute>}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          {/* Onboarding — protected, no layout chrome */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Citizen app */}
          <Route
            element={
              <ProtectedRoute>
                <CitizenLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/schemes" element={<SchemesPage />} />
            <Route path="/schemes/:id" element={<SchemeDetailPage />} />
            <Route path="/copilot" element={<CopilotPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/tracker" element={<TrackerPage />} />
            <Route path="/deadlines" element={<DeadlinesPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/saved" element={<SavedSchemesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Admin — requires admin role */}
          <Route
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/audit" element={<AdminAuditPage />} />
            <Route path="/admin/flags" element={<AdminFlagsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}

function ThemeProvider({ children }) {
  // Read from the hook so React re-renders when theme changes
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    function applyTheme(t) {
      const root = document.documentElement
      const isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      root.classList.toggle('dark', isDark)
      root.classList.toggle('light', !isDark)
    }

    applyTheme(theme)

    // When system theme is selected, follow OS preference changes in real time
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onSystemChange = () => {
      // Only act if the user hasn't chosen an explicit theme
      if (useUIStore.getState().theme === 'system') {
        applyTheme('system')
      }
    }

    mql.addEventListener('change', onSystemChange)
    return () => mql.removeEventListener('change', onSystemChange)
  }, [theme])

  // Subscribe to Zustand store rehydration — fires after persist middleware loads
  // from localStorage, which may happen after the first render.
  useEffect(() => {
    const unsub = useUIStore.subscribe((state, prevState) => {
      if (state.theme !== prevState.theme) {
        const root = document.documentElement
        const isDark =
          state.theme === 'dark' ||
          (state.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        root.classList.toggle('dark', isDark)
        root.classList.toggle('light', !isDark)
      }
    })
    return unsub
  }, [])

  // Enable smooth transitions AFTER first paint to avoid flash-on-load.
  // The inline script in index.html applies the correct class before React mounts,
  // so transitions are safe to enable once React has hydrated.
  useEffect(() => {
    const timer = setTimeout(() => {
      document.documentElement.classList.add('theme-transitions')
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return children
}


export default function AppWrapper() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
}
