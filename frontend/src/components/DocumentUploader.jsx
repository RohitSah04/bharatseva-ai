import { useRef, useState } from 'react'
import { Upload, X, File, Image, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { documentService } from '@/services/documentService'
import clsx from 'clsx'

const ACCEPT = '.pdf,.jpg,.jpeg,.png'
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentUploader({ onUploadComplete, schemeId, category, className = '' }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFile = (f) => {
    if (!f) return
    if (f.size > MAX_SIZE) {
      setError('File too large. Maximum size is 10 MB.')
      return
    }
    setFile(f)
    setResult(null)
    setError(null)
    setProgress(0)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    if (category) formData.append('category', category)
    if (schemeId) formData.append('scheme_id', schemeId)

    try {
      const res = await documentService.uploadDocument(formData, (event) => {
        if (event.total) {
          setProgress(Math.round((event.loaded / event.total) * 100))
        }
      })
      setResult(res.data)
      onUploadComplete?.(res.data)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Drop zone */}
      {!file && !result && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload document — click or drag file here"
          onClick={() => inputRef.current?.click()}
          onKeyDown={handleKeyDown}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className="drop-zone p-8 flex flex-col items-center gap-3 cursor-pointer"
          style={dragOver ? { borderColor: 'rgb(var(--ds-accent))', background: 'rgba(94,106,210,0.04)' } : {}}
        >
          <Upload className="w-8 h-8" style={{ color: 'rgb(var(--ds-ink-s))' }} aria-hidden="true" />
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: 'rgb(var(--ds-ink-m))' }}>Click or drag a file here</p>
            <p className="text-xs mt-1" style={{ color: 'rgb(var(--ds-ink-s))' }}>PDF, JPG, PNG — max 10 MB</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        aria-hidden="true"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {/* File selected */}
      {file && !result && (
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgb(var(--ds-s1))', border: '1px solid rgb(var(--ds-hl))' }}>
          {file.type.startsWith('image/') ? (
            <Image className="w-8 h-8 flex-shrink-0" style={{ color: 'rgb(var(--ds-accent))' }} aria-hidden="true" />
          ) : (
            <File className="w-8 h-8 flex-shrink-0" style={{ color: 'rgb(var(--ds-accent))' }} aria-hidden="true" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'rgb(var(--ds-ink))' }}>{file.name}</p>
            <p className="text-xs" style={{ color: 'rgb(var(--ds-ink-s))' }}>{formatSize(file.size)}</p>
            {uploading && (
              <div className="mt-1.5">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            )}
          </div>
          {!uploading && (
            <button
              onClick={() => { setFile(null); setError(null) }}
              className="p-1 transition-colors"
              style={{ color: 'rgb(var(--ds-ink-s))' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgb(var(--ds-ink))' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgb(var(--ds-ink-s))' }}
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Upload button */}
      {file && !result && !uploading && (
        <button onClick={handleUpload} className="btn-primary w-full">
          <Upload className="w-4 h-4" aria-hidden="true" />
          Upload Document
        </button>
      )}

      {uploading && (
        <div className="flex items-center justify-center gap-2 py-2 text-sm" style={{ color: 'rgb(var(--ds-ink-s))' }}>
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          Uploading... {progress}%
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="p-4 rounded-lg space-y-2" style={{ background: 'rgb(var(--ds-s1))', border: '1px solid rgb(var(--ds-hl))' }}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" style={{ color: '#27a644' }} aria-hidden="true" />
            <span className="text-sm font-semibold" style={{ color: 'rgb(var(--ds-ink))' }}>Upload successful</span>
            <VerificationBadge status={result.verified_against_requirement} />
          </div>
          {result.ai_explanation && (
            <p className="text-xs" style={{ color: 'rgb(var(--ds-ink-m))' }}>{result.ai_explanation}</p>
          )}
          <button
            onClick={() => { setFile(null); setResult(null) }}
            className="text-xs transition-opacity hover:opacity-70"
            style={{ color: 'rgb(var(--ds-accent))' }}
          >
            Upload another
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }} role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} aria-hidden="true" />
          <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>
        </div>
      )}
    </div>
  )
}

function VerificationBadge({ status }) {
  const map = {
    VERIFIED:   { label: 'Verified',   cls: 'badge-emerald' },
    MISMATCH:   { label: 'Mismatch',   cls: 'badge-red' },
    UNREADABLE: { label: 'Unreadable', cls: 'badge-indigo' },
    PENDING:    { label: 'Pending',    cls: 'badge-amber' },
  }
  const style = map[status] || map.PENDING
  return <span className={clsx('badge text-xs', style.cls)}>{style.label}</span>
}
