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
  const [note, setNote] = useState('')
  const transitions = VALID_TRANSITIONS[app.status] || []
  const navigate = useNavigate()

  const handleUpdate = async (newStatus) => {
    setUpdating(true)
    try {
      await applicationService.updateApplication(app.id, { status: newStatus, note })
      onUpdate()
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
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => navigate(`/schemes/${app.scheme_id}`)}
            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-sm text-left"
          >
            {app.scheme_name || 'Government Scheme'}
          </button>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <StatusBadge status={app.status} />
            {app.updated_at && (
              <span className="text-xs text-gray-400">
                Updated {new Date(app.updated_at).toLocaleDateString('en-IN')}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
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
          className="space-y-3 pt-2 border-t border-gray-100"
        >
          {/* Status history */}
          {statusHistory.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status History</p>
              <ul className="space-y-1.5">
                {statusHistory.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" aria-hidden="true" />
                    <span className="font-medium">{h.status}</span>
                    {h.timestamp && <span className="text-gray-400">{new Date(h.timestamp).toLocaleDateString('en-IN')}</span>}
                    {h.note && <span className="text-gray-500">— {h.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Update status */}
          {transitions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Update Status</p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Add a note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="input-field text-sm"
                  aria-label="Status update note"
                />
                <div className="flex gap-2 flex-wrap">
                  {transitions.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdate(status)}
                      disabled={updating}
                      className={clsx(
                        'btn-secondary text-xs py-1.5',
                        status === 'APPROVED' && 'text-emerald-700 border-emerald-300 hover:bg-emerald-50',
                        status === 'REJECTED' && 'text-red-700 border-red-300 hover:bg-red-50',
                      )}
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
          <h1 className="page-title">Application Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track the status of all your government scheme applications.
          </p>
        </div>
        <button onClick={() => navigate('/schemes')} className="btn-secondary">
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
          Browse schemes
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={clsx(
              'whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0',
              statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            )}
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
