import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminService } from '@/services/adminService'
import { SkeletonBlock } from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/ErrorState'
import {
  Users, Search, ShieldCheck, ShieldOff, UserCheck, UserX,
  ChevronLeft, ChevronRight, RefreshCw, Filter, X, Crown,
  User, MoreVertical, CheckCircle2, XCircle,
} from 'lucide-react'
import clsx from 'clsx'

// Lightweight inline notification — no external dependency
function Notify({ msg, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000)
    return () => clearTimeout(t)
  }, [onDismiss])
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20 }}
      className={clsx(
        'fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium',
        type === 'success'
          ? 'bg-emerald-600 text-white'
          : 'bg-red-600 text-white',
      )}
      role="status"
      aria-live="polite"
    >
      {type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" /> : <XCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />}
      {msg}
      <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100" aria-label="Dismiss">
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </motion.div>
  )
}

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } }
const fadeUp  = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } }

function RoleBadge({ role }) {
  return role === 'admin'
    ? <span className="inline-flex items-center gap-1 badge badge-amber text-xs font-semibold"><Crown className="w-3 h-3" aria-hidden="true" />Admin</span>
    : <span className="badge badge-indigo text-xs font-semibold">Citizen</span>
}

function StatusBadge({ active }) {
  return active
    ? <span className="inline-flex items-center gap-1 badge badge-emerald text-xs"><CheckCircle2 className="w-3 h-3" aria-hidden="true" />Active</span>
    : <span className="inline-flex items-center gap-1 badge badge-red text-xs"><XCircle className="w-3 h-3" aria-hidden="true" />Suspended</span>
}

