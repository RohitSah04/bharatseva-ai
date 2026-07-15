import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, ChevronRight, MapPin, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ConfidenceBadge } from './ConfidenceBadge'
import { useSavedSchemes } from '@/hooks/useSavedSchemes'
import clsx from 'clsx'

const CATEGORY_COLORS = {
  farmer: 'bg-green-100 text-green-800',
  scholarship: 'bg-blue-100 text-blue-800',
  women: 'bg-pink-100 text-pink-800',
  senior_citizen: 'bg-purple-100 text-purple-800',
  disability: 'bg-orange-100 text-orange-800',
  startup: 'bg-indigo-100 text-indigo-800',
  msme: 'bg-cyan-100 text-cyan-800',
  default: 'bg-gray-100 text-gray-700',
}

function getCategoryColor(category) {
  if (!category) return CATEGORY_COLORS.default
  const key = category.toLowerCase().replace(/[^a-z_]/g, '_')
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.default
}

export function SchemeCard({ scheme, eligibilityResult, compact = false }) {
  const navigate = useNavigate()
  const { isSaved, toggleSave } = useSavedSchemes()
  const [savePending, setSavePending] = useState(false)
  const saved = isSaved(scheme.id || scheme.scheme_id)

  const handleSave = async (e) => {
    e.stopPropagation()
    setSavePending(true)
    try {
      await toggleSave(scheme.id || scheme.scheme_id)
    } finally {
      setSavePending(false)
    }
  }

  const handleClick = () => {
    navigate(`/schemes/${scheme.id || scheme.scheme_id}`)
  }

  const daysLeft = scheme.deadline
    ? Math.ceil((new Date(scheme.deadline) - new Date()) / 86400000)
    : null

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="card-hover p-5 flex flex-col gap-3 group"
      onClick={handleClick}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`${scheme.scheme_name || scheme.name} — ${scheme.category}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={clsx('badge text-xs', getCategoryColor(scheme.category))}>
              {scheme.category?.replace(/_/g, ' ') || 'General'}
            </span>
            {scheme.state_or_all_india && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" aria-hidden="true" />
                {scheme.state_or_all_india === 'all_india' ? 'All India' : scheme.state_or_all_india}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {scheme.scheme_name || scheme.name}
          </h3>
        </div>

        <button
          onClick={handleSave}
          disabled={savePending}
          className={clsx(
            'flex-shrink-0 p-1.5 rounded-lg transition-colors',
            saved
              ? 'text-blue-600 hover:bg-blue-50'
              : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50',
          )}
          aria-label={saved ? 'Remove from saved schemes' : 'Save scheme'}
          aria-pressed={saved}
        >
          {saved
            ? <BookmarkCheck className="w-5 h-5" aria-hidden="true" />
            : <Bookmark className="w-5 h-5" aria-hidden="true" />
          }
        </button>
      </div>

      {/* Description */}
      {!compact && scheme.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{scheme.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-1 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {eligibilityResult && (
            <EligibilityBadge verdict={eligibilityResult.verdict} />
          )}
          {eligibilityResult?.confidence != null && (
            <ConfidenceBadge score={eligibilityResult.confidence} showPercent />
          )}
        </div>

        <div className="flex items-center gap-3">
          {daysLeft !== null && daysLeft > 0 && (
            <span className={clsx(
              'flex items-center gap-1 text-xs font-medium',
              daysLeft <= 7 ? 'text-red-600' : daysLeft <= 30 ? 'text-amber-600' : 'text-gray-500',
            )}>
              <Clock className="w-3 h-3" aria-hidden="true" />
              {daysLeft}d left
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" aria-hidden="true" />
        </div>
      </div>
    </motion.article>
  )
}

export function EligibilityBadge({ verdict }) {
  if (!verdict) return null
  const map = {
    ELIGIBLE: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Eligible' },
    NOT_ELIGIBLE: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Not Eligible' },
    PARTIALLY_ELIGIBLE: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Partial' },
  }
  const style = map[verdict] || map.PARTIALLY_ELIGIBLE
  return (
    <span className={clsx('badge border text-xs', style.color)}>
      {style.label}
    </span>
  )
}
