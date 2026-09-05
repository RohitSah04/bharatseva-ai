const CONFIDENCE_LEVELS = [
  { min: 0.8, label: 'High', badge: 'badge-emerald', bar: '#27a644' },
  { min: 0.5, label: 'Medium', badge: 'badge-amber', bar: '#fbbf24' },
  { min: 0,   label: 'Low',    badge: 'badge-red',    bar: '#f87171' },
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
      className={`badge ${level.badge} ${className}`}
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

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="progress-track flex-1">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: level.bar }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Confidence score: ${pct}%`}
        />
      </div>
      <span className="text-xs font-medium w-8 text-right" style={{ color: 'rgb(var(--ds-ink-m))' }}>{pct}%</span>
    </div>
  )
}
