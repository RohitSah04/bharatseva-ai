import { useEffect, useState } from 'react'
import { adminService } from '@/services/adminService'
import { StatCard } from '@/components/StatCard'
import { ErrorState } from '@/components/ErrorState'
import { PageLoader } from '@/components/LoadingSpinner'
import {
  Users, Database, Cpu, Activity, RefreshCw, CheckCircle,
  AlertTriangle, ShieldCheck, Zap,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [resetMsg, setResetMsg] = useState(null)
  const [error, setError] = useState(null)

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
    if (!window.confirm('Reset demo data? This will clear non-essential data (applications, goals, chat, notifications, documents). Schemes and users are NOT deleted.')) return
    setResetting(true)
    try {
      const res = await adminService.demoReset()
      setResetMsg(`Demo reset complete. ${res.data?.rows_deleted || 0} rows deleted.`)
      setTimeout(() => setResetMsg(null), 5000)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Demo reset failed')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-blue-400" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
          </div>
          <p className="text-sm text-gray-500">System status and quick actions</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => navigate('/admin/analytics')} className="btn-secondary text-sm">
            <Activity className="w-4 h-4" aria-hidden="true" />
            Analytics
          </button>
          <button
            onClick={handleDemoReset}
            disabled={resetting}
            className="btn-danger text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} aria-hidden="true" />
            Demo Reset
          </button>
        </div>
      </div>

      {resetMsg && (
        <div role="alert" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {resetMsg}
        </div>
      )}

      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={fetchData} /> : (
        <>
          {/* System status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="API Status" value={health?.status === 'ok' ? 'Online' : 'Degraded'} icon={Zap} color={health?.status === 'ok' ? 'green' : 'red'} />
            <StatCard label="Database" value={health?.db || '—'} icon={Database} color="blue" />
            <StatCard label="AI Provider" value={health?.ai_provider || '—'} icon={Cpu} color={health?.ai_provider === 'ok' ? 'green' : 'orange'} />
            <StatCard label="Vector Store" value={health?.vector_store || '—'} icon={Activity} color="purple" />
          </div>

          {/* Raw health data */}
          {health && (
            <div className="card p-5">
              <h2 className="section-title mb-3">System Details</h2>
              <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg overflow-auto max-h-48">
                {JSON.stringify(health, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}

      {/* Quick navigation */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/admin/analytics', icon: Activity, label: 'Analytics', desc: 'User growth, popular schemes, agent performance' },
          { to: '/admin/audit', icon: ShieldCheck, label: 'Audit Logs', desc: 'Eligibility checks and agent logs' },
          { to: '/admin/flags', icon: Zap, label: 'Feature Flags', desc: 'Toggle features at runtime' },
        ].map(({ to, icon: Icon, label, desc }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="card-hover p-5 text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3" aria-hidden="true">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">{label}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
