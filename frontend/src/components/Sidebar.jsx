import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Search, Cpu, FileText, ClipboardList,
  Calendar, MessageSquare, Bookmark, Bell, User, Settings,
  LogOut, ShieldCheck, X, Zap, ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/schemes', icon: Search, label: 'Schemes' },
  { to: '/copilot', icon: Cpu, label: 'AI Copilot', highlight: true },
  { to: '/documents', icon: FileText, label: 'Document Vault' },
  { to: '/tracker', icon: ClipboardList, label: 'Tracker' },
  { to: '/deadlines', icon: Calendar, label: 'Deadlines' },
  { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { to: '/saved', icon: Bookmark, label: 'Saved Schemes' },
]

const BOTTOM_ITEMS = [
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar({ open, onClose }) {
  const { user, logoutUser, isAuthenticated } = useAuth()
  const isAdmin = user?.role === 'admin'

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel
          Mobile  : fixed, full height, slides in/out via translateX.
          Desktop : static (participates in flex layout), flex-shrink-0 holds the w-64
                    width so the content area cannot compress it.
      */}
      <aside
        className={clsx(
          'fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 flex flex-col transition-transform duration-300',
          'md:static md:translate-x-0 md:z-auto md:flex-shrink-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Main navigation"
        role="navigation"
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center" aria-hidden="true">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">BharatSeva AI</p>
              <p className="text-xs text-gray-500 leading-none mt-0.5">Citizen Copilot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.to} {...item} onClick={onClose} />
          ))}

          {isAdmin && (
            <>
              <div className="my-2 border-t border-gray-100" />
              <SidebarLink
                to="/admin"
                icon={ShieldCheck}
                label="Admin Dashboard"
                onClick={onClose}
              />
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-100 py-3 px-3 space-y-0.5">
          {BOTTOM_ITEMS.map((item) => (
            <SidebarLink key={item.to} {...item} onClick={onClose} />
          ))}
          <button
            onClick={logoutUser}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            aria-label="Log out of BharatSeva AI"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span>Log out</span>
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs font-medium text-gray-700 truncate">{user?.email || 'Citizen'}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role || 'citizen'}</p>
        </div>
      </aside>
    </>
  )
}

function SidebarLink({ to, icon: Icon, label, highlight, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
          isActive
            ? 'bg-blue-50 text-blue-700 font-semibold'
            : highlight
              ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={clsx(
              'w-4 h-4 flex-shrink-0',
              isActive && 'text-blue-600',
              highlight && !isActive && 'text-blue-500',
            )}
            aria-hidden="true"
          />
          <span className="flex-1">{label}</span>
          {highlight && !isActive && (
            <span className="badge bg-blue-100 text-blue-700 text-xs">AI</span>
          )}
        </>
      )}
    </NavLink>
  )
}
