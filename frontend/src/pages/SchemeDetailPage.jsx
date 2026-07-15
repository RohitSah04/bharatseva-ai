import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, Phone, ExternalLink, Bookmark, BookmarkCheck,
  CheckCircle, Clock, FileText, Brain, AlertCircle, Loader2, Calendar,
  ChevronRight,
} from 'lucide-react'
import { useScheme } from '@/hooks/useSchemes'
import { useEligibility } from '@/hooks/useEligibility'
import { useSavedSchemes } from '@/hooks/useSavedSchemes'
import { ConfidenceBadge, ConfidenceBar } from '@/components/ConfidenceBadge'
import { DegradedModeBanner } from '@/components/DegradedModeBanner'
import { ExplainabilityDrawer } from '@/components/ExplainabilityDrawer'
import { DocumentUploader } from '@/components/DocumentUploader'
import { PageLoader } from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/ErrorState'
import { EligibilityBadge } from '@/components/SchemeCard'
import clsx from 'clsx'

const VERDICT_STYLES = {
  ELIGIBLE: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  NOT_ELIGIBLE: 'bg-red-50 border-red-200 text-red-800',
  PARTIALLY_ELIGIBLE: 'bg-yellow-50 border-yellow-200 text-yellow-800',
}

export default function SchemeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { scheme, loading, error, fetchScheme } = useScheme(id)
  const { result: eligResult, loading: eligLoading, checkEligibility } = useEligibility()
  const { isSaved, toggleSave } = useSavedSchemes()
  const [savePending, setSavePending] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const [eligError, setEligError] = useState(null)
  const saved = id ? isSaved(id) : false

  useEffect(() => {
    fetchScheme()
  }, [fetchScheme])

  const handleSave = async () => {
    setSavePending(true)
    try { await toggleSave(id) } finally { setSavePending(false) }
  }

  const handleCheckEligibility = async () => {
    setEligError(null)
    try {
      await checkEligibility(id)
    } catch (err) {
      setEligError(err.message)
    }
  }

  if (loading) return <PageLoader />
  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <ErrorState message={error} onRetry={fetchScheme} />
    </div>
  )
  if (!scheme) return null

  const requiredDocs = (() => {
    try {
      const raw = scheme.required_documents ?? scheme.required_documents_json
      if (typeof raw === 'string') return JSON.parse(raw)
      return Array.isArray(raw) ? raw : []
    } catch { return [] }
  })()

  const daysLeft = scheme.deadline
    ? Math.ceil((new Date(scheme.deadline) - new Date()) / 86400000)
    : null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to schemes
      </button>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="badge bg-blue-100 text-blue-800">
                {scheme.category?.replace(/_/g, ' ')}
              </span>
              {scheme.state_or_all_india && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" aria-hidden="true" />
                  {scheme.state_or_all_india === 'all_india' ? 'All India' : scheme.state_or_all_india}
                </span>
              )}
              {scheme.source_name && (
                <span className="text-xs text-gray-400">Source: {scheme.source_name}</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{scheme.name}</h1>
            <p className="text-sm text-gray-600 leading-relaxed">{scheme.description}</p>
          </div>
          <button
            onClick={handleSave}
            disabled={savePending}
            className={clsx(
              'flex-shrink-0 p-2 rounded-xl transition-colors',
              saved ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600',
            )}
            aria-label={saved ? 'Remove from saved schemes' : 'Save this scheme'}
            aria-pressed={saved}
          >
            {saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>
        </div>

        {/* Meta info */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 pt-4 border-t border-gray-100">
          {scheme.deadline && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" aria-hidden="true" />
              <span>Deadline: {new Date(scheme.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              {daysLeft != null && daysLeft > 0 && (
                <span className={clsx(
                  'badge text-xs ml-1',
                  daysLeft <= 7 ? 'bg-red-100 text-red-700' : daysLeft <= 30 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600',
                )}>
                  {daysLeft}d left
                </span>
              )}
            </div>
          )}
          {scheme.office_contact && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-gray-400" aria-hidden="true" />
              <span>{scheme.office_contact}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleCheckEligibility}
            disabled={eligLoading}
            className="btn-primary"
          >
            {eligLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Checking...</span></>
              : <><Brain className="w-4 h-4" /><span>Check My Eligibility</span></>
            }
          </button>
          {scheme.application_url && (
            <a href={scheme.application_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              Apply Online
            </a>
          )}
          <button onClick={() => setShowUploader(!showUploader)} className="btn-secondary">
            <FileText className="w-4 h-4" aria-hidden="true" />
            Upload Documents
          </button>
        </div>
      </div>

      {/* Eligibility result */}
      {eligError && (
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{eligError}</p>
        </div>
      )}

      {eligResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx('card p-5 border', VERDICT_STYLES[eligResult.verdict] || 'border-gray-200')}
        >
          {eligResult.fallback_used && <DegradedModeBanner className="mb-3" />}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <EligibilityBadge verdict={eligResult.verdict} />
                <ConfidenceBadge score={eligResult.confidence} />
                {!eligResult.fallback_used && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-700 text-white leading-none">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    IBM Granite
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{eligResult.reasoning}</p>
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="btn-ghost text-sm flex-shrink-0"
              aria-label="View detailed AI reasoning"
            >
              <Brain className="w-4 h-4" aria-hidden="true" />
              View reasoning
            </button>
          </div>
        </motion.div>
      )}

      {/* Document uploader */}
      {showUploader && (
        <div className="card p-5">
          <h3 className="section-title mb-3">Upload Documents for this Scheme</h3>
          <DocumentUploader schemeId={id} />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {/* Required documents */}
        {requiredDocs.length > 0 && (
          <div className="card p-5">
            <h2 className="section-title mb-3">
              <FileText className="w-4 h-4 inline text-blue-600 mr-1.5" aria-hidden="true" />
              Required Documents
            </h2>
            <ul className="space-y-2" role="list">
              {requiredDocs.map((doc, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" aria-hidden="true" />
                  {typeof doc === 'string' ? doc : doc.name || JSON.stringify(doc)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Office info */}
        {(scheme.office_address || scheme.office_contact) && (
          <div className="card p-5">
            <h2 className="section-title mb-3">Contact & Office</h2>
            {scheme.office_address && (
              <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{scheme.office_address}</span>
              </div>
            )}
            {scheme.office_contact && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{scheme.office_contact}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Explainability drawer */}
      <ExplainabilityDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        data={eligResult}
      />
    </div>
  )
}
