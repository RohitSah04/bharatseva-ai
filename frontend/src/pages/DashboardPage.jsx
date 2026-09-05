import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight, Bell, Cpu, Clock, CheckCircle, FileText,
  TrendingUp, ChevronRight, Bookmark, Calendar, Sparkles,
  AlertTriangle, Target,
} from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { useSchemes } from '@/hooks/useSchemes'
import { useNotifications } from '@/hooks/useNotifications'
import { ProfileCompletenessRing } from '@/components/ProfileCompletenessRing'
import { SchemeCard } from '@/components/SchemeCard'
import { SkeletonCard, SkeletonBlock } from '@/components/LoadingSpinner'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { deadlineService } from '@/services/deadlineService'
import { applicationService } from '@/services/applicationService'

/* ── Animation variants ───────────────────────────────────────────────────── */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

/* ── Sub-components ───────────────────────────────────────────────────────── */

/* Stat tile — DESIGN.md surface-1 card, hairline border */
function StatTile({ icon: Icon, label, value, suffix = '' }) {
  return (
    <motion.div
      variants={fadeUp}
      style={{
        background: 'rgb(var(--ds-s1))',
        border: '1px solid rgb(var(--ds-hl))',
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: 'rgba(94,106,210,0.10)', border: '1px solid rgba(94,106,210,0.15)' }}
        aria-hidden="true"
      >
        <Icon className="w-4 h-4" style={{ color: 'rgb(var(--ds-accent))' }} />
      </div>
      <div className="min-w-0">
        <p className="font-semibold leading-none" style={{ fontSize: 20, color: 'rgb(var(--ds-ink))', letterSpacing: '-0.03em' }}>
          <AnimatedCounter value={typeof value === 'number' ? value : 0} suffix={suffix} />
          {typeof value === 'string' ? value : ''}
        </p>
        <p className="mt-1 leading-none truncate" style={{ fontSize: 11, color: 'rgb(var(--ds-ink-s))' }}>
          {label}
        </p>
      </div>
    </motion.div>
  )
}

