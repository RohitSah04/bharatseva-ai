import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminService } from '@/services/adminService'
import { SkeletonBlock } from '@/components/LoadingSpinner'
import { ErrorState, EmptyState } from '@/components/ErrorState'
import { Zap, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import clsx from 'clsx'

function FlagToggle({ flag, onToggle }) {
  const [pending, setPending] = useState(false)
  const [justChanged, setJustChanged] = useState(null) // 'enabled' | 'disabled' | null

  const handleToggle = async () => {
    setPending(true)
    const next = !flag.enabled
    try {
      await onToggle(flag.flag_name, next)
      setJustChanged(next ? 'enabled' : 'disabled')
      setTimeout(() => setJustChanged(null), 2000)
    } finally {
      setPending(false)
    }
  }

  return (
    <motion.div
      layout
      className="flex items-start justify-between gap-4 py-4 border-b border-slate-100 dark:border-slate-800 last:border-0"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-semibold text-slate-900 dark:text-white text-sm font-mono">{flag.flag_name}</p>
          {/* Persisted status confirmation */}
          <AnimatePresence>
            {justChanged && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={clsx(
                  'flex items-center gap-1 text-[10px] font-semibold',
                  justChanged === 'enabled'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400',
                )}
              >
                <CheckCircle className="w-3 h-3" aria-hidden="true" />
                {justChanged === 'enabled' ? 'Enabled' : 'Disabled'} — saved to DB
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {flag.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            {flag.description}
          </p>
        )}
        {flag.updated_at && (
          <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1">
            Last updated {new Date(flag.updated_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            {flag.updated_by && ` by admin`}
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
          'relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200',
          'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
          'disabled:opacity-60 disabled:cursor-wait',
          flag.enabled
            ? 'bg-indigo-600 dark:bg-indigo-500'
            : 'bg-slate-200 dark:bg-slate-700',
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={clsx(
            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm',
            flag.enabled ? 'left-5' : 'left-0.5',
          )}
          aria-hidden="true"
        />
        {pending && (
          <span className="absolute inset-0 flex items-center justify-center">
            <RefreshCw className="w-3 h-3 text-white animate-spin" aria-hidden="true" />
          </span>
        )}
      </button>
    </motion.div>
  )
}

export default function AdminFlagsPage() {
  const [flags,    setFlags]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [saveError,setSaveError]= useState(null)

  const fetchFlags = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminService.getFeatureFlags()
      // Backend returns { feature_flags: [...] }
      setFlags(res.data?.feature_flags || res.data?.flags || [])
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load feature flags')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFlags() }, [fetchFlags])

  const handleToggle = async (flagName, enabled) => {
    setSaveError(null)
    try {
      const res = await adminService.updateFeatureFlag(flagName, enabled)
      // Update from server response to stay in sync
      const updated = res.data
      setFlags((prev) =>
        prev.map((f) =>
          f.flag_name === flagName
            ? { ...f, enabled: updated?.enabled ?? enabled, updated_at: updated?.updated_at ?? new Date().toISOString() }
            : f,
        ),
      )
    } catch (err) {
      setSaveError(err.response?.data?.error?.message || 'Failed to save flag — try again')
      // Revert optimistic UI
      setFlags((prev) => prev.map((f) => f.flag_name === flagName ? { ...f, enabled: !enabled } : f))
    }
  }

  const enabledCount  = flags.filter((f) => f.enabled).length
  const disabledCount = flags.length - enabledCount

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-indigo-500" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Feature Flags</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Toggle features at runtime — persisted to the database, no redeploy required.
            {flags.length > 0 && ` · ${enabledCount} enabled, ${disabledCount} disabled`}
          </p>
        </div>
        <button
          onClick={fetchFlags}
          disabled={loading}
          className="btn-secondary text-sm"
          aria-label="Refresh feature flags"
        >
          <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* Save error banner */}
      <AnimatePresence>
        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            role="alert"
            className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {saveError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flag list */}
      {loading ? (
        <div className="card p-5 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-2">
              <div className="flex-1 space-y-1.5">
                <SkeletonBlock className="h-4 w-40" />
                <SkeletonBlock className="h-3 w-64" />
              </div>
              <SkeletonBlock className="h-6 w-11 rounded-full flex-shrink-0" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchFlags} />
      ) : flags.length === 0 ? (
        <EmptyState
          title="No feature flags configured"
          description="Feature flags let you toggle platform features at runtime without redeploying. Run the seed script to initialise the default flags."
          variant="default"
        />
      ) : (
        <motion.div layout className="card p-5 divide-y divide-slate-100 dark:divide-slate-800">
          {flags.map((flag) => (
            <FlagToggle key={flag.flag_name} flag={flag} onToggle={handleToggle} />
          ))}
        </motion.div>
      )}

      {/* Info box */}
      {!loading && !error && flags.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl">
          <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
            All flag changes are persisted immediately to the database and take effect on the next
            API request — no server restart required. The updated timestamp reflects when the flag was last toggled.
          </p>
        </div>
      )}
    </div>
  )
}
