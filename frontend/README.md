# /frontend

React + TypeScript SPA for BharatSeva AI. Serves both the citizen self-service interface and the admin portal. Built with Vite.

## Structure

| Directory | Purpose |
|---|---|
| `src/components/` | Reusable UI components (buttons, cards, forms, modals, badges) |
| `src/pages/` | Page-level components — one file per route |
| `src/layouts/` | Layout wrappers (CitizenLayout, AdminLayout, AuthLayout) |
| `src/hooks/` | Custom React hooks (useAuth, useProfile, useEligibility, …) |
| `src/store/` | Zustand global state stores (auth, profile, notifications) |
| `src/services/` | Axios API client — one file per domain; wraps `/api/v1/*` calls |
| `src/assets/` | Static assets: icons, images, fonts |

## Key Libraries

- **Vite** — build tooling
- **React Router v6** — client-side routing with role-based route guards
- **Zustand** — lightweight global state (auth token, user profile)
- **React Query (TanStack Query)** — server-state caching, background refetch, optimistic updates
- **react-i18next** — internationalisation; language list loaded from API `/api/v1/version` config
- **Axios** — HTTP client with JWT interceptor (auto-refresh on 401)
- **Tailwind CSS** — utility-first styling; configured to meet WCAG 2.1 AA colour ratios

## Accessibility Requirements

- All interactive elements must be keyboard-navigable (Tab, Enter, Space, Arrow keys as appropriate).
- All form fields must have associated `<label>` elements (not just placeholders).
- All images must have meaningful `alt` attributes (or `alt=""` for decorative images).
- Colour contrast ratio ≥ 4.5:1 for body text; ≥ 3:1 for large text (enforced via `eslint-plugin-jsx-a11y`).
- Document upload widget: keyboard-accessible drag-drop alternative required (Suresh persona).
- Large-text / high-contrast mode toggle available on all citizen-facing pages (Kamla Devi persona).

## Running Locally

```bash
npm install
cp ../.env.example .env.local   # set VITE_API_BASE_URL
npm run dev
```
