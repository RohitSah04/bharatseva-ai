import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSchemes } from '@/hooks/useSchemes'
import { SchemeCard } from '@/components/SchemeCard'
import { SkeletonCard } from '@/components/LoadingSpinner'
import { ErrorState, EmptyState } from '@/components/ErrorState'
import clsx from 'clsx'

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'farmer',             label: 'Farmer' },
  { value: 'women',              label: 'Women' },
  { value: 'scholarship',        label: 'Education' },
  { value: 'health',             label: 'Health' },
  { value: 'housing',            label: 'Housing' },
  { value: 'msme',               label: 'MSME' },
  { value: 'employment',         label: 'Employment' },
  { value: 'skill',              label: 'Skill' },
  { value: 'financial_inclusion',label: 'Finance' },
  { value: 'disability',         label: 'Disability' },
  { value: 'senior_citizen',     label: 'Senior' },
  { value: 'startup',            label: 'Startup' },
  { value: 'tribal',             label: 'Tribal' },
  { value: 'food_security',      label: 'Food' },
  { value: 'energy',             label: 'Energy' },
  { value: 'infrastructure',     label: 'Infrastructure' },
  { value: 'digital',            label: 'Digital' },
  { value: 'sanitation',         label: 'Sanitation' },
  { value: 'transport',          label: 'Transport' },
]

const STATES = [
  { value: '', label: 'All States' },
  { value: 'ALL_INDIA',      label: 'All India' },
  { value: 'BIHAR',          label: 'Bihar' },
  { value: 'GUJARAT',        label: 'Gujarat' },
  { value: 'KARNATAKA',      label: 'Karnataka' },
  { value: 'MAHARASHTRA',    label: 'Maharashtra' },
  { value: 'ODISHA',         label: 'Odisha' },
  { value: 'RAJASTHAN',      label: 'Rajasthan' },
  { value: 'TAMIL_NADU',     label: 'Tamil Nadu' },
  { value: 'TELANGANA',      label: 'Telangana' },
  { value: 'UTTAR_PRADESH',  label: 'Uttar Pradesh' },
  { value: 'WEST_BENGAL',    label: 'West Bengal' },
]

/* ── Category pill ──────────────────────────────────────────────────────────── */
function Pill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="whitespace-nowrap text-[12px] font-medium transition-all duration-150 flex-shrink-0"
      style={{
        padding: '4px 12px',
        borderRadius: 9999,
        border: '1px solid',
        borderColor: active ? 'rgb(var(--ds-accent))' : 'rgb(var(--ds-hl))',
        background: active ? 'rgba(94,106,210,0.12)' : 'rgb(var(--ds-s1))',
        color: active ? 'rgb(var(--ds-accent))' : 'rgb(var(--ds-ink-s))',
      }}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}

/* ── Select ────────────────────────────────────────────────────────────────── */
function DSSelect({ id, label, value, onChange, options }) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">{label}</label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="input-field text-[13px]"
        style={{ padding: '7px 12px', minWidth: 140 }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────────────────────────── */
export default function SchemesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { schemes, total, loading, error, fetchSchemes } = useSchemes()
  const [filters, setFilters] = useState({
    q:         searchParams.get('q') || '',
    category:  searchParams.get('category') || '',
    state:     searchParams.get('state') || '',
    occupation:searchParams.get('occupation') || '',
  })
  const [page, setPage] = useState(1)
  const PER_PAGE = 20

  const doFetch = useCallback((params) => {
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v != null),
    )
    fetchSchemes({ ...cleaned, page: params.page || 1, per_page: PER_PAGE })
  }, [fetchSchemes])

  useEffect(() => { doFetch({ ...filters, page }) }, [filters, page, doFetch])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    doFetch({ ...filters, page: 1 })
    const params = {}
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
    setSearchParams(params)
  }

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
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

      {/* Header */}
      <div>
        <p className="text-eyebrow mb-1">96 Government Schemes</p>
        <h1 className="page-title">Browse Schemes</h1>
        <p className="mt-1 text-[13px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>
          {total > 0 ? `${total} schemes found` : 'Search government schemes'}
        </p>
      </div>

      {/* Search + filters card */}
      <div
        style={{
          background: 'rgb(var(--ds-s1))',
          border: '1px solid rgb(var(--ds-hl))',
          borderRadius: 12,
          padding: 16,
        }}
      >
        <form onSubmit={handleSearch} className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <label htmlFor="scheme-search" className="sr-only">Search schemes</label>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: 'rgb(var(--ds-ink-s))' }}
              aria-hidden="true"
            />
            <input
              id="scheme-search"
              type="search"
              placeholder="Search schemes by name, keyword, benefit…"
              value={filters.q}
              onChange={(e) => setFilter('q', e.target.value)}
              className="input-field"
              style={{ paddingLeft: 36, paddingRight: 80 }}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary"
              style={{ padding: '4px 12px', fontSize: 12 }}
            >
              Search
            </button>
          </div>

          {/* Dropdowns + clear */}
          <div className="flex gap-3 flex-wrap items-center">
            <DSSelect
              id="category-filter"
              label="Filter by category"
              value={filters.category}
              onChange={(e) => setFilter('category', e.target.value)}
              options={CATEGORIES}
            />
            <DSSelect
              id="state-filter"
              label="Filter by state"
              value={filters.state}
              onChange={(e) => setFilter('state', e.target.value)}
              options={STATES}
            />
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-[12px] transition-colors"
                style={{ color: 'rgb(var(--ds-ink-s))' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'rgb(var(--ds-ink))' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgb(var(--ds-ink-s))' }}
              >
                <X className="w-3 h-3" aria-hidden="true" />
                Clear filters
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Category pills */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide"
        role="group"
        aria-label="Filter by category"
      >
        {CATEGORIES.map(({ value, label }) => (
          <Pill
            key={value}
            label={label}
            active={filters.category === value}
            onClick={() => setFilter('category', value)}
          />
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
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {schemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              className="flex items-center justify-center gap-2 pt-2"
              aria-label="Pagination"
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary flex items-center gap-1"
                style={{ padding: '6px 10px' }}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <span className="text-[12px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary flex items-center gap-1"
                style={{ padding: '6px 10px' }}
                aria-label="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}
