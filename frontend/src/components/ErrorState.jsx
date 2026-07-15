import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react'

export function ErrorState({ message, onRetry, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
      role="alert"
    >
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-500" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">Something went wrong</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-sm">{message || 'An unexpected error occurred. Please try again.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary gap-2">
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-gray-400" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title || 'Nothing here yet'}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  )
}

export function NetworkError({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <WifiOff className="w-10 h-10 text-gray-300 mb-4" aria-hidden="true" />
      <h3 className="text-base font-semibold text-gray-900 mb-1">No connection</h3>
      <p className="text-sm text-gray-500 mb-4">Check your internet connection and try again.</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">Retry</button>
      )}
    </div>
  )
}
