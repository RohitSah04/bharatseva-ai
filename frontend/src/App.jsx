import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

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
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

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

export default function App() {
  return (
    <>
      <SkipLink />
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
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}