/* Quick action link */
function QuickAction({ icon: Icon, label, to, description }) {
  return (
    <Link
      to={to}
      style={{
        background: 'rgb(var(--ds-s1))',
        border: '1px solid rgb(var(--ds-hl))',
        borderRadius: 12,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        textDecoration: 'none',
        transition: 'all 180ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgb(var(--ds-s2))'
        e.currentTarget.style.borderColor = 'rgb(var(--ds-hl-s))'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgb(var(--ds-s1))'
        e.currentTarget.style.borderColor = 'rgb(var(--ds-hl))'
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(94,106,210,0.10)', border: '1px solid rgba(94,106,210,0.15)' }}
        aria-hidden="true"
      >
        <Icon className="w-4 h-4" style={{ color: 'rgb(var(--ds-accent))' }} />
      </div>
      <div>
        <p className="text-[13px] font-semibold leading-none" style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.014em' }}>{label}</p>
        <p className="mt-1 text-[11px] leading-none" style={{ color: 'rgb(var(--ds-ink-s))' }}>{description}</p>
      </div>
    </Link>
  )
}

/* Deadline row */
function DeadlineRow({ deadline }) {
  const days = deadline.days_remaining
  const isHigh = days <= 7
  const isMed  = days <= 30

  return (
    <li
      className="flex items-center gap-3"
      style={{ paddingBottom: 12, borderBottom: '1px solid rgb(var(--ds-hl))' }}
    >
      <div
        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold leading-none"
        style={{
          background: isHigh ? 'rgba(239,68,68,0.10)' : isMed ? 'rgba(245,158,11,0.10)' : 'rgb(var(--ds-s2))',
          color: isHigh ? '#f87171' : isMed ? '#fbbf24' : 'rgb(var(--ds-ink-s))',
          border: `1px solid ${isHigh ? 'rgba(239,68,68,0.2)' : isMed ? 'rgba(245,158,11,0.2)' : 'rgb(var(--ds-hl))'}`,
        }}
      >
        {days}d
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium leading-none truncate" style={{ color: 'rgb(var(--ds-ink-m))' }}>
          {deadline.scheme_name}
        </p>
        <p className="mt-1 text-[11px] leading-none" style={{ color: 'rgb(var(--ds-ink-s))' }}>
          {new Date(deadline.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
      {isHigh && <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#f87171' }} aria-hidden="true" />}
    </li>
  )
}

/* Section header */
function SectionHeader({ title, linkTo, linkLabel }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="section-title">{title}</h2>
      {linkTo && (
        <Link
          to={linkTo}
          className="flex items-center gap-1 text-[12px] font-medium transition-colors"
          style={{ color: 'rgb(var(--ds-ink-s))', textDecoration: 'none' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgb(var(--ds-accent))' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgb(var(--ds-ink-s))' }}
        >
          {linkLabel}
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}

/* Surface card wrapper */
function SurfaceCard({ children, className = '', style = {} }) {
  return (
    <div
      className={className}
      style={{
        background: 'rgb(var(--ds-s1))',
        border: '1px solid rgb(var(--ds-hl))',
        borderRadius: 12,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ── Main component ────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { profile, completeness, loading: profileLoading } = useProfile()
  const { schemes, loading: schemesLoading, fetchSchemes } = useSchemes()
  const { notifications, unreadCount } = useNotifications()
  const [deadlines, setDeadlines] = useState([])
  const [appStats, setAppStats] = useState({ total: 0, active: 0, approved: 0 })

  useEffect(() => {
    fetchSchemes({ per_page: 6 })
    deadlineService.getDeadlines()
      .then((res) => setDeadlines(res.data?.deadlines?.slice(0, 5) || []))
      .catch(() => {})
    applicationService.getApplications()
      .then((res) => {
        const apps = res.data?.applications || []
        setAppStats({
          total:    apps.length,
          active:   apps.filter((a) => a.status === 'IN_PROGRESS').length,
          approved: apps.filter((a) => a.status === 'APPROVED').length,
        })
      })
      .catch(() => {})
  }, [fetchSchemes])

  /* Loading skeleton */
  if (profileLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <SkeletonBlock style={{ height: 28, width: 200, borderRadius: 6 }} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBlock key={i} style={{ height: 80, borderRadius: 12 }} />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-3">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
          <div className="space-y-4">
            <SkeletonBlock style={{ height: 200, borderRadius: 12 }} />
            <SkeletonBlock style={{ height: 160, borderRadius: 12 }} />
          </div>
        </div>
      </div>
    )
  }

  const showProfileBanner = completeness < 80
  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  const QUICK_ACTIONS = [
    { icon: Cpu,        label: t('copilot'),   to: '/copilot',   description: 'AI scheme planner' },
    { icon: FileText,   label: t('documents'), to: '/documents', description: 'Document vault' },
    { icon: Calendar,   label: t('calendar'),  to: '/deadlines', description: 'Deadline calendar' },
    { icon: TrendingUp, label: t('tracker'),   to: '/tracker',   description: 'Application tracker' },
  ]

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5"
    >

      {/* ── Welcome header ─────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-eyebrow mb-1">Dashboard</p>
          <h1 className="page-title">Good day, {firstName}</h1>
          <p className="mt-1 text-[13px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>
            Your government scheme overview
          </p>
        </div>
        <button
          onClick={() => navigate('/copilot')}
          className="btn-primary flex items-center gap-2"
          aria-label="Open AI Citizen Copilot"
        >
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          {t('copilot')}
        </button>
      </motion.div>

      {/* ── Profile completeness banner ──────────────────────────────── */}
      {showProfileBanner && (
        <motion.div variants={fadeUp}>
          <SurfaceCard style={{ padding: '16px 20px', borderColor: 'rgba(94,106,210,0.3)' }}>
            <div className="flex items-center gap-4 flex-wrap">
              <ProfileCompletenessRing percentage={completeness} size={56} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold leading-none" style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.014em' }}>
                  Complete your profile for better matches
                </p>
                <p className="mt-1.5 text-[12px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>
                  {completeness}% — Add income, occupation, and state for personalized eligibility.
                </p>
              </div>
              <Link to="/profile" className="btn-primary flex items-center gap-2">
                Complete profile
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </SurfaceCard>
        </motion.div>
      )}

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Schemes Available"   value="96+"            icon={Bookmark}     />
        <StatTile label="Active Applications" value={appStats.active}  icon={Clock}        />
        <StatTile label="Approved"            value={appStats.approved} icon={CheckCircle} />
        <StatTile label="Unread Alerts"       value={unreadCount}       icon={Bell}        />
      </motion.div>

      {/* ── AI Copilot CTA — surface-2 lift, featured card ──────────── */}
      <motion.div variants={fadeUp}>
        <div
          className="cursor-pointer"
          style={{
            background: 'rgb(var(--ds-s2))',
            border: '1px solid rgb(var(--ds-hl-s))',
            borderRadius: 12,
            padding: '20px 24px',
            transition: 'all 180ms ease',
          }}
          onClick={() => navigate('/copilot')}
          role="button"
          tabIndex={0}
          aria-label="Open AI Citizen Copilot"
          onKeyDown={(e) => e.key === 'Enter' && navigate('/copilot')}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgb(var(--ds-s3))'
            e.currentTarget.style.borderColor = 'rgb(var(--ds-hl-t))'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgb(var(--ds-s2))'
            e.currentTarget.style.borderColor = 'rgb(var(--ds-hl-s))'
            e.currentTarget.style.transform = ''
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              {/* Live indicator */}
              <div className="flex items-center gap-2 mb-2">
                <span className="live-dot" aria-hidden="true" />
                <span className="text-eyebrow text-[10px]" style={{ textTransform: 'none', letterSpacing: '0.02em' }}>
                  IBM Granite AI · Live
                </span>
              </div>
              <h2
                className="text-[16px] font-semibold leading-tight mb-1"
                style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.018em' }}
              >
                Use the AI Citizen Copilot
              </h2>
              <p className="text-[13px] max-w-md" style={{ color: 'rgb(var(--ds-ink-s))' }}>
                Tell your goal in plain language — IBM Granite finds matching schemes, checks eligibility, builds your action plan.
              </p>
            </div>
            <div
              className="btn-primary flex items-center gap-2"
              style={{ pointerEvents: 'none' }}
            >
              <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
              Start now
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Actions ─────────────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <SectionHeader title={t('quick_actions')} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <QuickAction key={action.to} {...action} />
          ))}
        </div>
      </motion.div>

      {/* ── Main content grid ─────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Recommended schemes — 2 cols */}
        <motion.div variants={fadeUp} className="lg:col-span-2 space-y-3">
          <SectionHeader title={t('recommended_schemes')} linkTo="/schemes" linkLabel={t('view_all')} />

          {schemesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : schemes.length > 0 ? (
            <motion.div variants={stagger} className="space-y-3">
              {schemes.slice(0, 4).map((scheme) => (
                <motion.div key={scheme.id} variants={fadeUp}>
                  <SchemeCard scheme={scheme} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <SurfaceCard style={{ padding: 40, textAlign: 'center' }}>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(94,106,210,0.10)', border: '1px solid rgba(94,106,210,0.15)' }}
                aria-hidden="true"
              >
                <Target className="w-5 h-5" style={{ color: 'rgb(var(--ds-accent))' }} />
              </div>
              <p className="text-[14px] font-semibold mb-1" style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.014em' }}>
                No recommendations yet
              </p>
              <p className="text-[12px] mb-5" style={{ color: 'rgb(var(--ds-ink-s))' }}>
                Complete your profile to see personalized scheme recommendations.
              </p>
              <Link to="/profile" className="btn-primary inline-flex">
                Set up profile
              </Link>
            </SurfaceCard>
          )}
        </motion.div>

        {/* Right sidebar */}
        <motion.div variants={stagger} className="space-y-4">

          {/* Upcoming deadlines */}
          <motion.div variants={fadeUp}>
            <SurfaceCard style={{ padding: '20px' }}>
              <SectionHeader title={t('upcoming_deadlines')} linkTo="/deadlines" linkLabel={t('view_all')} />
              {deadlines.length > 0 ? (
                <ul className="space-y-0" role="list">
                  {deadlines.map((d, i) => <DeadlineRow key={i} deadline={d} />)}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <Calendar
                    className="w-7 h-7 mx-auto mb-2"
                    style={{ color: 'rgb(var(--ds-ink-s))' }}
                    aria-hidden="true"
                  />
                  <p className="text-[12px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>{t('no_deadlines')}</p>
                </div>
              )}
            </SurfaceCard>
          </motion.div>

          {/* Recent notifications */}
          <motion.div variants={fadeUp}>
            <SurfaceCard style={{ padding: '20px' }}>
              <SectionHeader title={t('notifications')} linkTo="/notifications" linkLabel={t('view_all')} />
              {notifications.length > 0 ? (
                <ul className="space-y-1.5" role="list">
                  {notifications.slice(0, 4).map((n) => (
                    <li
                      key={n.id}
                      className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg"
                      style={{
                        background: !n.is_read ? 'rgba(94,106,210,0.06)' : 'transparent',
                        border: !n.is_read ? '1px solid rgba(94,106,210,0.12)' : '1px solid transparent',
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{
                          background: n.priority === 'HIGH' ? '#f87171'
                                    : n.priority === 'MEDIUM' ? '#fbbf24'
                                    : 'rgb(var(--ds-ink-s))',
                        }}
                        aria-hidden="true"
                      />
                      <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: 'rgb(var(--ds-ink-m))' }}>
                        {n.message}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-7 h-7 mx-auto mb-2" style={{ color: 'rgb(var(--ds-ink-s))' }} aria-hidden="true" />
                  <p className="text-[12px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>No notifications</p>
                </div>
              )}
            </SurfaceCard>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
