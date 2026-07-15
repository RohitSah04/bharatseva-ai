import { CheckCircle, Circle, Clock, XCircle } from 'lucide-react'
import clsx from 'clsx'

const STATUS_CONFIG = {
  NOT_STARTED: { label: 'Not Started', icon: Circle, color: 'text-gray-400', ring: 'ring-gray-200', bg: 'bg-gray-50' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock, color: 'text-blue-600', ring: 'ring-blue-200', bg: 'bg-blue-50' },
  SUBMITTED: { label: 'Submitted', icon: Clock, color: 'text-amber-600', ring: 'ring-amber-200', bg: 'bg-amber-50' },
  APPROVED: { label: 'Approved', icon: CheckCircle, color: 'text-emerald-600', ring: 'ring-emerald-200', bg: 'bg-emerald-50' },
  REJECTED: { label: 'Rejected', icon: XCircle, color: 'text-red-600', ring: 'ring-red-200', bg: 'bg-red-50' },
}

const ORDER = ['NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED']

export function ApplicationStatusStepper({ status = 'NOT_STARTED', className = '' }) {
  const currentIdx = ORDER.indexOf(status)

  return (
    <nav aria-label="Application status" className={`w-full ${className}`}>
      <ol className="flex items-center gap-0">
        {ORDER.map((step, idx) => {
          const cfg = STATUS_CONFIG[step]
          const Icon = cfg.icon
          const isDone = idx < currentIdx
          const isCurrent = idx === currentIdx
          const isLast = idx === ORDER.length - 1

          return (
            <li key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center ring-2 transition-all',
                    isDone && 'bg-emerald-600 ring-emerald-600',
                    isCurrent && `${cfg.bg} ${cfg.ring}`,
                    !isDone && !isCurrent && 'bg-gray-50 ring-gray-200',
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <Icon
                    className={clsx(
                      'w-4 h-4',
                      isDone && 'text-white',
                      isCurrent && cfg.color,
                      !isDone && !isCurrent && 'text-gray-300',
                    )}
                    aria-hidden="true"
                  />
                </div>
                <span
                  className={clsx(
                    'text-xs mt-1 text-center whitespace-nowrap',
                    isCurrent && 'font-semibold text-gray-800',
                    isDone && 'text-gray-500',
                    !isDone && !isCurrent && 'text-gray-400',
                  )}
                >
                  {cfg.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={clsx(
                    'flex-1 h-px mx-1 mb-5',
                    idx < currentIdx ? 'bg-emerald-400' : 'bg-gray-200',
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_STARTED
  const Icon = cfg.icon
  return (
    <span className={clsx('badge', cfg.bg, cfg.color, 'border', cfg.ring)}>
      <Icon className="w-3 h-3" aria-hidden="true" />
      {cfg.label}
    </span>
  )
}
