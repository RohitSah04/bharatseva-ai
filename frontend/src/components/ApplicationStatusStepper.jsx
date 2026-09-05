import { CheckCircle, Circle, Clock, XCircle } from 'lucide-react'

const STATUS_CONFIG = {
  NOT_STARTED: { label: 'Not Started', icon: Circle,      color: 'rgb(var(--ds-ink-s))',   bg: 'transparent',              ring: 'rgb(var(--ds-hl))',           badge: 'badge-indigo'  },
  IN_PROGRESS: { label: 'In Progress', icon: Clock,       color: 'rgb(var(--ds-accent))',  bg: 'rgba(94,106,210,0.08)',     ring: 'rgba(94,106,210,0.30)',       badge: 'badge-indigo'  },
  SUBMITTED:   { label: 'Submitted',   icon: Clock,       color: '#fbbf24',                bg: 'rgba(217,119,6,0.08)',      ring: 'rgba(217,119,6,0.30)',        badge: 'badge-amber'   },
  APPROVED:    { label: 'Approved',    icon: CheckCircle, color: '#27a644',                bg: 'rgba(39,166,68,0.08)',      ring: 'rgba(39,166,68,0.30)',        badge: 'badge-emerald' },
  REJECTED:    { label: 'Rejected',    icon: XCircle,     color: '#f87171',                bg: 'rgba(239,68,68,0.08)',      ring: 'rgba(239,68,68,0.30)',        badge: 'badge-red'     },
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
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: isDone ? '#27a644' : isCurrent ? cfg.bg : 'rgb(var(--ds-s2))',
                    boxShadow: `0 0 0 2px ${isDone ? '#27a644' : isCurrent ? cfg.ring : 'rgb(var(--ds-hl))'}`,
                  }}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{
                      color: isDone ? '#fff' : isCurrent ? cfg.color : 'rgb(var(--ds-ink-3))',
                    }}
                    aria-hidden="true"
                  />
                </div>
                <span
                  className="text-xs mt-1 text-center whitespace-nowrap"
                  style={{
                    fontWeight: isCurrent ? 600 : 400,
                    color: isCurrent ? 'rgb(var(--ds-ink))' : isDone ? 'rgb(var(--ds-ink-m))' : 'rgb(var(--ds-ink-s))',
                  }}
                >
                  {cfg.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className="flex-1 mx-1 mb-5"
                  style={{ height: 1, background: idx < currentIdx ? '#27a644' : 'rgb(var(--ds-hl))' }}
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
    <span className={`badge ${cfg.badge}`}>
      <Icon className="w-3 h-3" aria-hidden="true" />
      {cfg.label}
    </span>
  )
}
