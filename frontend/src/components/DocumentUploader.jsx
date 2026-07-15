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
          className={clsx(
            'border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors',
            dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50',
          )}
        >
          <Upload className="w-8 h-8 text-gray-400" aria-hidden="true" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Click or drag a file here</p>
            <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG — max 10 MB</p>
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
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {file.type.startsWith('image/') ? (
            <Image className="w-8 h-8 text-blue-500 flex-shrink-0" aria-hidden="true" />
          ) : (
            <File className="w-8 h-8 text-blue-500 flex-shrink-0" aria-hidden="true" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
            {uploading && (
              <div className="mt-1.5">
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-200"
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
              className="p-1 text-gray-400 hover:text-gray-600"
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
        <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          Uploading... {progress}%
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-900">Upload successful</span>
            <VerificationBadge status={result.verified_against_requirement} />
          </div>
          {result.ai_explanation && (
            <p className="text-xs text-gray-600">{result.ai_explanation}</p>
          )}
          <button
            onClick={() => { setFile(null); setResult(null) }}
            className="text-xs text-blue-600 hover:underline"
          >
            Upload another
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}

function VerificationBadge({ status }) {
  const map = {
    VERIFIED: { label: 'Verified', color: 'bg-emerald-100 text-emerald-800' },
    MISMATCH: { label: 'Mismatch', color: 'bg-red-100 text-red-700' },
    UNREADABLE: { label: 'Unreadable', color: 'bg-gray-100 text-gray-600' },
    PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  }
  const style = map[status] || map.PENDING
  return <span className={clsx('badge text-xs', style.color)}>{style.label}</span>
}
