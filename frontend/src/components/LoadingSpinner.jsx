import { motion } from 'framer-motion'

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8', xl: 'h-12 w-12' }
  return (
    <div
      className={`inline-block ${sizes[size]} animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]" role="status" aria-label="Loading page">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="xl" className="text-blue-600" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  )
}

export function SkeletonBlock({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} aria-hidden="true" />
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3" aria-hidden="true">
      <SkeletonBlock className="h-4 w-3/4" />
      <SkeletonBlock className="h-3 w-1/2" />
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-5/6" />
      <div className="flex gap-2 pt-2">
        <SkeletonBlock className="h-6 w-16 rounded-full" />
        <SkeletonBlock className="h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}
