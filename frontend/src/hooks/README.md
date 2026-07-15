# /frontend/src/hooks

Custom React hooks. Encapsulate data-fetching, mutation, and derived state. Pages and components call hooks; they never call API services directly.

## Hook Map

| Hook | Purpose |
|---|---|
| `useAuth()` | Login, logout, token refresh; exposes `{ user, role, isAuthenticated }` |
| `useProfile()` | Fetch + update citizen profile; exposes `profile`, `completeness`, `updateProfile()` |
| `useSchemes(filters)` | Paginated scheme list with filter params |
| `useScheme(id)` | Single scheme detail |
| `useEligibility(schemeId)` | Run eligibility check; returns `{ verdict, confidence, reasoning, sources }` |
| `useCopilot()` | Submit goal, get plan; `{ submitGoal(), activatePlan(), goals, currentPlan }` |
| `useApplications()` | List + update application tracker rows |
| `useDocuments()` | Upload, list, get document vault items |
| `useDeadlines()` | Aggregated deadline calendar |
| `useChat()` | Send message, get history; manages optimistic UI updates |
| `useNotifications()` | List, unread count, mark-read |
| `useSavedSchemes()` | Save/unsave, list |
| `useDegradedMode()` | Reads `meta.degraded` from last response; drives DegradedModeBanner |
| `useFeatureFlag(flagName)` | Returns boolean — is this flag enabled? (admin-only for toggling) |
