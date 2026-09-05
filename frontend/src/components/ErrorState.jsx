import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, WifiOff, FileText, Bell, Bookmark, Calendar, Search } from 'lucide-react'

/* ── ErrorState ──────────────────────────────────────────────────────────────── */
export function ErrorState({ message, onRetry, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center justify-center py-14 px-6 text-center ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}
        aria-hidden="true"
      >
        <AlertTriangle className="w-5 h-5" style={{ color: '#f87171' }} />
      </div>
      <h3
        className="text-[14px] font-semibold mb-1.5"
        style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.014em' }}
      >
        Something went wrong
      </h3>
      <p className="text-[12px] mb-5 max-w-xs leading-relaxed" style={{ color: 'rgb(var(--ds-ink-s))' }}>
        {message || 'An unexpected error occurred. Please try again.'}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          Try again
        </button>
      )}
    </motion.div>
  )
}

/* ── EmptyState ──────────────────────────────────────────────────────────────── */
const EMPTY_ICONS = {
  documents:     FileText,
  notifications: Bell,
  saved:         Bookmark,
  deadlines:     Calendar,
  search:        Search,
  default:       FileText,
}

export function EmptyState({ icon: IconProp, title, description, action, variant = 'default', className = '' }) {
  const Icon = IconProp || EMPTY_ICONS[variant] || EMPTY_ICONS.default

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center justify-center py-14 px-6 text-center ${className}`}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: 'rgba(94,106,210,0.10)',
          border: '1px solid rgba(94,106,210,0.18)',
        }}
        aria-hidden="true"
      >
        <Icon className="w-5 h-5" style={{ color: 'rgb(var(--ds-accent))' }} />
      </div>
      <h3
        className="text-[14px] font-semibold mb-1.5"
        style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.014em' }}
      >
        {title || 'Nothing here yet'}
      </h3>
      {description && (
        <p className="text-[12px] mb-5 max-w-xs leading-relaxed" style={{ color: 'rgb(var(--ds-ink-s))' }}>
          {description}
        </p>
      )}
      {action}
    </motion.div>
  )
}

/* ── NetworkError ────────────────────────────────────────────────────────────── */
export function NetworkError({ onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ background: 'rgb(var(--ds-s2))', border: '1px solid rgb(var(--ds-hl-s))' }}
        aria-hidden="true"
      >
        <WifiOff className="w-5 h-5" style={{ color: 'rgb(var(--ds-ink-s))' }} />
      </div>
      <h3
        className="text-[14px] font-semibold mb-1.5"
        style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.014em' }}
      >
        No connection
      </h3>
      <p className="text-[12px] mb-5 max-w-xs" style={{ color: 'rgb(var(--ds-ink-s))' }}>
        Check your internet connection and try again.
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          Retry
        </button>
      )}
    </motion.div>
  )
}
