import { Outlet, Link } from 'react-router-dom'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

/* ── BharatSeva logo mark ─────────────────────────────────────────────────── */
function BSLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#5e6ad2" />
      <path
        d="M7 7h5a3 3 0 0 1 0 6H7V7zm0 6h5.5a3.5 3.5 0 0 1 0 4H7v-4z"
        fill="white"
        opacity="0.9"
      />
    </svg>
  )
}

export function AuthLayout() {
  return (
    <div
      className="min-h-screen flex flex-col transition-colors"
      style={{ background: 'rgb(var(--ds-canvas))' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2" aria-label="BharatSeva AI home">
          <BSLogo />
          <div>
            <p
              className="text-sm font-bold leading-none"
              style={{ color: 'rgb(var(--ds-ink))' }}
            >
              BharatSeva AI
            </p>
            <p
              className="text-xs leading-none mt-0.5"
              style={{ color: 'rgb(var(--ds-ink-s))' }}
            >
              Citizen Copilot
            </p>
          </div>
        </Link>
        <LanguageSwitcher />
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <footer
        className="py-4 text-center text-xs"
        style={{ color: 'rgb(var(--ds-ink-3))' }}
      >
        Powered by IBM watsonx.ai Granite · Government of India
      </footer>
    </div>
  )
}
