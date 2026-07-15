import { useEffect, useState } from 'react'
import { adminService } from '@/services/adminService'
import { PageLoader } from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/ErrorState'
import { Search, Filter } from 'lucide-react'
import clsx from 'clsx'

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ fallback_only: false, agent_name: '' })
  const [page, setPage] = useState(1)

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, per_page: 25 }
      if (filters.fallback_only) params.fallback_only = true
      if (filters.agent_name) params.agent_name = filters.agent_name
      const res = await adminService.getAuditLogs(params)
      setLogs(res.data?.logs || res.data || [])
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [filters, page])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Audit Logs</h1>
        <p className="text-sm text-gray-500">Agent invocations and eligibility check audit trail</p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <label htmlFor="agent-filter" className="text-sm text-gray-700 whitespace-nowrap">Agent:</label>
          <input
            id="agent-filter"
            type="text"
            className="input-field py-1.5 text-sm w-40"
            placeholder="e.g. eligibility"
            value={filters.agent_name}
            onChange={(e) => setFilters((f) => ({ ...f, agent_name: e.target.value }))}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.fallback_only}
            onChange={(e) => setFilters((f) => ({ ...f, fallback_only: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600"
          />
          Fallback only
        </label>
      </div>

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLogs} />
      ) : logs.length === 0 ? (
        <div className="card p-8 text-center text-gray-500 text-sm">No audit logs found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm" aria-label="Audit logs">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Fallback</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{log.agent_name}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{log.user_id?.substring(0, 8) || '—'}...</td>
                  <td className="px-4 py-3">
                    {log.confidence_score != null ? (
                      <span className={clsx('badge text-xs', log.confidence_score >= 0.8 ? 'bg-emerald-100 text-emerald-800' : log.confidence_score >= 0.5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-700')}>
                        {Math.round(log.confidence_score * 100)}%
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{log.latency_ms ? `${log.latency_ms}ms` : '—'}</td>
                  <td className="px-4 py-3">
                    {log.fallback_used
                      ? <span className="badge bg-amber-100 text-amber-800 text-xs">Yes</span>
                      : <span className="badge bg-gray-100 text-gray-600 text-xs">No</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
