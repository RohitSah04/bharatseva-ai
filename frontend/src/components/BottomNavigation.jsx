import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Search, Cpu, ClipboardList, MessageSquare, User,
} from 'lucide-react'
import clsx from 'clsx'

const ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/schemes', icon: Search, label: 'Schemes' },
  { to: '/copilot', icon: Cpu, label: 'Copilot' },
  { to: '/tracker', icon: ClipboardList, label: 'Tracker' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export function BottomNavigation() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 z-30 safe-area-inset-bottom"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center py-2 px-1 gap-0.5 text-xs transition-colors',
                isActive ? 'text-blue-600' : 'text-gray-500',
              )
            }
            aria-label={item.label}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={clsx('w-5 h-5', item.to === '/copilot' && !isActive && 'text-blue-500')}
                  aria-hidden="true"
                />
                <span className={clsx(isActive && 'font-medium')}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
