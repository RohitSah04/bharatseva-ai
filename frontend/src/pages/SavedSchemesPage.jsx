import { useState } from 'react'
import { Bookmark, Trash2, Search, ChevronRight } from 'lucide-react'
import { useSavedSchemes } from '@/hooks/useSavedSchemes'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLoader } from '@/components/LoadingSpinner'
import { EmptyState } from '@/components/ErrorState'
import { motion, AnimatePresence } from 'framer-motion'

export default function SavedSchemesPage() {
  const { savedSchemes, loading, removeScheme } = useSavedSchemes()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [removing, setRemoving] = useState(null)

  const handleRemove = async (schemeId) => {
    setRemoving(schemeId)
    try {
      await removeScheme(schemeId)
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">

      {/* Header */}
      <div>
        <p className="text-eyebrow mb-1">Bookmarked</p>
        <h1 className="page-title">{t('saved_schemes')}</h1>
        <p className="mt-1 text-[13px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>
          {t('saved_schemes_subtitle')}
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <PageLoader />
      ) : savedSchemes.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title={t('no_saved_schemes')}
          description={t('no_saved_desc')}
          action={
            <button
              onClick={() => navigate('/schemes')}
              className="btn-primary flex items-center gap-2 mt-2"
            >
              <Search className="w-3.5 h-3.5" />
              {t('browse_schemes')}
            </button>
          }
        />
      ) : (
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence>
            {savedSchemes.map((saved) => (
              <motion.div
                key={saved.scheme_id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 24, scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-4"
                style={{
                  background: 'rgb(var(--ds-s1))',
                  border: '1px solid rgb(var(--ds-hl))',
                  borderRadius: 12,
                  padding: '14px 16px',
                  transition: 'border-color 150ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--ds-hl-s))' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--ds-hl))' }}
              >
                {/* Bookmark icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(94,106,210,0.10)', border: '1px solid rgba(94,106,210,0.15)' }}
                  aria-hidden="true"
                >
                  <Bookmark className="w-3.5 h-3.5" style={{ color: 'rgb(var(--ds-accent))' }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => navigate(`/schemes/${saved.scheme_id}`)}
                    className="text-[13px] font-semibold text-left leading-tight transition-colors"
                    style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.014em' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'rgb(var(--ds-accent))' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgb(var(--ds-ink))' }}
                  >
                    {saved.scheme_name || 'Government Scheme'}
                  </button>
                  {saved.saved_at && (
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgb(var(--ds-ink-3))' }}>
                      Saved {new Date(saved.saved_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/schemes/${saved.scheme_id}`)}
                    className="btn-secondary flex items-center gap-1"
                    style={{ padding: '4px 10px', fontSize: 12 }}
                    aria-label={`View details for ${saved.scheme_name}`}
                  >
                    {t('view')}
                    <ChevronRight className="w-3 h-3" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => handleRemove(saved.scheme_id)}
                    disabled={removing === saved.scheme_id}
                    className="p-2 rounded-lg transition-colors disabled:opacity-50"
                    style={{ color: 'rgb(var(--ds-ink-s))' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgb(var(--ds-ink-s))' }}
                    aria-label={`Remove ${saved.scheme_name} from saved schemes`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
