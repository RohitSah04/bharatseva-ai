# /frontend/src/layouts

Layout wrappers that provide consistent page shell (nav, sidebar, footer) and role-based route protection.

## Layouts

| Layout | Used by | Guards |
|---|---|---|
| `AuthLayout` | Login, Signup, Password Reset | Redirect to `/dashboard` if already authenticated |
| `CitizenLayout` | All citizen pages | Redirect to `/login` if unauthenticated |
| `AdminLayout` | All `/admin/*` pages | Redirect to `/dashboard` if role ≠ `admin` |
| `PublicLayout` | Landing page, 404 | None |

## CitizenLayout Includes

- Top navigation bar: logo, scheme search, language selector, notification bell, user menu
- Left sidebar (collapsible on mobile): Dashboard, Schemes, Copilot, Vault, Chat, Tracker, Calendar
- `DegradedModeBanner` — rendered when last API response had `degraded: true`
- `SkipNavLink` — renders a visually-hidden "Skip to main content" link as the first focusable element (keyboard accessibility)
- Large-text / high-contrast mode toggle (persisted to localStorage)

## AdminLayout Includes

- Top navigation: admin branding, user menu
- Left sidebar: Analytics, Audit Logs, Feature Flags, System Health, KB Status
