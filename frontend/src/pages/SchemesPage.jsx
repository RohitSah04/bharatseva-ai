import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSchemes } from '@/hooks/useSchemes'
import { SchemeCard } from '@/components/SchemeCard'
import { PageLoader, SkeletonCard } from '@/components/LoadingSpinner'
import { ErrorState, EmptyState } from '@/components/ErrorState'
import clsx from 'clsx'

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'farmer', label: 'Farmer' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'women', label: 'Women' },
  { value: 'senior_citizen', label: 'Senior Citizen' },
  { value: 'disability', label: 'Disability' },
  { value: 'startup', label: 'Startup' },
  { value: 'msme', label: 'MSME' },
]

export default function SchemesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { schemes, total, loading, error, fetchSchemes } = useSchemes()
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    state: searchParams.get('state') || '',
    occupation: searchParams.get('occupation') || '',
  })
  const [page, setPage] = useState(1)
  const PER_PAGE = 20

  const doFetch = useCallback((params) => {
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v != null),
    )
    fetchSchemes({ ...cleaned, page: params.page || 1, per_page: PER_PAGE })
  }, [fetchSchemes])

  useEffect(() => {
    doFetch({ ...filters, page })
  }, [filters, page, doFetch])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    doFetch({ ...filters, page: 1 })
    const params = {}
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
    setSearchParams(params)
  }

  const setFilter = (key, value) => {
    const next = { ...filters, [key]: value }
    setFilters(next)
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({ q: '', category: '', state: '', occupation: '' })
    setSearchParams({})
    setPage(1)
  }

  const totalPages = Math.ceil(total / PER_PAGE)
  const hasActiveFilters = filters.q || filters.category || filters.state || filters.occupation

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div>
        <h1 className="page-title">Browse Schemes</h1>
        <p className="text-sm text-gray-500 mt-1">{total > 0 ? `${total} schemes found` : 'Search government schemes'}</p>
      </div>

      {/* Search + Filters */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <label htmlFor="scheme-search" className="sr-only">Search schemes</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input
              id="scheme-search"
              type="search"
              placeholder="Search schemes by name, keyword..."
              value={filters.q}
              onChange={(e) => setFilter('q', e.target.value)}
              className="input-field pl-9 pr-4"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-1 px-3 text-xs">
              Search
            </button>
          </div>

          {/* Filters row */}
          <div className="flex gap-3 flex-wrap items-center">
            <div>
              <label htmlFor="category-filter" className="sr-only">Filter by category</label>
              <select
                id="category-filter"
                value={filters.category}
                onChange={(e) => setFilter('category', e.target.value)}
                className="input-field py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="state-filter" className="sr-only">Filter by scope</label>
              <select
                id="state-filter"
                value={filters.state}
                onChange={(e) => setFilter('state', e.target.value)}
                className="input-field py-2 text-sm"
              >
                <option value="">All India + State</option>
                <option value="all_india">All India</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Bihar">Bihar</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                Clear filters
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter('category', value)}
            className={clsx(
              'whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex-shrink-0',
              filters.category === value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            )}
            aria-pressed={filters.category === value}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => doFetch({ ...filters, page })} />
      ) : schemes.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No schemes found"
          description="Try adjusting your search or clearing the filters."
          action={
            hasActiveFilters && (
              <button onClick={clearFilters} className="btn-secondary mt-2">Clear filters</button>
            )
          }
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {schemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 pt-2" aria-label="Pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary py-1.5 px-3"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary py-1.5 px-3"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}