function UserActions({ user, onAction }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-lg transition-colors"
        style={{ color: 'rgb(var(--ds-ink-s))' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgb(var(--ds-s2))' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        aria-label={`Actions for ${user.email}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreVertical className="w-4 h-4" aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 mt-1 w-48 rounded-xl z-20 py-1"
            style={{ background: 'rgb(var(--ds-s1))', border: '1px solid rgb(var(--ds-hl))', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
            role="menu"
          >
            {user.is_active ? (
              <button
                onClick={() => { onAction(user.user_id, 'status', 'suspend'); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                style={{ color: '#f87171' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                role="menuitem"
              >
                <UserX className="w-4 h-4" aria-hidden="true" /> Suspend User
              </button>
            ) : (
              <button
                onClick={() => { onAction(user.user_id, 'status', 'activate'); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                style={{ color: '#27a644' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(39,166,68,0.06)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                role="menuitem"
              >
                <UserCheck className="w-4 h-4" aria-hidden="true" /> Activate User
              </button>
            )}
            {user.role === 'citizen' ? (
              <button
                onClick={() => { onAction(user.user_id, 'role', 'admin'); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                style={{ color: 'rgb(var(--ds-accent))' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(94,106,210,0.06)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                role="menuitem"
              >
                <ShieldCheck className="w-4 h-4" aria-hidden="true" /> Promote to Admin
              </button>
            ) : (
              <button
                onClick={() => { onAction(user.user_id, 'role', 'citizen'); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                style={{ color: 'rgb(var(--ds-ink-m))' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgb(var(--ds-s2))' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                role="menuitem"
              >
                <ShieldOff className="w-4 h-4" aria-hidden="true" /> Demote to Citizen
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />}
    </div>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const PER_PAGE = 20

  const [search, setSearch]   = useState('')
  const [roleFilter, setRoleFilter]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [notify, setNotify] = useState(null) // { msg, type }

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.listUsers({
        page: p,
        per_page: PER_PAGE,
        ...(search      ? { search }      : {}),
        ...(roleFilter  ? { role: roleFilter }  : {}),
        ...(statusFilter? { status: statusFilter } : {}),
      })
      setUsers(data.users || [])
      setTotal(data.total || 0)
    } catch (e) {
      setError(e.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, statusFilter])

  useEffect(() => { load(page) }, [load, page])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    load(1)
  }

  const clearFilters = () => {
    setSearch('')
    setRoleFilter('')
    setStatusFilter('')
    setPage(1)
  }

  const handleAction = async (userId, type, value) => {
    setActionLoading(userId)
    try {
      if (type === 'status') {
        await adminService.updateUserStatus(userId, value)
        setNotify({ msg: `User ${value === 'suspend' ? 'suspended' : 'activated'} successfully.`, type: 'success' })
      } else {
        await adminService.updateUserRole(userId, value)
        setNotify({ msg: `Role changed to ${value}.`, type: 'success' })
      }
      await load(page)
    } catch (e) {
      setNotify({ msg: e.response?.data?.error?.message || `Failed to ${type === 'status' ? value : 'change role'}.`, type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = Math.ceil(total / PER_PAGE)
  const hasFilters = search || roleFilter || statusFilter

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" aria-hidden="true" />
            User Management
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgb(var(--ds-ink-s))' }}>
            {total} total users — search, filter, suspend, activate, and assign roles
          </p>
        </div>
        <button
          onClick={() => load(page)}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
          aria-label="Refresh users"
        >
          <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex gap-3 flex-wrap items-end">
          {/* Search */}
          <div className="flex-1 min-w-48">
            <label htmlFor="user-search" className="block text-xs font-medium mb-1" style={{ color: 'rgb(var(--ds-ink-m))' }}>Search by email</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(var(--ds-ink-s))' }} aria-hidden="true" />
              <input
                id="user-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="user@example.com"
                className="input-field pl-9"
              />
            </div>
          </div>

          {/* Role filter */}
          <div>
            <label htmlFor="role-filter" className="block text-xs font-medium mb-1" style={{ color: 'rgb(var(--ds-ink-m))' }}>Role</label>
            <select id="role-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field py-2 text-sm">
              <option value="">All Roles</option>
              <option value="citizen">Citizen</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label htmlFor="status-filter" className="block text-xs font-medium mb-1" style={{ color: 'rgb(var(--ds-ink-m))' }}>Status</label>
            <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field py-2 text-sm">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <button type="submit" className="btn-primary flex items-center gap-2">
            <Filter className="w-4 h-4" aria-hidden="true" /> Apply
          </button>

          {hasFilters && (
            <button type="button" onClick={clearFilters} className="btn-secondary flex items-center gap-2">
              <X className="w-4 h-4" aria-hidden="true" /> Clear
            </button>
          )}
        </form>
      </div>

      {/* User table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <SkeletonBlock key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => load(page)} />
      ) : users.length === 0 ? (
        <div className="card p-12 text-center">
          <User className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgb(var(--ds-ink-3))' }} aria-hidden="true" />
          <p style={{ color: 'rgb(var(--ds-ink-s))' }}>No users found matching your filters.</p>
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
          {users.map((user) => (
            <motion.div
              key={user.user_id}
              variants={fadeUp}
              className={clsx(
                'card p-4 flex items-center gap-4 flex-wrap',
                actionLoading === user.user_id && 'opacity-60 pointer-events-none',
              )}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm" aria-hidden="true">
                {user.email[0].toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold truncate" style={{ color: 'rgb(var(--ds-ink))' }}>{user.email}</span>
                  <RoleBadge role={user.role} />
                  <StatusBadge active={user.is_active} />
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs flex-wrap" style={{ color: 'rgb(var(--ds-ink-s))' }}>
                  {user.profile?.full_name && <span>{user.profile.full_name}</span>}
                  {user.profile?.state     && <span>· {user.profile.state}</span>}
                  {user.profile?.occupation && <span>· {user.profile.occupation}</span>}
                  <span>· Joined {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Profile completeness */}
              {user.profile?.completeness != null && (
                <div className="text-center flex-shrink-0 hidden sm:block">
                  <p className="text-xs mb-1" style={{ color: 'rgb(var(--ds-ink-3))' }}>Profile</p>
                  <div className="progress-track w-14">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(100, (user.profile.completeness || 0) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--ds-ink-3))' }}>{Math.round((user.profile.completeness || 0) * 100)}%</p>
                </div>
              )}

              {/* Actions */}
              {actionLoading === user.user_id ? (
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0" aria-label="Processing..." />
              ) : (
                <UserActions user={user} onAction={handleAction} />
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-between pt-2" aria-label="User list pagination">
          <p className="text-sm" style={{ color: 'rgb(var(--ds-ink-s))' }}>
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary py-1.5 px-3"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <span className="text-sm" style={{ color: 'rgb(var(--ds-ink-m))' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary py-1.5 px-3"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}

      {/* Inline notification */}
      <AnimatePresence>
        {notify && (
          <Notify
            msg={notify.msg}
            type={notify.type}
            onDismiss={() => setNotify(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
