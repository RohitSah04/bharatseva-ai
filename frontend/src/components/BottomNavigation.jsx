import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Search, Cpu, ClipboardList, User,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

export function BottomNavigation() {
  const { t } = useTranslation()

  const ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/schemes', icon: Search, label: t('schemes') },
    { to: '/copilot', icon: Cpu, label: t('copilot') },
    { to: '/tracker', icon: ClipboardList, label: t('tracker') },
    { to: '/profile', icon: User, label: t('profile') },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden z-30"
      style={{
        background: 'rgb(var(--ds-canvas))',
        borderTop: '1px solid rgb(var(--ds-hl))',
      }}
      aria-label="Bottom navigation"
    >
      <div className="flex items-center safe-area-inset-bottom">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center py-2 px-1 gap-0.5 text-xs transition-colors',
                'focus-visible:outline-none',
              )
            }
            style={({ isActive }) => ({
              color: isActive ? 'rgb(var(--ds-accent))' : 'rgb(var(--ds-ink-s))',
            })}
            aria-label={item.label}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className="w-5 h-5"
                  style={
                    item.to === '/copilot' && !isActive
                      ? { color: 'rgb(var(--ds-accent))' }
                      : undefined
                  }
                  aria-hidden="true"
                />
                <span className={clsx('text-[10px]', isActive && 'font-medium')}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
