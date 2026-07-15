import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'

export function StatCard({ label, value, change, changeLabel, icon: Icon, color = 'blue', className = '' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  }

  const trendIcon = change > 0
    ? <TrendingUp className="w-3 h-3 text-emerald-600" />
    : change < 0
      ? <TrendingDown className="w-3 h-3 text-red-500" />
      : <Minus className="w-3 h-3 text-gray-400" />

  const trendColor = change > 0 ? 'text-emerald-600' : change < 0 ? 'text-red-500' : 'text-gray-500'

  return (
    <div className={clsx('card p-5', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
          {(change != null || changeLabel) && (
            <div className="flex items-center gap-1 mt-1">
              {change != null && trendIcon}
              <span className={clsx('text-xs font-medium', trendColor)}>
                {change != null && `${change > 0 ? '+' : ''}${change}`}
                {changeLabel && ` ${changeLabel}`}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', colors[color])}>
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  )
}
