import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  ShieldCheck, LayoutDashboard, BarChart2, Flag, FileSearch,
  LogOut, ChevronLeft, Menu, X, Users,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import clsx from 'clsx'

/* ── Nav data ─────────────────────────────────────────────────────────────────── */
const ADMIN_NAV = [
  { to: '/admin',           icon: LayoutDashboard, label: 'Overview',      end: true },
  { to: '/admin/analytics', icon: BarChart2,       label: 'Analytics' },
  { to: '/admin/users',     icon: Users,            label: 'Users' },
  { to: '/admin/audit',     icon: FileSearch,       label: 'Audit Logs' },
  { to: '/admin/flags',     icon: Flag,             label: 'Feature Flags' },
]

/* ── Sidebar logo mark ───────────────────────────────────────────────────────── */
function AdminLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="#5e6ad2" />
      <path d="M7 7h5a3 3 0 0 1 0 6H7V7zm0 6h5.5a3.5 3.5 0 0 1 0 4H7v-4z" fill="white" opacity="0.9" />
    </svg>
  )
}

/* ── Sidebar content ─────────────────────────────────────────────────────────── */
function SidebarContent({ user, navigate, logoutUser, onClose }) {
  return (
    <>
      {/* Brand header */}
      <div
        className="h-14 flex items-center gap-2.5 px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <AdminLogo />
        <div className="flex-1 min-w-0">
          <p
            className="text-[13px] font-semibold leading-none tracking-tight"
            style={{ color: 'rgba(255,255,255,0.9)' }}
          >
            BharatSeva AI
          </p>
          <p className="text-[11px] leading-none mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Admin Portal
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User badge */}
      <div
        className="flex items-center gap-2 mx-3 mt-3 px-3 py-2 rounded-lg"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#5e6ad2' }} aria-hidden="true" />
        <div className="min-w-0">
          <p
            className="text-[12px] font-medium leading-none truncate"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            {user?.email || 'Admin'}
          </p>
          <p className="text-[11px] leading-none mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Administrator
          </p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-3 space-y-0.5" aria-label="Admin navigation">
        {ADMIN_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors',
                isActive
                  ? 'text-white'
                  : 'hover:text-white',
              )
            }
            style={({ isActive }) => ({
              background: isActive ? 'rgba(94,106,210,0.25)' : 'transparent',
              color: isActive ? 'white' : 'rgba(255,255,255,0.45)',
              borderLeft: isActive ? '2px solid #5e6ad2' : '2px solid transparent',
            })}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-0.5">
        <button
          onClick={() => { navigate('/dashboard'); onClose?.() }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Back to App
        </button>
        <button
          onClick={logoutUser}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Log out
        </button>
      </div>
    </>
  )
}

/* ── AdminLayout ─────────────────────────────────────────────────────────────── */
export function AdminLayout() {
  const { logoutUser, user } = useAuth()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  /* The admin panel uses a dark sidebar (#0e0e11) regardless of user theme */
  const SIDEBAR_BG = '#0e0e11'

  return (
    <div
      className="min-h-screen flex transition-colors"
      style={{ background: 'rgb(var(--ds-canvas))' }}
    >
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex w-56 flex-col fixed top-0 bottom-0"
        style={{ background: SIDEBAR_BG, borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <SidebarContent
          user={user}
          navigate={navigate}
          logoutUser={logoutUser}
          onClose={null}
        />
      </aside>

      {/* ── Mobile backdrop ─────────────────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          aria-hidden="true"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      <aside
        className={clsx(
          'fixed top-0 bottom-0 left-0 z-40 w-64 flex flex-col',
          'transform transition-transform duration-200 ease-in-out md:hidden',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ background: SIDEBAR_BG, borderRight: '1px solid rgba(255,255,255,0.06)' }}
        aria-label="Admin navigation"
        aria-hidden={!drawerOpen}
      >
        <SidebarContent
          user={user}
          navigate={navigate}
          logoutUser={logoutUser}
          onClose={() => setDrawerOpen(false)}
        />
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 md:ml-56 min-w-0">

        {/* Mobile topbar */}
        <div
          className="md:hidden h-14 flex items-center gap-3 px-4 sticky top-0 z-20"
          style={{ background: SIDEBAR_BG, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            aria-controls="admin-mobile-drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <AdminLogo />
            <span
              className="text-[13px] font-semibold"
              style={{ color: 'rgba(255,255,255,0.9)' }}
            >
              Admin Portal
            </span>
          </div>
        </div>

        <main
          className="p-4 md:p-6 min-h-screen"
          id="main-content"
          tabIndex={-1}
          aria-label="Admin main content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
