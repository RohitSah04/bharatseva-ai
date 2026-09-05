import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Search, Cpu, FileText, ClipboardList,
  Calendar, MessageSquare, Bookmark, Bell, User, Settings,
  LogOut, ShieldCheck, X, ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

/* ── BharatSeva wordmark ───────────────────────────────────────────────────── */
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

/* ── Nav link ──────────────────────────────────────────────────────────────── */
function SidebarLink({ to, icon: Icon, label, highlight, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          'group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 relative',
          isActive
            ? 'bg-[rgb(var(--ds-s2))] text-[rgb(var(--ds-ink))]'
            : 'text-[rgb(var(--ds-ink-s))] hover:bg-[rgb(var(--ds-s1))] hover:text-[rgb(var(--ds-ink))]',
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active accent bar */}
          {isActive && (
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full"
              style={{ background: 'rgb(var(--ds-accent))' }}
              aria-hidden="true"
            />
          )}
          <Icon
            className={clsx(
              'w-4 h-4 flex-shrink-0 transition-colors',
              isActive ? 'text-[rgb(var(--ds-accent))]' : 'text-[rgb(var(--ds-ink-s))] group-hover:text-[rgb(var(--ds-ink-m))]',
              highlight && !isActive && 'text-[rgb(var(--ds-accent))]',
            )}
            aria-hidden="true"
          />
          <span className="flex-1 leading-none">{label}</span>
          {highlight && !isActive && (
            <span className="badge-ibm text-[10px] px-1.5 py-0.5">AI</span>
          )}
        </>
      )}
    </NavLink>
  )
}

/* ── Sidebar ────────────────────────────────────────────────────────────────── */
export function Sidebar({ open, onClose }) {
  const { user, logoutUser } = useAuth()
  const { t } = useTranslation()
  const isAdmin = user?.role === 'admin'

  const NAV_ITEMS = [
    { to: '/dashboard',  icon: LayoutDashboard, label: t('dashboard') },
    { to: '/schemes',    icon: Search,          label: t('schemes') },
    { to: '/copilot',    icon: Cpu,             label: t('copilot'), highlight: true },
    { to: '/documents',  icon: FileText,        label: t('documents') },
    { to: '/tracker',    icon: ClipboardList,   label: t('tracker') },
    { to: '/deadlines',  icon: Calendar,        label: t('calendar') },
    { to: '/chat',       icon: MessageSquare,   label: t('chat') },
    { to: '/saved',      icon: Bookmark,        label: t('saved_schemes') },
  ]

  const BOTTOM_ITEMS = [
    { to: '/notifications', icon: Bell,     label: t('notifications') },
    { to: '/profile',       icon: User,     label: t('profile') },
    { to: '/settings',      icon: Settings, label: t('settings') },
  ]

  const avatarLetter = user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.65)' }}
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <aside
        className={clsx(
          'fixed left-0 top-0 bottom-0 w-56 z-50 flex flex-col transition-transform duration-250',
          'md:static md:translate-x-0 md:z-auto md:flex-shrink-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{
          background: 'rgb(var(--ds-canvas))',
          borderRight: '1px solid rgb(var(--ds-hl))',
        }}
        aria-label="Main navigation"
        role="navigation"
      >
        {/* Header — 56px height per DESIGN.md top-nav */}
        <div
          className="h-14 flex items-center justify-between px-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgb(var(--ds-hl))' }}
        >
          <div className="flex items-center gap-2.5">
            <BSLogo />
            <div>
              <p className="text-[13px] font-semibold leading-none" style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.02em' }}>
                BharatSeva AI
              </p>
              <p className="text-[11px] leading-none mt-0.5" style={{ color: 'rgb(var(--ds-ink-s))' }}>
                Citizen Copilot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-md transition-colors"
            style={{ color: 'rgb(var(--ds-ink-s))' }}
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-hide" aria-label="Navigation">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.to} {...item} onClick={onClose} />
          ))}

          {isAdmin && (
            <>
              <div className="hairline my-2 mx-3" />
              <SidebarLink
                to="/admin"
                icon={ShieldCheck}
                label={t('admin_dashboard')}
                onClick={onClose}
              />
            </>
          )}
        </nav>

        {/* Bottom actions */}
        <div
          className="py-2 px-2 space-y-0.5"
          style={{ borderTop: '1px solid rgb(var(--ds-hl))' }}
        >
          {BOTTOM_ITEMS.map((item) => (
            <SidebarLink key={item.to} {...item} onClick={onClose} />
          ))}
          <button
            onClick={logoutUser}
            className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150"
            style={{ color: 'rgb(var(--ds-ink-s))' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(220,38,38,0.08)'
              e.currentTarget.style.color = '#f87171'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = ''
              e.currentTarget.style.color = 'rgb(var(--ds-ink-s))'
            }}
            aria-label="Log out of BharatSeva AI"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="leading-none">{t('logout')}</span>
          </button>
        </div>

        {/* User footer */}
        <div
          className="px-3 py-3 flex items-center gap-2.5"
          style={{ borderTop: '1px solid rgb(var(--ds-hl))', background: 'rgb(var(--ds-s1))' }}
        >
          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold text-white"
            style={{ background: 'rgb(var(--ds-accent))' }}
            aria-hidden="true"
          >
            {avatarLetter}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium truncate leading-none" style={{ color: 'rgb(var(--ds-ink-m))' }}>
              {user?.email || 'Citizen'}
            </p>
            <p className="text-[11px] capitalize leading-none mt-0.5" style={{ color: 'rgb(var(--ds-ink-s))' }}>
              {user?.role || 'citizen'}
            </p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgb(var(--ds-ink-3))' }} aria-hidden="true" />
        </div>
      </aside>
    </>
  )
}
