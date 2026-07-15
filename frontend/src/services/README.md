# /frontend/src/services

Axios API client modules — one file per backend domain. Hooks call services; services call the API. Services must never be called directly from components.

## Service Map

| File | Wraps |
|---|---|
| `api.ts` | Axios instance: base URL, JWT interceptor (attach token), 401 interceptor (auto-refresh) |
| `authService.ts` | `/api/v1/auth/*` |
| `profileService.ts` | `/api/v1/profile` |
| `schemeService.ts` | `/api/v1/schemes` |
| `eligibilityService.ts` | `/api/v1/eligibility` |
| `goalService.ts` | `/api/v1/goals` |
| `applicationService.ts` | `/api/v1/applications` |
| `documentService.ts` | `/api/v1/documents` |
| `deadlineService.ts` | `/api/v1/deadlines` |
| `chatService.ts` | `/api/v1/chat` |
| `savedSchemeService.ts` | `/api/v1/saved-schemes` |
| `notificationService.ts` | `/api/v1/notifications` |
| `adminService.ts` | `/api/v1/admin/*` |

## JWT Interceptor Behaviour

1. Before each request: attach `Authorization: Bearer <accessToken>` from `authStore`.
2. On 401 response: call `authService.refresh()`, update `authStore`, retry original request once.
3. If refresh also fails: clear `authStore`, redirect to `/login`.
