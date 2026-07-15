import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Bell, Cpu, Clock, CheckCircle, FileText,
  TrendingUp, ChevronRight, Bookmark, Calendar, AlertCircle,
} from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { useSchemes } from '@/hooks/useSchemes'
import { useNotifications } from '@/hooks/useNotifications'
import { ProfileCompletenessRing } from '@/components/ProfileCompletenessRing'
import { SchemeCard } from '@/components/SchemeCard'
import { PageLoader, SkeletonCard } from '@/components/LoadingSpinner'
import { StatCard } from '@/components/StatCard'
import { deadlineService } from '@/services/deadlineService'
import { applicationService } from '@/services/applicationService'
import clsx from 'clsx'

function QuickAction({ icon: Icon, label, to, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
  }
  return (
    <Link to={to} className={clsx('flex flex-col items-center gap-2 p-4 rounded-xl transition-colors', colors[color])}>
      <Icon className="w-6 h-6" aria-hidden="true" />
      <span className="text-xs font-medium text-center">{label}</span>
    </Link>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { profile, completeness, loading: profileLoading } = useProfile()
  const { schemes, loading: schemesLoading, fetchSchemes } = useSchemes()
  const { notifications, unreadCount } = useNotifications()
  const [deadlines, setDeadlines] = useState([])
  const [appStats, setAppStats] = useState({ total: 0, active: 0, approved: 0 })

  useEffect(() => {
    fetchSchemes({ per_page: 6 })
    // Fetch deadlines
    deadlineService.getDeadlines().then((res) => {
      setDeadlines(res.data?.deadlines?.slice(0, 5) || [])
    }).catch(() => {})
    // Fetch application stats
    applicationService.getApplications().then((res) => {
      const apps = res.data?.applications || []
      setAppStats({
        total: apps.length,
        active: apps.filter((a) => a.status === 'IN_PROGRESS').length,
        approved: apps.filter((a) => a.status === 'APPROVED').length,
      })
    }).catch(() => {})
  }, [fetchSchemes])

  if (profileLoading) return <PageLoader />

  const showProfileBanner = completeness < 80
  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Welcome header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good day, {firstName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here's your government scheme overview</p>
        </div>
        <button
          onClick={() => navigate('/copilot')}
          className="btn-primary"
          aria-label="Open AI Citizen Copilot"
        >
          <Cpu className="w-4 h-4" aria-hidden="true" />
          AI Copilot
        </button>
      </div>

      {/* Profile completeness banner */}
      {showProfileBanner && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 border-blue-200 bg-blue-50"
        >
          <div className="flex items-center gap-4 flex-wrap">
            <ProfileCompletenessRing percentage={completeness} size={60} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">Complete your profile to get better scheme matches</p>
              <p className="text-sm text-gray-600 mt-0.5">
                Your profile is {completeness}% complete. Fill in more details for personalized eligibility checks.
              </p>
            </div>
            <Link to="/profile" className="btn-primary whitespace-nowrap">
              Complete profile
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Schemes Found"
          value={schemes.length > 0 ? '100+' : '—'}
          icon={Bookmark}
          color="blue"
        />
        <StatCard
          label="Active Applications"
          value={appStats.active}
          icon={Clock}
          color="orange"
        />
        <StatCard
          label="Approved"
          value={appStats.approved}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          label="Notifications"
          value={unreadCount}
          icon={Bell}
          color="purple"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="section-title mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
          <QuickAction icon={Cpu} label="AI Copilot" to="/copilot" color="blue" />
          <QuickAction icon={FileText} label="Upload Doc" to="/documents" color="green" />
          <QuickAction icon={Calendar} label="Deadlines" to="/deadlines" color="orange" />
          <QuickAction icon={TrendingUp} label="Tracker" to="/tracker" color="purple" />
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recommended schemes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Recommended Schemes</h2>
            <Link to="/schemes" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {schemesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : schemes.length > 0 ? (
            <div className="space-y-3">
              {schemes.slice(0, 4).map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-gray-500 text-sm">
                Complete your profile to see personalized scheme recommendations.
              </p>
              <Link to="/profile" className="btn-primary mt-4 inline-flex">
                Set up profile
              </Link>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Upcoming deadlines */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 text-sm">Upcoming Deadlines</h2>
              <Link to="/deadlines" className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
            {deadlines.length > 0 ? (
              <ul className="space-y-3" role="list">
                {deadlines.map((d, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className={clsx(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold',
                      d.days_remaining <= 7 ? 'bg-red-100 text-red-700' :
                      d.days_remaining <= 30 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600',
                    )}>
                      {d.days_remaining}d
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{d.scheme_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(d.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 text-center py-3">No upcoming deadlines</p>
            )}
          </div>

          {/* Recent notifications */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 text-sm">Notifications</h2>
              <Link to="/notifications" className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
            {notifications.length > 0 ? (
              <ul className="space-y-2" role="list">
                {notifications.slice(0, 4).map((n) => (
                  <li key={n.id} className={clsx(
                    'flex items-start gap-2 p-2 rounded-lg text-xs',
                    !n.is_read && 'bg-blue-50',
                  )}>
                    <div className={clsx(
                      'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                      n.priority === 'HIGH' ? 'bg-red-500' :
                      n.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-gray-400',
                    )} aria-hidden="true" />
                    <p className="text-gray-700 line-clamp-2">{n.message}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 text-center py-3">No notifications</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
