import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, ChevronRight, MapPin, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ConfidenceBadge } from './ConfidenceBadge'
import { useSavedSchemes } from '@/hooks/useSavedSchemes'
import { toast } from '@/components/Toast'
import clsx from 'clsx'

/* ── Category config — DESIGN.md: surface-2 pills, ink-muted text ─────────── */
const CATEGORY_LABELS = {
  farmer:            'Farmer',
  scholarship:       'Education',
  women:             'Women',
  senior_citizen:    'Senior Citizen',
  disability:        'Disability',
  startup:           'Startup',
  msme:              'MSME',
  health:            'Health',
  housing:           'Housing',
  employment:        'Employment',
  skill:             'Skill',
  financial_inclusion:'Finance',
  tribal:            'Tribal',
  food_security:     'Food',
  energy:            'Energy',
  infrastructure:    'Infrastructure',
  digital:           'Digital',
  sanitation:        'Sanitation',
  transport:         'Transport',
}

function getCategoryLabel(category) {
  if (!category) return 'General'
  return CATEGORY_LABELS[category.toLowerCase()] || category
}

/* ── SchemeCard ──────────────────────────────────────────────────────────────── */
export function SchemeCard({ scheme, eligibilityResult, compact = false }) {
  const navigate = useNavigate()
  const { isSaved, toggleSave } = useSavedSchemes()
  const [savePending, setSavePending] = useState(false)
  const saved = isSaved(scheme.id || scheme.scheme_id)
  const categoryLabel = getCategoryLabel(scheme.category)
  const schemeName = scheme.scheme_name || scheme.name

  const handleSave = async (e) => {
    e.stopPropagation()
    setSavePending(true)
    try {
      await toggleSave(scheme.id || scheme.scheme_id)
      if (!saved) toast.success(`"${schemeName}" saved!`)
    } finally {
      setSavePending(false)
    }
  }

  const handleClick = () => navigate(`/schemes/${scheme.id || scheme.scheme_id}`)

  const daysLeft = scheme.deadline
    ? Math.ceil((new Date(scheme.deadline) - new Date()) / 86400000)
    : null

  const scope = scheme.state_or_all_india
  const scopeLabel = !scope ? null
    : scope === 'ALL_INDIA' || scope === 'all_india' ? 'All India'
    : scope.replace(/_/g, ' ')

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="group cursor-pointer"
      style={{
        background: 'rgb(var(--ds-s1))',
        border: '1px solid rgb(var(--ds-hl))',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
      onClick={handleClick}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`${schemeName} — ${categoryLabel}`}
      // Hover: lift border to hairline-strong
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgb(var(--ds-hl-s))'
        e.currentTarget.style.background  = 'rgb(var(--ds-s2))'
        e.currentTarget.style.boxShadow   = '0 4px 20px rgba(0,0,0,0.35)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgb(var(--ds-hl))'
        e.currentTarget.style.background  = 'rgb(var(--ds-s1))'
        e.currentTarget.style.boxShadow   = ''
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Category + Scope pills */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <span
              className="text-[11px] font-medium leading-none"
              style={{
                background: 'rgb(var(--ds-s2))',
                border: '1px solid rgb(var(--ds-hl-s))',
                borderRadius: '9999px',
                padding: '2px 8px',
                color: 'rgb(var(--ds-ink-s))',
              }}
            >
              {categoryLabel}
            </span>
            {scopeLabel && (
              <span
                className="flex items-center gap-1 text-[11px]"
                style={{ color: 'rgb(var(--ds-ink-3))' }}
              >
                <MapPin className="w-2.5 h-2.5" aria-hidden="true" />
                {scopeLabel}
              </span>
            )}
          </div>

          {/* Title — DESIGN.md card-title: 22px/500/-0.4px, but at sm context 14px */}
          <h3
            className="text-sm font-semibold leading-snug line-clamp-2 transition-colors"
            style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.014em' }}
          >
            {/* Accent on hover handled by group-hover CSS */}
            {schemeName}
          </h3>
        </div>

        {/* Save / bookmark button */}
        <button
          onClick={handleSave}
          disabled={savePending}
          className="flex-shrink-0 p-2 rounded-lg transition-all duration-150"
          style={{
            color: saved ? 'rgb(var(--ds-accent))' : 'rgb(var(--ds-ink-s))',
            background: saved ? 'rgba(var(--ds-accent),0.10)' : 'transparent',
          }}
          onMouseEnter={(e) => { if (!saved) { e.currentTarget.style.background = 'rgb(var(--ds-s2))'; e.currentTarget.style.color = 'rgb(var(--ds-ink-m))' } }}
          onMouseLeave={(e) => { if (!saved) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgb(var(--ds-ink-s))' } }}
          aria-label={saved ? 'Remove from saved schemes' : 'Save scheme'}
          aria-pressed={saved}
        >
          <motion.div
            key={String(saved)}
            initial={{ scale: 0.7, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            {saved
              ? <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
              : <Bookmark      className="w-4 h-4" aria-hidden="true" />}
          </motion.div>
        </button>
      </div>

      {/* Description */}
      {!compact && scheme.description && (
        <p
          className="text-[13px] leading-relaxed line-clamp-2"
          style={{ color: 'rgb(var(--ds-ink-s))' }}
        >
          {scheme.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-auto flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {eligibilityResult && (
            <EligibilityBadge verdict={eligibilityResult.verdict} />
          )}
          {eligibilityResult?.confidence != null && (
            <ConfidenceBadge score={eligibilityResult.confidence} showPercent />
          )}
        </div>

        <div className="flex items-center gap-2">
          {daysLeft !== null && daysLeft > 0 && (
            <span
              className="flex items-center gap-1 text-[11px] font-medium"
              style={{
                color: daysLeft <= 7 ? '#f87171'
                     : daysLeft <= 30 ? '#fbbf24'
                     : 'rgb(var(--ds-ink-s))',
              }}
            >
              <Clock className="w-3 h-3" aria-hidden="true" />
              {daysLeft}d
            </span>
          )}
          <ChevronRight
            className="w-3.5 h-3.5 transition-colors"
            style={{ color: 'rgb(var(--ds-ink-3))' }}
            aria-hidden="true"
          />
        </div>
      </div>
    </motion.article>
  )
}

/* ── EligibilityBadge ──────────────────────────────────────────────────────── */
export function EligibilityBadge({ verdict }) {
  if (!verdict) return null
  const map = {
    ELIGIBLE:           { cls: 'badge-emerald', label: 'Eligible' },
    NOT_ELIGIBLE:       { cls: 'badge-red',     label: 'Not Eligible' },
    PARTIALLY_ELIGIBLE: { cls: 'badge-amber',   label: 'Partial' },
  }
  const style = map[verdict] || map.PARTIALLY_ELIGIBLE
  return <span className={clsx('badge text-[10px]', style.cls)}>{style.label}</span>
}
