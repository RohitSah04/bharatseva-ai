import { useNavigate } from 'react-router-dom'
import { useNotifications } from '@/hooks/useNotifications'
import { useUIStore } from '@/store/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { Bell, Menu, Moon, Sun } from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'
import clsx from 'clsx'

/* ── BharatSeva logo (same as Sidebar) ─────────────────────────────────────── */
function BSLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#5e6ad2" />
      <path
        d="M7 7h5a3 3 0 0 1 0 6H7V7zm0 6h5.5a3.5 3.5 0 0 1 0 4H7v-4z"
        fill="white"
        opacity="0.9"
      />
    </svg>
  )
}

export function Navbar({ onMenuClick }) {
  const navigate = useNavigate()
  const { unreadCount } = useNotifications()
  const { highContrast, toggleHighContrast, theme, setTheme } = useUIStore()
  const { user } = useAuth()

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
  const avatarLetter = user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <header
      className="h-14 flex items-center px-4 gap-3 sticky top-0 z-30 transition-colors"
      style={{
        background: 'rgb(var(--ds-canvas))',
        borderBottom: '1px solid rgb(var(--ds-hl))',
      }}
      role="banner"
    >
      {/* Mobile menu trigger */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg transition-colors"
        style={{ color: 'rgb(var(--ds-ink-s))' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgb(var(--ds-s1))'; e.currentTarget.style.color = 'rgb(var(--ds-ink))' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgb(var(--ds-ink-s))' }}
        aria-label="Toggle navigation menu"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Brand — mobile only (desktop has sidebar) */}
      <button
        onClick={() => navigate('/dashboard')}
        className="md:hidden flex items-center gap-2"
        aria-label="BharatSeva AI — go to dashboard"
      >
        <BSLogo />
        <span
          className="text-[13px] font-semibold"
          style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.02em' }}
        >
          BharatSeva AI
        </span>
      </button>

      <div className="flex-1" />

      {/* Right cluster */}
      <div className="flex items-center gap-1">

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'rgb(var(--ds-ink-s))' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgb(var(--ds-s1))'; e.currentTarget.style.color = 'rgb(var(--ds-ink))' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgb(var(--ds-ink-s))' }}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark
            ? <Sun  className="w-4 h-4" aria-hidden="true" />
            : <Moon className="w-4 h-4" aria-hidden="true" />}
        </button>

        {/* High contrast */}
        <button
          onClick={toggleHighContrast}
          className={clsx('p-2 rounded-lg transition-colors')}
          style={{
            background: highContrast ? 'rgba(var(--ds-accent),0.12)' : '',
            color: highContrast ? 'rgb(var(--ds-accent))' : 'rgb(var(--ds-ink-s))',
          }}
          onMouseEnter={(e) => { if (!highContrast) { e.currentTarget.style.background = 'rgb(var(--ds-s1))'; e.currentTarget.style.color = 'rgb(var(--ds-ink))' } }}
          onMouseLeave={(e) => { if (!highContrast) { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgb(var(--ds-ink-s))' } }}
          aria-label={highContrast ? 'Disable high contrast' : 'Enable high contrast'}
          aria-pressed={highContrast}
          title="High contrast"
        >
          <span className="w-4 h-4 flex items-center justify-center font-bold text-[11px]" aria-hidden="true">◐</span>
        </button>

        {/* Language switcher */}
        <LanguageSwitcher className="hidden sm:flex" />

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: 'rgb(var(--ds-ink-s))' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgb(var(--ds-s1))'; e.currentTarget.style.color = 'rgb(var(--ds-ink))' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgb(var(--ds-ink-s))' }}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="w-4.5 h-4.5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
              style={{ background: '#ef4444' }}
              aria-hidden="true"
            />
          )}
        </button>

        {/* Avatar — links to profile */}
        <button
          onClick={() => navigate('/profile')}
          className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold text-white transition-opacity hover:opacity-80 ml-1"
          style={{ background: 'rgb(var(--ds-accent))' }}
          aria-label="Go to profile"
        >
          {avatarLetter}
        </button>
      </div>
    </header>
  )
}
