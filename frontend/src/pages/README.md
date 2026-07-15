# /frontend/src/pages

Page-level components — one file (or directory) per application route. These are the entry points rendered by React Router.

## Page Map

| Route | Component | Role required |
|---|---|---|
| `/` | `LandingPage` | None |
| `/login` | `LoginPage` | None |
| `/signup` | `SignupPage` | None |
| `/dashboard` | `DashboardPage` | citizen |
| `/profile` | `ProfilePage` | citizen |
| `/schemes` | `SchemesPage` | citizen |
| `/schemes/:id` | `SchemeDetailPage` | citizen |
| `/eligibility/:schemeId` | `EligibilityPage` | citizen |
| `/copilot` | `CopilotPage` | citizen |
| `/goals/:id` | `GoalPlanPage` | citizen |
| `/documents` | `DocumentVaultPage` | citizen |
| `/chat` | `ChatPage` | citizen |
| `/tracker` | `ApplicationTrackerPage` | citizen |
| `/calendar` | `DeadlineCalendarPage` | citizen |
| `/notifications` | `NotificationsPage` | citizen |
| `/admin` | `AdminDashboardPage` | admin |
| `/admin/analytics` | `AdminAnalyticsPage` | admin |
| `/admin/audit-logs` | `AdminAuditLogPage` | admin |
| `/admin/feature-flags` | `AdminFeatureFlagsPage` | admin |
| `*` | `NotFoundPage` | None |

Route guards are implemented in `../layouts/` — a citizen trying to access `/admin/*` is redirected to `/dashboard`.
