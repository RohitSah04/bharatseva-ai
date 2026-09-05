import { motion } from 'framer-motion'
import { Bell, CheckCheck, Clock, AlertCircle, Info } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { PageLoader } from '@/components/LoadingSpinner'
import { EmptyState } from '@/components/ErrorState'

/* ── Priority config ─────────────────────────────────────────────────────────── */
const PRIORITY = {
  HIGH:   { icon: AlertCircle, color: '#f87171',               bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.18)' },
  MEDIUM: { icon: Clock,       color: '#fbbf24',               bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.18)' },
  LOW:    { icon: Info,        color: 'rgb(var(--ds-accent))', bg: 'rgba(94,106,210,0.06)',  border: 'rgba(94,106,210,0.14)' },
}

/* ── Notification row ────────────────────────────────────────────────────────── */
function NotifRow({ n, onMarkRead }) {
  const p = PRIORITY[n.priority] || PRIORITY.LOW
  const Icon = p.icon

  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-3 cursor-pointer"
      style={{
        background: !n.is_read ? 'rgb(var(--ds-s1))' : 'transparent',
        border: !n.is_read
          ? `1px solid ${p.border}`
          : '1px solid rgb(var(--ds-hl))',
        borderRadius: 10,
        padding: '14px 16px',
        transition: 'all 150ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgb(var(--ds-s2))' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = !n.is_read ? 'rgb(var(--ds-s1))' : 'transparent' }}
      onClick={() => !n.is_read && onMarkRead(n.id)}
      role="article"
      aria-label={`${n.priority || 'low'} priority notification: ${n.message}`}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: p.bg, border: `1px solid ${p.border}` }}
        aria-hidden="true"
      >
        <Icon className="w-4 h-4" style={{ color: p.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[13px] leading-snug"
          style={{
            color: 'rgb(var(--ds-ink-m))',
            fontWeight: !n.is_read ? 500 : 400,
          }}
        >
          {n.message}
        </p>
        <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
          {n.priority && (
            <span className="text-[11px] font-medium" style={{ color: p.color }}>
              {n.priority}
            </span>
          )}
          {n.created_at && (
            <time
              className="text-[11px]"
              style={{ color: 'rgb(var(--ds-ink-3))' }}
              dateTime={n.created_at}
            >
              {new Date(n.created_at).toLocaleString('en-IN', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
              })}
            </time>
          )}
          {!n.is_read && (
            <span
              className="text-[11px] font-medium"
              style={{ color: 'rgb(var(--ds-accent))' }}
            >
              • Unread
            </span>
          )}
        </div>
      </div>
    </motion.li>
  )
}

/* ── Main page ──────────────────────────────────────────────────────────────── */
export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-eyebrow mb-1">Inbox</p>
          <h1 className="page-title">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-[13px] mt-1" style={{ color: 'rgb(var(--ds-ink-s))' }}>
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="btn-secondary flex items-center gap-2"
          >
            <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <PageLoader />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You'll receive notifications about upcoming deadlines and application updates."
        />
      ) : (
        <ul className="space-y-2" role="list">
          {notifications.map((n) => (
            <NotifRow key={n.id} n={n} onMarkRead={markRead} />
          ))}
        </ul>
      )}
    </div>
  )
}
