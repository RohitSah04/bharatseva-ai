import clsx from 'clsx'

const CONFIDENCE_LEVELS = [
  { min: 0.8, label: 'High', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { min: 0.5, label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { min: 0,   label: 'Low',    color: 'bg-red-100 text-red-700 border-red-200' },
]

function getLevel(score) {
  return CONFIDENCE_LEVELS.find((l) => score >= l.min) || CONFIDENCE_LEVELS[2]
}

export function ConfidenceBadge({ score, showPercent = true, className = '' }) {
  if (score == null) return null
  const level = getLevel(score)
  const pct = Math.round(score * 100)

  return (
    <span
      className={clsx(
        'badge border text-xs font-semibold',
        level.color,
        className,
      )}
      aria-label={`Confidence: ${pct}% (${level.label})`}
      title={`AI Confidence: ${pct}%`}
    >
      {showPercent ? `${pct}%` : level.label} confidence
    </span>
  )
}

export function ConfidenceBar({ score, className = '' }) {
  if (score == null) return null
  const pct = Math.round(score * 100)
  const level = getLevel(score)
  const barColor = score >= 0.8 ? 'bg-emerald-500' : score >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Confidence score: ${pct}%`}
        />
      </div>
      <span className="text-xs font-medium text-gray-600 w-8 text-right">{pct}%</span>
    </div>
  )
}
