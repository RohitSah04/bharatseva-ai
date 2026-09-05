import { useEffect, useState } from 'react'
import { Calendar, ChevronRight, AlertTriangle } from 'lucide-react'
import { deadlineService } from '@/services/deadlineService'
import { SkeletonCard } from '@/components/LoadingSpinner'
import { EmptyState, ErrorState } from '@/components/ErrorState'
import { useNavigate } from 'react-router-dom'

/* ── Deadline card ────────────────────────────────────────────────────────────── */
function DeadlineCard({ deadline }) {
  const navigate = useNavigate()
  const days = deadline.days_remaining
  const isHigh = days <= 7
  const isMed  = days <= 30

  const accentColor = isHigh ? '#f87171' : isMed ? '#fbbf24' : 'rgb(var(--ds-accent))'
  const tileBg      = isHigh ? 'rgba(239,68,68,0.09)'  : isMed ? 'rgba(245,158,11,0.09)' : 'rgba(94,106,210,0.08)'
  const tileBorder  = isHigh ? 'rgba(239,68,68,0.20)' : isMed ? 'rgba(245,158,11,0.20)' : 'rgba(94,106,210,0.15)'

  return (
    <div
      className="flex items-center gap-4 cursor-pointer"
      style={{
        background: 'rgb(var(--ds-s1))',
        border: '1px solid rgb(var(--ds-hl))',
        borderRadius: 12,
        padding: '14px 16px',
        transition: 'all 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgb(var(--ds-hl-s))'
        e.currentTarget.style.background = 'rgb(var(--ds-s2))'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgb(var(--ds-hl))'
        e.currentTarget.style.background = 'rgb(var(--ds-s1))'
      }}
      onClick={() => navigate(`/schemes/${deadline.scheme_id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/schemes/${deadline.scheme_id}`)}
      aria-label={`${deadline.scheme_name} — ${days} days remaining`}
    >
      {/* Days tile */}
      <div
        className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center"
        style={{ background: tileBg, border: `1px solid ${tileBorder}` }}
        aria-hidden="true"
      >
        <p className="text-[18px] font-bold leading-none" style={{ color: accentColor, letterSpacing: '-0.03em' }}>
          {days}
        </p>
        <p className="text-[10px] leading-none mt-0.5" style={{ color: accentColor, opacity: 0.7 }}>days</p>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[13px] font-semibold leading-tight truncate transition-colors"
          style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.014em' }}
        >
          {deadline.scheme_name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-1 text-[11px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>
            <Calendar className="w-2.5 h-2.5" aria-hidden="true" />
            {new Date(deadline.deadline).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </span>
          {deadline.source && (
            <span className="text-[11px]" style={{ color: 'rgb(var(--ds-ink-3))' }}>
              via {deadline.source}
            </span>
          )}
        </div>
      </div>

      {/* Urgency label */}
      <span
        className="flex-shrink-0 text-[11px] font-medium"
        style={{ color: accentColor }}
      >
        {isHigh ? 'Urgent' : isMed ? 'Soon' : 'Future'}
      </span>
      <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgb(var(--ds-ink-s))' }} aria-hidden="true" />
    </div>
  )
}

/* ── Skeleton item ──────────────────────────────────────────────────────────── */
function DeadlineSkeleton() {
  return (
    <div
      className="flex items-center gap-4"
      style={{
        background: 'rgb(var(--ds-s1))',
        border: '1px solid rgb(var(--ds-hl))',
        borderRadius: 12,
        padding: '14px 16px',
      }}
    >
      <div className="shimmer w-12 h-12 rounded-xl" aria-hidden="true" />
      <div className="flex-1 space-y-2">
        <div className="shimmer h-3.5 rounded w-2/3" aria-hidden="true" />
        <div className="shimmer h-3 rounded w-1/3" aria-hidden="true" />
      </div>
    </div>
  )
}

/* ── Section heading ──────────────────────────────────────────────────────── */
function GroupHeading({ label, color }) {
  return (
    <h2
      className="text-eyebrow flex items-center gap-2 mb-3"
      style={{ color }}
    >
      {label}
    </h2>
  )
}

/* ── Main page ──────────────────────────────────────────────────────────────── */
export default function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  const fetchDeadlines = async () => {
    setLoading(true)
    setError(null)
    try {
      const now = new Date()
      const params = filter === 'upcoming' ? {
        from_date: now.toISOString(),
        to_date: new Date(new Date().setDate(now.getDate() + 30)).toISOString(),
      } : {}
      const res = await deadlineService.getDeadlines(params)
      setDeadlines(res.data?.deadlines || [])
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load deadlines')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDeadlines() }, [filter])

  const grouped = {
    urgent:   deadlines.filter((d) => d.days_remaining <= 7),
    upcoming: deadlines.filter((d) => d.days_remaining > 7 && d.days_remaining <= 30),
    future:   deadlines.filter((d) => d.days_remaining > 30),
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-eyebrow mb-1">Stay on Track</p>
          <h1 className="page-title">Deadline Calendar</h1>
          <p className="mt-1 text-[13px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>
            Deadlines from your saved schemes and active goals.
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { id: 'all',      label: 'All deadlines' },
          { id: 'upcoming', label: 'Next 30 days' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className="text-[12px] font-medium transition-all duration-150"
            style={{
              padding: '4px 14px',
              borderRadius: 9999,
              border: '1px solid',
              borderColor: filter === id ? 'rgb(var(--ds-accent))' : 'rgb(var(--ds-hl))',
              background: filter === id ? 'rgba(94,106,210,0.12)' : 'rgb(var(--ds-s1))',
              color: filter === id ? 'rgb(var(--ds-accent))' : 'rgb(var(--ds-ink-s))',
            }}
            aria-pressed={filter === id}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <DeadlineSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDeadlines} />
      ) : deadlines.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No deadlines"
          description="Save schemes or activate a Copilot plan to see deadlines here."
        />
      ) : (
        <div className="space-y-6">
          {grouped.urgent.length > 0 && (
            <section aria-labelledby="urgent-heading">
              <GroupHeading label={`Urgent — within 7 days (${grouped.urgent.length})`} color="#f87171" />
              <div className="space-y-2">
                {grouped.urgent.map((d, i) => <DeadlineCard key={i} deadline={d} />)}
              </div>
            </section>
          )}
          {grouped.upcoming.length > 0 && (
            <section aria-labelledby="upcoming-heading">
              <GroupHeading label={`Upcoming — within 30 days (${grouped.upcoming.length})`} color="#fbbf24" />
              <div className="space-y-2">
                {grouped.upcoming.map((d, i) => <DeadlineCard key={i} deadline={d} />)}
              </div>
            </section>
          )}
          {grouped.future.length > 0 && (
            <section aria-labelledby="future-heading">
              <GroupHeading label={`Future (${grouped.future.length})`} color="rgb(var(--ds-ink-s))" />
              <div className="space-y-2">
                {grouped.future.map((d, i) => <DeadlineCard key={i} deadline={d} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
