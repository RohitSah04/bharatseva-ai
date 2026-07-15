import { AlertTriangle } from 'lucide-react'

export function DegradedModeBanner({ reason }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm"
    >
      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div>
        <span className="font-semibold text-amber-800">AI Degraded Mode — </span>
        <span className="text-amber-700">
          {reason || 'AI service is temporarily unavailable. Results are based on rule-based logic and may be less accurate.'}
        </span>
      </div>
    </div>
  )
}
