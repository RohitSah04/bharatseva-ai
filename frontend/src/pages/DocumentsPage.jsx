import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Upload, Eye, Tag, Calendar, AlertCircle } from 'lucide-react'
import { documentService } from '@/services/documentService'
import { DocumentUploader } from '@/components/DocumentUploader'
import { PageLoader, SkeletonCard } from '@/components/LoadingSpinner'
import { EmptyState, ErrorState } from '@/components/ErrorState'
import clsx from 'clsx'

const VERIFICATION_STYLES = {
  VERIFIED: { label: 'Verified', color: 'bg-emerald-100 text-emerald-800' },
  MISMATCH: { label: 'Mismatch', color: 'bg-red-100 text-red-700' },
  UNREADABLE: { label: 'Unreadable', color: 'bg-gray-100 text-gray-600' },
  PENDING: { label: 'Pending AI Review', color: 'bg-yellow-100 text-yellow-800' },
}

function DocumentCard({ doc }) {
  const [expanded, setExpanded] = useState(false)
  const status = VERIFICATION_STYLES[doc.verified_against_requirement] || VERIFICATION_STYLES.PENDING

  return (
    <div className="card p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0" aria-hidden="true">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{doc.filename}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={clsx('badge text-xs', status.color)}>{status.label}</span>
                {doc.category && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Tag className="w-3 h-3" aria-hidden="true" />
                    {doc.category}
                  </span>
                )}
                {doc.created_at && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" aria-hidden="true" />
                    {new Date(doc.created_at).toLocaleDateString('en-IN')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {doc.ai_explanation && (
            <div className="mt-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-blue-600 hover:underline"
                aria-expanded={expanded}
              >
                {expanded ? 'Hide AI explanation' : 'View AI explanation'}
              </button>
              {expanded && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-xs text-gray-600 mt-1.5 p-2 bg-gray-50 rounded-lg"
                >
                  {doc.ai_explanation}
                </motion.p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Document Vault</h1>
          <p className="text-sm text-gray-500 mt-1">
            Securely store and manage documents. AI verifies them against scheme requirements.
          </p>
        </div>
        <button
          onClick={() => setShowUploader(!showUploader)}
          className="btn-primary"
          aria-expanded={showUploader}
        >
          <Upload className="w-4 h-4" aria-hidden="true" />
          Upload Document
        </button>
      </div>

      {/* Uploader */}
      {showUploader && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="card p-5"
        >
          <h2 className="section-title mb-3">Upload New Document</h2>
          <DocumentUploader onUploadComplete={handleUploadComplete} />
        </motion.div>
      )}

      {/* Category filter */}
      {documents.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {['', 'aadhaar', 'income', 'bank', 'land', 'education', 'disability'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                categoryFilter === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              )}
              aria-pressed={categoryFilter === cat}
            >
              {cat === '' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
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
            <button onClick={() => setShowUploader(true)} className="btn-primary mt-2">
              <Upload className="w-4 h-4" />
              Upload your first document
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <DocumentCard key={doc.id || doc.document_id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  )
}
