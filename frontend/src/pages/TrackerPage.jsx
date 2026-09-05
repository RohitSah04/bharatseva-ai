import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, ChevronDown, ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import { applicationService } from '@/services/applicationService'
import { ApplicationStatusStepper, StatusBadge } from '@/components/ApplicationStatusStepper'
import { PageLoader, SkeletonCard } from '@/components/LoadingSpinner'
import { EmptyState, ErrorState } from '@/components/ErrorState'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

const VALID_TRANSITIONS = {
  NOT_STARTED: ['IN_PROGRESS'],
  IN_PROGRESS: ['SUBMITTED'],
  SUBMITTED: ['APPROVED', 'REJECTED'],
  APPROVED: [],
  REJECTED: [],
}

function ApplicationCard({ app, onUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState(null)
  const [note, setNote] = useState('')
  const transitions = VALID_TRANSITIONS[app.status] || []
  const navigate = useNavigate()

  const handleUpdate = async (newStatus) => {
    setUpdating(true)
    setUpdateError(null)
    try {
      await applicationService.updateApplication(app.id, { status: newStatus, note })
      onUpdate()
    } catch (err) {
      setUpdateError(
        err.response?.data?.error?.message || 'Failed to update status. Please try again.'
      )
    } finally {
      setUpdating(false)
    }
  }

  const statusHistory = (() => {
    try {
      if (typeof app.status_history_json === 'string') return JSON.parse(app.status_history_json)
      return app.status_history_json || []
    } catch { return [] }
  })()

  return (
    <div
      style={{
        background: 'rgb(var(--ds-s1))',
        border: '1px solid rgb(var(--ds-hl))',
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        transition: 'border-color 150ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--ds-hl-s))' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--ds-hl))' }}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => navigate(`/schemes/${app.scheme_id}`)}
            className="text-[13px] font-semibold text-left transition-colors leading-tight"
            style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.014em' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgb(var(--ds-accent))' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgb(var(--ds-ink))' }}
          >
            {app.scheme_name || 'Government Scheme'}
          </button>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <StatusBadge status={app.status} />
            {app.updated_at && (
              <span className="text-[11px]" style={{ color: 'rgb(var(--ds-ink-3))' }}>
                Updated {new Date(app.updated_at).toLocaleDateString('en-IN')}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'rgb(var(--ds-ink-s))' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgb(var(--ds-s2))'; e.currentTarget.style.color = 'rgb(var(--ds-ink))' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgb(var(--ds-ink-s))' }}
          aria-label={expanded ? 'Collapse details' : 'Expand details'}
          aria-expanded={expanded}
        >
          <ChevronDown className={clsx('w-4 h-4 transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
        </button>
      </div>

      <ApplicationStatusStepper status={app.status} />

      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3 pt-3"
          style={{ borderTop: '1px solid rgb(var(--ds-hl))' }}
        >
          {/* Status history */}
          {statusHistory.length > 0 && (
            <div>
              <p className="text-eyebrow mb-2">Status History</p>
              <ul className="space-y-1.5">
                {statusHistory.map((h, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: 'rgb(var(--ds-ink-s))' }}
                      aria-hidden="true"
                    />
                    <span className="text-[12px] font-medium" style={{ color: 'rgb(var(--ds-ink-m))' }}>{h.status}</span>
                    {h.timestamp && <span className="text-[11px]" style={{ color: 'rgb(var(--ds-ink-3))' }}>{new Date(h.timestamp).toLocaleDateString('en-IN')}</span>}
                    {h.note && <span className="text-[11px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>— {h.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Update status */}
          {transitions.length > 0 && (
            <div>
              <p className="text-eyebrow mb-2">Update Status</p>
              {updateError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 p-2.5 mb-2 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} aria-hidden="true" />
                  <p className="text-[12px]" style={{ color: '#f87171' }}>{updateError}</p>
                </div>
              )}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Add a note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="input-field"
                  style={{ fontSize: 13 }}
                  aria-label="Status update note"
                />
                <div className="flex gap-2 flex-wrap">
                  {transitions.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdate(status)}
                      disabled={updating}
                      aria-label={`Mark application as ${status.replace(/_/g, ' ')}`}
                      className={clsx(
                        'btn-secondary flex items-center gap-1.5',
                        status === 'APPROVED' && 'border-emerald-600 text-emerald-500',
                        status === 'REJECTED' && 'border-red-500 text-red-400',
                      )}
                      style={{ fontSize: 12, padding: '5px 10px' }}
                    >
                      {status === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />}
                      {status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" aria-hidden="true" />}
                      Mark as {status.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default function TrackerPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const navigate = useNavigate()

  const fetchApps = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await applicationService.getApplications(statusFilter ? { status: statusFilter } : {})
      setApplications(res.data?.applications || [])
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchApps() }, [statusFilter])

  const statuses = ['', 'NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED']

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
        <p className="text-eyebrow mb-1">Progress Tracking</p>
        <h1 className="page-title">Application Tracker</h1>
        <p className="mt-1 text-[13px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>
          Track the status of all your government scheme applications.
        </p>
      </div>
      <button onClick={() => navigate('/schemes')} className="btn-secondary flex items-center gap-2">
        Browse schemes
      </button>
    </div>

      {/* Status filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide" role="group" aria-label="Filter by status">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className="whitespace-nowrap text-[12px] font-medium transition-all duration-150 flex-shrink-0"
            style={{
              padding: '4px 12px',
              borderRadius: 9999,
              border: '1px solid',
              borderColor: statusFilter === s ? 'rgb(var(--ds-accent))' : 'rgb(var(--ds-hl))',
              background: statusFilter === s ? 'rgba(94,106,210,0.12)' : 'rgb(var(--ds-s1))',
              color: statusFilter === s ? 'rgb(var(--ds-accent))' : 'rgb(var(--ds-ink-s))',
            }}
            aria-pressed={statusFilter === s}
          >
            {s === '' ? 'All' : s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchApps} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applications yet"
          description="Save schemes or activate a Copilot plan to start tracking your applications."
          action={
            <button onClick={() => navigate('/schemes')} className="btn-primary mt-2">
              Browse schemes
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <ApplicationCard key={app.id} app={app} onUpdate={fetchApps} />
          ))}
        </div>
      )}
    </div>
  )
}
