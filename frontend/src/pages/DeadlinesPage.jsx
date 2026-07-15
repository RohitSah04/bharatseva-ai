import { useEffect, useState } from 'react'
import { Calendar, Clock, ExternalLink, ChevronRight, AlertCircle } from 'lucide-react'
import { deadlineService } from '@/services/deadlineService'
import { PageLoader } from '@/components/LoadingSpinner'
import { EmptyState, ErrorState } from '@/components/ErrorState'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

function DeadlineCard({ deadline }) {
  const navigate = useNavigate()
  const days = deadline.days_remaining
  const urgency = days <= 7 ? 'high' : days <= 30 ? 'medium' : 'low'
  const urgencyStyles = {
    high: { bg: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
    medium: { bg: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    low: { bg: 'bg-gray-50 border-gray-200', badge: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  }
  const style = urgencyStyles[urgency]

  return (
    <div className={clsx('card border p-4 flex items-center gap-4', style.bg)}>
      {/* Days remaining */}
      <div className="flex-shrink-0 text-center w-14">
        <p className={clsx('text-2xl font-bold', urgency === 'high' ? 'text-red-700' : urgency === 'medium' ? 'text-amber-700' : 'text-gray-700')}>
          {days}
        </p>
        <p className="text-xs text-gray-500">days</p>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <button
          onClick={() => navigate(`/schemes/${deadline.scheme_id}`)}
          className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-sm text-left block"
        >
          {deadline.scheme_name}
        </button>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" aria-hidden="true" />
            {new Date(deadline.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          {deadline.source && (
            <span className="text-xs text-gray-400">via {deadline.source}</span>
          )}
        </div>
      </div>

      {/* Urgency badge */}
      <span className={clsx('badge text-xs flex-shrink-0', style.badge)}>
        <div className={clsx('w-1.5 h-1.5 rounded-full mr-1', style.dot)} aria-hidden="true" />
        {urgency === 'high' ? 'Urgent' : urgency === 'medium' ? 'Upcoming' : 'Future'}
      </span>

      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
    </div>
  )
}

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
        to_date: new Date(now.setDate(now.getDate() + 30)).toISOString(),
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
    urgent: deadlines.filter((d) => d.days_remaining <= 7),
    upcoming: deadlines.filter((d) => d.days_remaining > 7 && d.days_remaining <= 30),
    future: deadlines.filter((d) => d.days_remaining > 30),
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div>
        <h1 className="page-title">Deadline Calendar</h1>
        <p className="text-sm text-gray-500 mt-1">
          Deadlines from your saved schemes and active goals.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All deadlines' },
          { id: 'upcoming', label: 'Next 30 days' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              filter === id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            )}
            aria-pressed={filter === id}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse bg-gray-200 rounded-xl" aria-hidden="true" />
          ))}
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
              <h2 id="urgent-heading" className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                Urgent — within 7 days ({grouped.urgent.length})
              </h2>
              <div className="space-y-2">
                {grouped.urgent.map((d, i) => <DeadlineCard key={i} deadline={d} />)}
              </div>
            </section>
          )}
          {grouped.upcoming.length > 0 && (
            <section aria-labelledby="upcoming-heading">
              <h2 id="upcoming-heading" className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-3">
                Upcoming — within 30 days ({grouped.upcoming.length})
              </h2>
              <div className="space-y-2">
                {grouped.upcoming.map((d, i) => <DeadlineCard key={i} deadline={d} />)}
              </div>
            </section>
          )}
          {grouped.future.length > 0 && (
            <section aria-labelledby="future-heading">
              <h2 id="future-heading" className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
                Future ({grouped.future.length})
              </h2>
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
