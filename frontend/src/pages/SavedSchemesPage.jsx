import { useEffect, useState } from 'react'
import { Bookmark, ExternalLink, Trash2, Search } from 'lucide-react'
import { useSavedSchemes } from '@/hooks/useSavedSchemes'
import { useNavigate } from 'react-router-dom'
import { PageLoader } from '@/components/LoadingSpinner'
import { EmptyState } from '@/components/ErrorState'
import clsx from 'clsx'

export default function SavedSchemesPage() {
  const { savedSchemes, loading, removeScheme } = useSavedSchemes()
  const navigate = useNavigate()
  const [removing, setRemoving] = useState(null)

  const handleRemove = async (schemeId) => {
    setRemoving(schemeId)
    try {
      await removeScheme(schemeId)
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div>
        <h1 className="page-title">Saved Schemes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Schemes you've bookmarked for easy access.
        </p>
      </div>

      {loading ? (
        <PageLoader />
      ) : savedSchemes.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved schemes"
          description="Browse schemes and save the ones you're interested in."
          action={
            <button onClick={() => navigate('/schemes')} className="btn-primary mt-2">
              <Search className="w-4 h-4" />
              Browse schemes
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {savedSchemes.map((saved) => (
            <div
              key={saved.scheme_id}
              className="card p-4 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => navigate(`/schemes/${saved.scheme_id}`)}
                  className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-sm text-left"
                >
                  {saved.scheme_name || 'Government Scheme'}
                </button>
                {saved.saved_at && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Saved {new Date(saved.saved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate(`/schemes/${saved.scheme_id}`)}
                  className="btn-ghost py-1.5 px-3 text-xs"
                  aria-label={`View details for ${saved.scheme_name}`}
                >
                  View
                </button>
                <button
                  onClick={() => handleRemove(saved.scheme_id)}
                  disabled={removing === saved.scheme_id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label={`Remove ${saved.scheme_name} from saved schemes`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
