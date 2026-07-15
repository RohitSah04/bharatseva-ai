import { useEffect, useState } from 'react'
import { adminService } from '@/services/adminService'
import { PageLoader } from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/ErrorState'
import { ToggleLeft } from 'lucide-react'
import clsx from 'clsx'

function FlagToggle({ flag, onToggle }) {
  const [pending, setPending] = useState(false)

  const handleToggle = async () => {
    setPending(true)
    try {
      await onToggle(flag.flag_name, !flag.enabled)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <p className="font-semibold text-gray-900 text-sm font-mono">{flag.flag_name}</p>
        {flag.description && <p className="text-xs text-gray-500 mt-0.5">{flag.description}</p>}
        {flag.updated_at && (
          <p className="text-xs text-gray-400 mt-0.5">
            Updated {new Date(flag.updated_at).toLocaleString('en-IN')}
          </p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={flag.enabled}
        aria-label={`${flag.flag_name}: ${flag.enabled ? 'enabled' : 'disabled'}`}
        onClick={handleToggle}
        disabled={pending}
        className={clsx(
          'relative w-11 h-6 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50',
          flag.enabled ? 'bg-blue-600' : 'bg-gray-300',
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
            flag.enabled ? 'left-5' : 'left-0.5',
          )}
          aria-hidden="true"
        />
      </button>
    </div>
  )
}

export default function AdminFlagsPage() {
  const [flags, setFlags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFlags = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminService.getFeatureFlags()
      setFlags(res.data?.flags || res.data || [])
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load feature flags')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFlags() }, [])

  const handleToggle = async (flagName, enabled) => {
    try {
      await adminService.updateFeatureFlag(flagName, enabled)
      setFlags((prev) => prev.map((f) => f.flag_name === flagName ? { ...f, enabled } : f))
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update flag')
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Feature Flags</h1>
        <p className="text-sm text-gray-500">Toggle features at runtime — no redeploy required.</p>
      </div>

      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={fetchFlags} /> : (
        <div className="card p-5">
          {flags.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No feature flags configured.</p>
          ) : (
            flags.map((flag) => (
              <FlagToggle key={flag.flag_name} flag={flag} onToggle={handleToggle} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
