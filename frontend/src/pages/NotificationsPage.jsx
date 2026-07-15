import { Bell, CheckCheck, Clock, AlertCircle, Info } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { PageLoader } from '@/components/LoadingSpinner'
import { EmptyState } from '@/components/ErrorState'
import clsx from 'clsx'

const PRIORITY_ICONS = {
  HIGH: { icon: AlertCircle, color: 'text-red-500', dot: 'bg-red-500' },
  MEDIUM: { icon: Clock, color: 'text-amber-500', dot: 'bg-amber-500' },
  LOW: { icon: Info, color: 'text-blue-500', dot: 'bg-blue-400' },
}

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm">
            <CheckCheck className="w-4 h-4" aria-hidden="true" />
            Mark all read
          </button>
        )}
      </div>

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
          {notifications.map((n) => {
            const priority = PRIORITY_ICONS[n.priority] || PRIORITY_ICONS.LOW
            const Icon = priority.icon
            return (
              <li
                key={n.id}
                className={clsx(
                  'card p-4 flex items-start gap-3 cursor-pointer transition-colors hover:bg-gray-50',
                  !n.is_read && 'border-l-4',
                  !n.is_read && n.priority === 'HIGH' && 'border-red-400',
                  !n.is_read && n.priority === 'MEDIUM' && 'border-amber-400',
                  !n.is_read && n.priority === 'LOW' && 'border-blue-400',
                )}
                onClick={() => !n.is_read && markRead(n.id)}
                role="article"
                aria-label={`${n.priority || 'low'} priority notification: ${n.message}`}
              >
                <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', !n.is_read ? 'bg-gray-100' : 'bg-gray-50')}>
                  <Icon className={clsx('w-4 h-4', priority.color)} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={clsx('text-sm text-gray-800', !n.is_read && 'font-medium')}>
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {n.priority && (
                      <span className={clsx('text-xs font-medium', priority.color)}>
                        {n.priority}
                      </span>
                    )}
                    {n.created_at && (
                      <time className="text-xs text-gray-400" dateTime={n.created_at}>
                        {new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </time>
                    )}
                    {!n.is_read && (
                      <span className="text-xs text-blue-600">• Unread</span>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
