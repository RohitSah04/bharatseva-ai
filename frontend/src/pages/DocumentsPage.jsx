import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Upload, Eye, Tag, Calendar, AlertCircle, ChevronDown, Shield } from 'lucide-react'
import { documentService } from '@/services/documentService'
import { DocumentUploader } from '@/components/DocumentUploader'
import { SkeletonCard } from '@/components/LoadingSpinner'
import { EmptyState, ErrorState } from '@/components/ErrorState'
import clsx from 'clsx'

/* ── Verification badge ──────────────────────────────────────────────────────── */
const VERIFICATION_MAP = {
  VERIFIED:   { cls: 'badge-emerald', label: 'Verified' },
  MISMATCH:   { cls: 'badge-red',     label: 'Mismatch' },
  UNREADABLE: { cls: 'badge-amber',   label: 'Unreadable' },
  PENDING:    { cls: 'badge-indigo',  label: 'Pending AI Review' },
}

/* ── Document card ───────────────────────────────────────────────────────────── */
function DocumentCard({ doc }) {
  const [expanded, setExpanded] = useState(false)
  const status = VERIFICATION_MAP[doc.verified_against_requirement] || VERIFICATION_MAP.PENDING

  return (
    <div
      style={{
        background: 'rgb(var(--ds-s1))',
        border: '1px solid rgb(var(--ds-hl))',
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'border-color 150ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--ds-hl-s))' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--ds-hl))' }}
    >
      <div className="p-5 flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(94,106,210,0.10)', border: '1px solid rgba(94,106,210,0.15)' }}
          aria-hidden="true"
        >
          <FileText className="w-4 h-4" style={{ color: 'rgb(var(--ds-accent))' }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p
                className="text-[13px] font-semibold leading-tight truncate"
                style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.014em', maxWidth: 260 }}
              >
                {doc.filename}
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={clsx('badge', status.cls)}>{status.label}</span>
                {doc.category && (
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>
                    <Tag className="w-2.5 h-2.5" aria-hidden="true" />
                    {doc.category}
                  </span>
                )}
                {doc.created_at && (
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: 'rgb(var(--ds-ink-3))' }}>
                    <Calendar className="w-2.5 h-2.5" aria-hidden="true" />
                    {new Date(doc.created_at).toLocaleDateString('en-IN')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* AI explanation toggle */}
          {doc.ai_explanation && (
            <div className="mt-2.5">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-[12px] font-medium transition-colors"
                style={{ color: 'rgb(var(--ds-accent))' }}
                aria-expanded={expanded}
                aria-label={expanded ? 'Hide AI explanation' : 'Show AI explanation'}
              >
                <Eye className="w-3 h-3" aria-hidden="true" />
                {expanded ? 'Hide AI explanation' : 'View AI explanation'}
                <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-3 h-3" />
                </motion.span>
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p
                      className="text-[12px] mt-2 p-3 rounded-lg leading-relaxed"
                      style={{
                        color: 'rgb(var(--ds-ink-m))',
                        background: 'rgb(var(--ds-s2))',
                        border: '1px solid rgb(var(--ds-hl))',
                      }}
                    >
                      {doc.ai_explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Category pill ───────────────────────────────────────────────────────────── */
function CategoryPill({ value, label, active, onClick }) {
  return (
    <button
      onClick={() => onClick(value)}
      className="whitespace-nowrap text-[12px] font-medium transition-all duration-150 flex-shrink-0"
      style={{
        padding: '4px 12px',
        borderRadius: 9999,
        border: '1px solid',
        borderColor: active ? 'rgb(var(--ds-accent))' : 'rgb(var(--ds-hl))',
        background: active ? 'rgba(94,106,210,0.12)' : 'rgb(var(--ds-s1))',
        color: active ? 'rgb(var(--ds-accent))' : 'rgb(var(--ds-ink-s))',
      }}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}

/* ── Main page ───────────────────────────────────────────────────────────────── */
export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showUploader, setShowUploader] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('')

  const fetchDocs = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await documentService.getDocuments(categoryFilter ? { category: categoryFilter } : {})
      setDocuments(res.data?.documents || [])
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDocs() }, [categoryFilter])

  const handleUploadComplete = () => {
    setShowUploader(false)
    fetchDocs()
  }

  const CATEGORIES = [
    { value: '',            label: 'All' },
    { value: 'aadhaar',    label: 'Aadhaar' },
    { value: 'pan',        label: 'PAN Card' },
    { value: 'income',     label: 'Income' },
    { value: 'bank',       label: 'Bank' },
    { value: 'land',       label: 'Land' },
    { value: 'education',  label: 'Education' },
    { value: 'disability', label: 'Disability' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-eyebrow mb-1">Secure Storage</p>
          <h1 className="page-title">Document Vault</h1>
          <p className="mt-1 text-[13px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>
            Securely store documents. AI verifies them against scheme requirements.
          </p>
        </div>
        <button
          onClick={() => setShowUploader(!showUploader)}
          className="btn-primary flex items-center gap-2"
          aria-expanded={showUploader}
        >
          <Upload className="w-3.5 h-3.5" aria-hidden="true" />
          Upload Document
        </button>
      </div>

      {/* Upload panel */}
      <AnimatePresence>
        {showUploader && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              style={{
                background: 'rgb(var(--ds-s1))',
                border: '1px solid rgb(var(--ds-hl))',
                borderRadius: 12,
                padding: 20,
              }}
            >
              {/* Header inside panel */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(94,106,210,0.10)', border: '1px solid rgba(94,106,210,0.15)' }}
                  aria-hidden="true"
                >
                  <Shield className="w-3.5 h-3.5" style={{ color: 'rgb(var(--ds-accent))' }} />
                </div>
                <div>
                  <h2 className="section-title" style={{ fontSize: 14 }}>Upload New Document</h2>
                  <p className="text-[11px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>
                    PDF, JPG, PNG — max 10MB
                  </p>
                </div>
              </div>
              <DocumentUploader onUploadComplete={handleUploadComplete} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category pills */}
      {(documents.length > 0 || categoryFilter) && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide" role="group" aria-label="Filter by category">
          {CATEGORIES.map(({ value, label }) => (
            <CategoryPill
              key={value}
              value={value}
              label={label}
              active={categoryFilter === value}
              onClick={setCategoryFilter}
            />
          ))}
        </div>
      )}

      {/* Document list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDocs} />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload your documents to keep them organized and let AI verify them for scheme applications."
          action={
            <button onClick={() => setShowUploader(true)} className="btn-primary flex items-center gap-2 mt-2">
              <Upload className="w-3.5 h-3.5" />
              Upload your first document
            </button>
          }
        />
      ) : (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {documents.map((doc) => (
            <DocumentCard key={doc.id || doc.document_id} doc={doc} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
