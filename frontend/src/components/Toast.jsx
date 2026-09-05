/**
 * Toast — lightweight animated toast system using Framer Motion.
 * Usage:
 *   import { toast } from '@/components/Toast'
 *   toast.success('Scheme saved!')
 *   toast.error('Failed to save')
 *   toast.info('Processing...')
 *
 * Mount <ToastContainer /> once in App.jsx or CitizenLayout.
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)

let _addToast = null

export const toast = {
  success: (message, opts) => _addToast?.({ type: 'success', message, ...opts }),
  error:   (message, opts) => _addToast?.({ type: 'error',   message, ...opts }),
  info:    (message, opts) => _addToast?.({ type: 'info',    message, ...opts }),
  warning: (message, opts) => _addToast?.({ type: 'warning', message, ...opts }),
}

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  info:    Info,
  warning: AlertTriangle,
}

const STYLES = {
  success: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
  error:   'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  info:    'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300',
  warning: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
}

const ICON_COLORS = {
  success: 'text-emerald-500',
  error:   'text-red-500',
  info:    'text-indigo-500',
  warning: 'text-amber-500',
}

function ToastItem({ id, type, message, onDismiss }) {
  const Icon = ICONS[type] || Info

  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 4000)
    return () => clearTimeout(t)
  }, [id, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      role="alert"
      aria-live="assertive"
      className={`flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)] p-3.5 rounded-xl border shadow-float backdrop-blur-sm ${STYLES[type]}`}
    >
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${ICON_COLORS[type]}`} aria-hidden="true" />
      <p className="text-sm font-medium flex-1 leading-snug">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((t) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev.slice(-4), { ...t, id }])
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Register global imperative API
  useEffect(() => {
    _addToast = addToast
    return () => { _addToast = null }
  }, [addToast])

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 items-end"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}
