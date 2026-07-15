# /frontend/src/store

Zustand global state stores. Used only for state that genuinely needs to be shared across distant components — not a replacement for local state or React Query server-state.

## Stores

| Store | State held |
|---|---|
| `authStore.ts` | `{ accessToken, user: { id, email, role }, isAuthenticated }` |
| `profileStore.ts` | `{ profile, completeness_pct }` — hydrated on login, invalidated on logout |
| `notificationStore.ts` | `{ unreadCount }` — polled every 60 seconds |
| `preferenceStore.ts` | `{ language, highContrast, largeText }` — persisted to localStorage |
| `featureFlagStore.ts` | `{ flags: Record<string, bool> }` — loaded on app init from API |

## Conventions

- Access tokens are stored **in memory only** (Zustand store) — never in localStorage or sessionStorage.
- On page refresh, the app attempts a silent token refresh using the HttpOnly cookie refresh token. If it fails, the user is redirected to login.
- `preferenceStore` values are persisted to localStorage because they are non-sensitive user preferences.
