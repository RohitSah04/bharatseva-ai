# /frontend/src/components

Reusable UI components. Every component must be accessible, internationalised, and tested.

## Component Categories

| Category | Examples |
|---|---|
| Atoms | `Button`, `Badge`, `Tag`, `Spinner`, `ProgressBar`, `Avatar` |
| Molecules | `SchemeCard`, `EligibilityBadge`, `ConfidenceMeter`, `DocumentUploadWidget` |
| Organisms | `ProfileForm`, `SchemeList`, `CopilotPlanViewer`, `ChatMessage`, `NotificationPanel` |
| Feedback | `DegradedModeBanner` (shown when API returns `degraded: true`), `ErrorBoundary` |
| Accessibility | `SkipNavLink`, `FocusTrap`, `HighContrastToggle`, `LargeTextToggle` |

## DegradedModeBanner

Must be rendered on every page where an API response can include `"degraded": true`. When visible, it clearly labels the content as "AI-assisted features temporarily unavailable — showing cached results". This is a **hard requirement**, not optional UX polish.

## Conventions

- Components are named in PascalCase.
- Each component lives in its own directory: `ComponentName/index.tsx` + `ComponentName.test.tsx`.
- No business logic in components — data fetching belongs in `../hooks/` or `../services/`.
