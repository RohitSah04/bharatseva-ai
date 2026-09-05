import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { adminService } from '@/services/adminService'
import { SkeletonCard, SkeletonBlock } from '@/components/LoadingSpinner'
import { ErrorState, EmptyState } from '@/components/ErrorState'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  Users, BarChart2, Brain, Search, Database, RefreshCw,
  CheckCircle, AlertCircle, Clock, TrendingUp,
} from 'lucide-react'
import clsx from 'clsx'

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6']

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

function Panel({ title, icon: Icon, children, className = '' }) {
  return (
    <motion.div variants={fadeUp} className={clsx('card p-5', className)}>
      <h2 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-indigo-500" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </motion.div>
  )
}

function KbStatusBadge({ status }) {
  const map = {
    COMPLETED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400',
    PENDING:   'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400',
    FAILED:    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    STALE:     'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  }
  return <span className={clsx('badge text-[10px] font-semibold', map[status] || map.PENDING)}>{status}</span>
}

function ConfidenceBadge({ value }) {
  const pct = Math.round((value || 0) * 100)
  const cls = pct >= 80
    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400'
    : pct >= 50
      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  return <span className={clsx('badge text-xs', cls)}>{pct}%</span>
}

export default function AdminAnalyticsPage() {
  const [userGrowth,    setUserGrowth]    = useState(null)
  const [popularSchemes,setPopularSchemes]= useState(null)
  const [agentPerf,     setAgentPerf]     = useState(null)
  const [searchTrends,  setSearchTrends]  = useState(null)
  const [kbStatus,      setKbStatus]      = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [refreshing,    setRefreshing]    = useState(false)

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const [g, p, a, s, k] = await Promise.allSettled([
        adminService.getUserGrowth(),
        adminService.getPopularSchemes(),
        adminService.getAgentPerformance(),
        adminService.getSearchTrends(),
        adminService.getKbStatus(),
      ])
      if (g.status === 'fulfilled') setUserGrowth(g.value.data)
      if (p.status === 'fulfilled') setPopularSchemes(p.value.data)
      if (a.status === 'fulfilled') setAgentPerf(a.value.data)
      if (s.status === 'fulfilled') setSearchTrends(s.value.data)
      if (k.status === 'fulfilled') setKbStatus(k.value.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Normalise backend response shapes
  const growthData   = userGrowth?.user_growth || (Array.isArray(userGrowth) ? userGrowth : [])
  const savedData    = popularSchemes?.most_saved || []
  const checkedData  = popularSchemes?.most_checked || []
  const agentData    = agentPerf?.agent_performance || (Array.isArray(agentPerf) ? agentPerf : [])
  const trendsData   = searchTrends?.search_trends || (Array.isArray(searchTrends) ? searchTrends : [])
  const kbSources    = kbStatus?.kb_sources || []
  const kbStale      = kbStatus?.stale_count || 0
  const totalUsers   = userGrowth?.total_users

  const hasData = growthData.length > 0 || savedData.length > 0 || agentData.length > 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="grid sm:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }
  if (error) return <ErrorState message={error} onRetry={fetchAll} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Live platform metrics from the database
            {totalUsers != null && ` · ${totalUsers} total users`}
          </p>
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          className="btn-secondary text-sm"
          aria-label="Refresh analytics"
        >
          <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin')} aria-hidden="true" />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {!hasData && (
        <EmptyState
          title="No analytics data yet"
          description="As users interact with the platform, live metrics will appear here — user growth, popular schemes, agent performance, and search trends."
          variant="search"
        />
      )}

      <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
        {/* User Growth */}
        {growthData.length > 0 && (
          <Panel title="User Registrations (last 30 days)" icon={Users}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={[...growthData].reverse()} margin={{ left: 0, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d?.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(v) => [v, 'New Users']}
                />
                <Line
                  type="monotone" dataKey="count"
                  stroke="#6366f1" strokeWidth={2.5} dot={false}
                  activeDot={{ r: 4, fill: '#6366f1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        )}

        {/* Popular Schemes — 2 col */}
        {(savedData.length > 0 || checkedData.length > 0) && (
          <div className="grid sm:grid-cols-2 gap-6">
            {savedData.length > 0 && (
              <Panel title="Most Saved Schemes" icon={TrendingUp}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={savedData.slice(0, 8)} layout="vertical" margin={{ left: 80, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="scheme_name" tick={{ fontSize: 9 }} width={80} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v) => [v, 'Saves']} />
                    <Bar dataKey="save_count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
            )}
            {checkedData.length > 0 && (
              <Panel title="Most Eligibility-Checked" icon={CheckCircle}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={checkedData.slice(0, 8)} layout="vertical" margin={{ left: 80, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="scheme_name" tick={{ fontSize: 9 }} width={80} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v) => [v, 'Checks']} />
                    <Bar dataKey="check_count" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
            )}
          </div>
        )}

        {/* Agent Performance */}
        {agentData.length > 0 && (
          <Panel title="Agent Performance" icon={Brain}>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm" aria-label="Agent performance metrics">
                <thead>
                  <tr className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <th className="pb-3 pr-4">Agent</th>
                    <th className="pb-3 pr-4 text-right">Calls</th>
                    <th className="pb-3 pr-4 text-right">Avg Latency</th>
                    <th className="pb-3 pr-4 text-right">Avg Confidence</th>
                    <th className="pb-3 text-right">Fallback Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {agentData.map((agent, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 pr-4 font-semibold text-slate-900 dark:text-white font-mono text-xs">
                        {agent.agent_name}
                      </td>
                      <td className="py-2.5 pr-4 text-right text-slate-600 dark:text-slate-400">
                        {(agent.call_count || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-4 text-right text-slate-600 dark:text-slate-400">
                        {agent.avg_latency_ms != null ? `${Math.round(agent.avg_latency_ms)}ms` : '—'}
                      </td>
                      <td className="py-2.5 pr-4 text-right">
                        {agent.avg_confidence != null
                          ? <ConfidenceBadge value={agent.avg_confidence} />
                          : '—'}
                      </td>
                      <td className="py-2.5 text-right">
                        <span className={clsx(
                          'text-xs font-semibold',
                          (agent.fallback_rate || 0) > 0.5
                            ? 'text-red-600 dark:text-red-400'
                            : (agent.fallback_rate || 0) > 0.2
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400',
                        )}>
                          {agent.fallback_rate != null ? `${Math.round(agent.fallback_rate * 100)}%` : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {/* Search Trends + KB Status — 2 col */}
        <div className="grid sm:grid-cols-2 gap-6">
          {trendsData.length > 0 && (
            <Panel title="Top Search Queries" icon={Search}>
              <ul className="space-y-2">
                {trendsData.slice(0, 12).map((t, i) => (
                  <li key={i} className="flex items-center justify-between text-sm gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-slate-400 w-5 text-right flex-shrink-0">{i + 1}</span>
                      <span className="text-slate-700 dark:text-slate-300 truncate">{t.query || t.term}</span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 font-medium">
                      {t.count}×
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {kbSources.length > 0 && (
            <Panel title={`Knowledge Base Sources ${kbStale > 0 ? `· ${kbStale} stale` : ''}`} icon={Database}>
              <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {kbSources.map((src) => (
                  <li key={src.id} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{src.source_name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {src.document_count} docs · verified {src.last_verified_date}
                      </p>
                    </div>
                    <KbStatusBadge status={src.is_stale ? 'STALE' : src.ingest_status} />
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </motion.div>
    </div>
  )
}
