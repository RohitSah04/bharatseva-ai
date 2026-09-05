import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminService } from '@/services/adminService'
import { StatCard } from '@/components/StatCard'
import { ErrorState } from '@/components/ErrorState'
import { SkeletonBlock } from '@/components/LoadingSpinner'
import {
  Users, Database, Cpu, Activity, RefreshCw, CheckCircle,
  AlertTriangle, ShieldCheck, Zap, X, FileText, BarChart2,
  BookOpen, Clock, TrendingUp, Server, Wifi, WifiOff,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

function StatusBadge({ status }) {
  const map = {
    ok:               'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400',
    active:           'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400',
    ready:            'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400',
    degraded:         'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400',
    empty:            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    not_initialised:  'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    error:            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  }
  return (
    <span className={clsx('badge text-xs font-semibold', map[status] || map.empty)}>
      {status}
    </span>
  )
}

function ComponentCard({ icon: Icon, label, status, detail, color = 'blue' }) {
  const colors = {
    blue:   'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    green:  'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    orange: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  }
  return (
    <motion.div variants={fadeUp} className="card p-4 flex items-start gap-3">
      <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', colors[color])} aria-hidden="true">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{label}</p>
          <StatusBadge status={status} />
        </div>
        {detail && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{detail}</p>}
      </div>
    </motion.div>
  )
}

function ActivityRow({ log }) {
  const agentColors = {
    eligibility:          'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
    document_verification:'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
    scheme_discovery:     'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    goal_planning:        'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    conversation:         'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
  }
  const colorClass = Object.entries(agentColors).find(([k]) => log.agent_name?.startsWith(k))?.[1]
    || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className={clsx('badge text-[10px] font-semibold flex-shrink-0', colorClass)}>
        {log.agent_name}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          User {log.user_id?.substring(0, 8) || 'anonymous'}...
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {log.fallback_used && (
          <span className="badge text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            fallback
          </span>
        )}
        <span className="text-[10px] text-slate-400 whitespace-nowrap">
          {log.latency_ms}ms
        </span>
        <span className="text-[10px] text-slate-400 whitespace-nowrap">
          {log.created_at ? new Date(log.created_at).toLocaleTimeString('en-IN') : ''}
        </span>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [resetMsg, setResetMsg] = useState(null)
  const [error, setError] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminService.getSystemHealth()
      setHealth(res.data)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load system health')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleDemoReset = async () => {
    setConfirmReset(false)
    setResetting(true)
    try {
      const res = await adminService.demoReset()
      setResetMsg(`Demo reset complete — ${res.data?.rows_deleted || 0} rows deleted.`)
      setTimeout(() => { setResetMsg(null); fetchData() }, 4000)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Demo reset failed')
    } finally {
      setResetting(false)
    }
  }

  const vs = health?.vector_store || {}
  const vsStatus = typeof vs === 'string' ? 'unknown' : vs.status || 'unknown'
  const vsDetail = typeof vs === 'string' ? vs : vs.detail || (vs.collections != null ? `${vs.collections} collections · ${vs.total_documents} docs` : '')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-indigo-500" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Overview</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Live platform health and statistics</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={fetchData} className="btn-secondary text-sm" aria-label="Refresh data">
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Refresh
          </button>
          <button onClick={() => navigate('/admin/analytics')} className="btn-secondary text-sm">
            <Activity className="w-4 h-4" aria-hidden="true" />
            Analytics
          </button>
          <button
            onClick={() => setConfirmReset(true)}
            disabled={resetting}
            className="btn-danger text-sm"
            aria-label="Reset demo data"
          >
            <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} aria-hidden="true" />
            Demo Reset
          </button>
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmReset && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="reset-dialog-title"
          aria-describedby="reset-dialog-desc"
          className="card p-5 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p id="reset-dialog-title" className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Reset demo data?</p>
              <p id="reset-dialog-desc" className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                Deletes applications, goals, chat history, notifications, documents, and agent logs.
                Schemes and user accounts are NOT deleted.
              </p>
              <div className="flex gap-2">
                <button onClick={handleDemoReset} className="btn-danger text-sm py-1.5 px-3">Yes, reset</button>
                <button onClick={() => setConfirmReset(false)} className="btn-secondary text-sm py-1.5 px-3">Cancel</button>
              </div>
            </div>
            <button onClick={() => setConfirmReset(false)} className="p-1 text-slate-400 hover:text-slate-600" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {resetMsg && (
        <div role="alert" aria-live="polite" className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {resetMsg}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={fetchData} />}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonBlock key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : health && (
        <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
          {/* KPI tiles */}
          <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Users',     value: health.users,             icon: Users,    color: 'blue'   },
              { label: 'Active Schemes',  value: health.active_schemes,    icon: BookOpen, color: 'teal'   },
              { label: 'Documents',       value: health.documents,          icon: FileText, color: 'purple' },
              { label: 'Applications',    value: health.applications,       icon: BarChart2,color: 'orange' },
              { label: 'Eligibility Chks',value: health.eligibility_checks, icon: TrendingUp,color:'green' },
              { label: 'Agent Log Entries',value: health.agent_log_entries, icon: Activity, color: 'blue'  },
            ].map(({ label, value, icon, color }) => (
              <motion.div key={label} variants={fadeUp}>
                <StatCard label={label} value={value ?? 0} icon={icon} color={color} />
              </motion.div>
            ))}
          </motion.div>

          {/* Component health grid */}
          <motion.div variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ComponentCard
              icon={Server}
              label="Database"
              status="ok"
              detail={`${health.db_size_mb ?? 0} MB SQLite`}
              color="blue"
            />
            <ComponentCard
              icon={health.ai_status === 'ok' ? Wifi : WifiOff}
              label="IBM watsonx.ai"
              status={health.ai_status || 'degraded'}
              detail={health.ai_detail || '—'}
              color={health.ai_status === 'ok' ? 'green' : 'orange'}
            />
            <ComponentCard
              icon={Database}
              label="Vector Store"
              status={vsStatus}
              detail={vsDetail || '—'}
              color={vsStatus === 'active' ? 'green' : 'orange'}
            />
            <ComponentCard
              icon={Zap}
              label="AI Fallback Rate"
              status={health.overall_fallback_rate > 0.5 ? 'degraded' : 'ok'}
              detail={`${Math.round((health.overall_fallback_rate || 0) * 100)}% of calls use fallback`}
              color={health.overall_fallback_rate > 0.5 ? 'orange' : 'green'}
            />
          </motion.div>

          {/* Recent activity */}
          {health.recent_activity?.length > 0 && (
            <motion.div variants={fadeUp} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" aria-hidden="true" />
                  Recent Agent Activity
                </h2>
                <button
                  onClick={() => navigate('/admin/audit')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View all →
                </button>
              </div>
              <div>
                {health.recent_activity.map((log) => (
                  <ActivityRow key={log.id} log={log} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick nav */}
          <motion.div variants={stagger} className="grid sm:grid-cols-3 gap-4">
            {[
              { to: '/admin/analytics', icon: Activity,    label: 'Analytics',     desc: 'User growth, popular schemes, agent performance' },
              { to: '/admin/audit',     icon: ShieldCheck, label: 'Audit Logs',    desc: 'Agent invocation history and fallback analysis' },
              { to: '/admin/flags',     icon: Zap,         label: 'Feature Flags', desc: 'Toggle features at runtime without redeploy' },
            ].map(({ to, icon: Icon, label, desc }) => (
              <motion.button
                key={to}
                variants={fadeUp}
                onClick={() => navigate(to)}
                className="card-hover p-5 text-left"
                aria-label={`Navigate to ${label}`}
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-3" aria-hidden="true">
                  <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="font-semibold text-slate-900 dark:text-white mb-1 text-sm">{label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
