import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import clsx from 'clsx'

export function StatCard({ label, value, change, changeLabel, icon: Icon, color = 'blue', className = '' }) {
  const colors = {
    blue:   { bg: 'bg-indigo-50 dark:bg-indigo-900/30',  icon: 'text-indigo-600 dark:text-indigo-400',  val: 'text-indigo-600 dark:text-indigo-400' },
    green:  { bg: 'bg-emerald-50 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400', val: 'text-emerald-600 dark:text-emerald-400' },
    orange: { bg: 'bg-amber-50 dark:bg-amber-900/30',    icon: 'text-amber-600 dark:text-amber-400',    val: 'text-amber-700 dark:text-amber-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/30',  icon: 'text-purple-600 dark:text-purple-400',  val: 'text-purple-600 dark:text-purple-400' },
    red:    { bg: 'bg-red-50 dark:bg-red-900/30',        icon: 'text-red-600 dark:text-red-400',        val: 'text-red-600 dark:text-red-400' },
    teal:   { bg: 'bg-teal-50 dark:bg-teal-900/30',      icon: 'text-teal-600 dark:text-teal-400',      val: 'text-teal-600 dark:text-teal-400' },
  }

  const c = colors[color] || colors.blue

  const trendIcon = change > 0
    ? <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
    : change < 0
      ? <TrendingDown className="w-3 h-3 text-red-500 dark:text-red-400" />
      : <Minus className="w-3 h-3 text-slate-400" />

  const trendColor = change > 0
    ? 'text-emerald-600 dark:text-emerald-400'
    : change < 0
      ? 'text-red-500 dark:text-red-400'
      : 'text-slate-500 dark:text-slate-400'

  const isNumeric = typeof value === 'number'

  return (
    <div className={clsx('card p-5 flex items-center gap-4', className)}>
      {Icon && (
        <div className={clsx('w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0', c.bg)} aria-hidden="true">
          <Icon className={clsx('w-5 h-5', c.icon)} />
        </div>
      )}
      <div className="min-w-0">
        <p className={clsx('text-2xl font-bold', c.val)}>
          {isNumeric
            ? <AnimatedCounter value={value} />
            : (value ?? '—')
          }
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">{label}</p>
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
    </div>
  )
}
