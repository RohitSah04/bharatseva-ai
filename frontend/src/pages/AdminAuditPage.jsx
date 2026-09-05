import { useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { adminService } from '@/services/adminService'
import { SkeletonBlock } from '@/components/LoadingSpinner'
import { ErrorState, EmptyState } from '@/components/ErrorState'
import { ShieldCheck, ChevronLeft, ChevronRight, Search, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const AGENT_NAMES = [
  'eligibility',
  'document_verification',
  'scheme_discovery',
  'goal_planning',
  'conversation',
  'translation',
]

const AGENT_COLORS = {
  eligibility:           'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
  document_verification: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
  scheme_discovery:      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  goal_planning:         'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  conversation:          'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
  translation:           'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
}

function agentColor(name) {
  const key = Object.keys(AGENT_COLORS).find((k) => name?.startsWith(k))
  return key ? AGENT_COLORS[key] : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
}

function ConfidenceBadge({ value }) {
  if (value == null) return <span className="text-slate-400">—</span>
  const pct = Math.round(value * 100)
  const cls = pct >= 80
    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400'
    : pct >= 50
      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  return <span className={clsx('badge text-xs', cls)}>{pct}%</span>
}

function SkeletonRows() {
  return Array.from({ length: 8 }).map((_, i) => (
    <tr key={i}>
      {Array.from({ length: 6 }).map((__, j) => (
        <td key={j} className="px-4 py-3">
          <SkeletonBlock className="h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  ))
}

export default function AdminAuditPage() {
  const [logs,     setLogs]     = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [page,     setPage]     = useState(1)
  const [filters,  setFilters]  = useState({ fallback_only: false, agent_name: '' })
  const PER_PAGE = 25

  // Debounce agent name input
  const debounceRef = useRef(null)

  const fetchLogs = useCallback(async (pg = 1, filt = filters) => {
    setLoading(true)
    setError(null)
    try {
      const params = { page: pg, per_page: PER_PAGE }
      if (filt.fallback_only) params.fallback_only = true
      if (filt.agent_name)    params.agent_name = filt.agent_name.trim()
      const res = await adminService.getAuditLogs(params)
      // Backend returns agent_logs (or logs alias added in Phase 5)
      const data = res.data
      const entries = data?.agent_logs || data?.logs || (Array.isArray(data) ? data : [])
      setLogs(entries)
      setTotal(data?.total ?? entries.length)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchLogs(page, filters)
  }, [page]) // eslint-disable-line

  // When filters change, reset to page 1 and fetch (with debounce for text)
  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters)
    setPage(1)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchLogs(1, newFilters), 400)
  }, [fetchLogs])

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const from = (page - 1) * PER_PAGE + 1
  const to   = Math.min(page * PER_PAGE, total)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-indigo-500" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Logs</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time agent invocation history · {total.toLocaleString()} total entries
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-4 items-center">
        {/* Agent name filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="agent-filter" className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Agent:
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <input
              id="agent-filter"
              type="text"
              list="agent-list"
              className="input-field pl-8 py-1.5 text-sm w-48"
              placeholder="Filter by agent…"
              value={filters.agent_name}
              onChange={(e) => applyFilters({ ...filters, agent_name: e.target.value })}
            />
            <datalist id="agent-list">
              {AGENT_NAMES.map((n) => <option key={n} value={n} />)}
            </datalist>
          </div>
        </div>

        {/* Fallback-only toggle */}
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
          <div
            role="switch"
            aria-checked={filters.fallback_only}
            aria-label="Show fallback-only logs"
            tabIndex={0}
            onClick={() => applyFilters({ ...filters, fallback_only: !filters.fallback_only })}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters({ ...filters, fallback_only: !filters.fallback_only })}
            className={clsx(
              'relative w-9 h-5 rounded-full transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500',
              filters.fallback_only ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700',
            )}
          >
            <span className={clsx(
              'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
              filters.fallback_only ? 'left-4' : 'left-0.5',
            )} />
          </div>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
          Fallback only
        </label>

        {/* Clear filters */}
        {(filters.agent_name || filters.fallback_only) && (
          <button
            onClick={() => applyFilters({ fallback_only: false, agent_name: '' })}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline ml-auto"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      {error ? (
        <ErrorState message={error} onRetry={() => fetchLogs(page)} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm" aria-label="Agent audit logs">
            <thead className="bg-slate-50 dark:bg-slate-800/80">
              <tr className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th scope="col" className="px-4 py-3">Agent</th>
                <th scope="col" className="px-4 py-3">User</th>
                <th scope="col" className="px-4 py-3 text-right">Confidence</th>
                <th scope="col" className="px-4 py-3 text-right">Latency</th>
                <th scope="col" className="px-4 py-3 text-center">Fallback</th>
                <th scope="col" className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {loading ? (
                <SkeletonRows />
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <EmptyState
                      title="No logs found"
                      description={filters.agent_name || filters.fallback_only
                        ? 'Try removing filters to see all entries.'
                        : 'Agent activity logs appear here once users interact with the platform.'}
                      variant="notifications"
                    />
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Agent name */}
                    <td className="px-4 py-3">
                      <span className={clsx('badge text-[11px] font-semibold', agentColor(log.agent_name))}>
                        {log.agent_name}
                      </span>
                    </td>

                    {/* User ID */}
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">
                      {log.user_id ? `${log.user_id.substring(0, 8)}…` : '—'}
                    </td>

                    {/* Confidence */}
                    <td className="px-4 py-3 text-right">
                      <ConfidenceBadge value={log.confidence_score ?? log.confidence} />
                    </td>

                    {/* Latency */}
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400 font-mono text-xs">
                      {log.latency_ms != null ? `${log.latency_ms}ms` : '—'}
                    </td>

                    {/* Fallback */}
                    <td className="px-4 py-3 text-center">
                      {log.fallback_used
                        ? <span className="badge text-[11px] bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">Yes</span>
                        : <span className="badge text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">No</span>
                      }
                    </td>

                    {/* Timestamp */}
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                        : '—'}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && total > PER_PAGE && (
        <div className="flex items-center justify-between gap-4 px-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium min-w-[80px] text-center">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
