import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { ShieldCheck, LayoutDashboard, BarChart2, Flag, FileSearch, Zap, LogOut, ChevronLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import clsx from 'clsx'

const ADMIN_NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/admin/audit', icon: FileSearch, label: 'Audit Logs' },
  { to: '/admin/flags', icon: Flag, label: 'Feature Flags' },
]

export function AdminLayout() {
  const { logoutUser, user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Admin sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col fixed top-0 bottom-0" aria-label="Admin navigation">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-gray-800 flex-shrink-0">
          <div className="w-6 h-6 rounded-md gradient-brand flex items-center justify-center" aria-hidden="true">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-none">BharatSeva AI</p>
            <p className="text-xs text-gray-400 leading-none">Admin Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 mx-3 mt-3 rounded-lg bg-gray-800 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-white font-medium truncate">{user?.email || 'Admin'}</p>
            <p className="text-gray-400">Administrator</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                )
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4 space-y-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            Back to App
          </button>
          <button
            onClick={logoutUser}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-red-900/40 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-56">
        <main className="p-6 min-h-screen" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
