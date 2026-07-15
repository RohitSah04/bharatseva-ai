import { useNavigate } from 'react-router-dom'
import { useNotifications } from '@/hooks/useNotifications'
import { useUIStore } from '@/store/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { Bell, Menu, Moon, Sun, Type, Zap } from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'
import clsx from 'clsx'

export function Navbar({ onMenuClick }) {
  const navigate = useNavigate()
  const { unreadCount } = useNotifications()
  const { highContrast, largeText, toggleHighContrast, toggleLargeText } = useUIStore()
  const { user } = useAuth()

  return (
    <header
      className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 sticky top-0 z-30"
      role="banner"
    >
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Toggle navigation menu"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Brand */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 font-bold text-gray-900"
        aria-label="BharatSeva AI — go to dashboard"
      >
        <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center" aria-hidden="true">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="hidden sm:block text-sm">BharatSeva AI</span>
      </button>

      <div className="flex-1" />

      {/* Accessibility controls */}
      <div className="hidden sm:flex items-center gap-1">
        <button
          onClick={toggleLargeText}
          className={clsx(
            'p-2 rounded-lg text-sm transition-colors',
            largeText ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100',
          )}
          aria-label={largeText ? 'Disable large text' : 'Enable large text'}
          aria-pressed={largeText}
          title="Large text"
        >
          <Type className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          onClick={toggleHighContrast}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            highContrast ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100',
          )}
          aria-label={highContrast ? 'Disable high contrast' : 'Enable high contrast'}
          aria-pressed={highContrast}
          title="High contrast"
        >
          {highContrast ? <Moon className="w-4 h-4" aria-hidden="true" /> : <Sun className="w-4 h-4" aria-hidden="true" />}
        </button>
      </div>

      <LanguageSwitcher className="hidden sm:flex" />

      {/* Notifications */}
      <button
        onClick={() => navigate('/notifications')}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* User avatar */}
      <button
        onClick={() => navigate('/profile')}
        className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center hover:bg-blue-700 transition-colors"
        aria-label="Go to profile"
      >
        {user?.email?.[0]?.toUpperCase() || 'U'}
      </button>
    </header>
  )
}
