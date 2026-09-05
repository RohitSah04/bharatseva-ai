import { motion } from 'framer-motion'

/* ── Inline spinner — minimal ring ───────────────────────────────────────────── */
export function LoadingSpinner({ size = 'md', className = '' }) {
  const px = { sm: 14, md: 18, lg: 24, xl: 32 }[size] || 18
  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{
        width: px, height: px,
        borderRadius: '50%',
        border: '1.5px solid rgb(var(--ds-hl-s))',
        borderTopColor: 'rgb(var(--ds-accent))',
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  )
}

/* ── Page loader — linear top progress + fade ────────────────────────────────── */
export function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      style={{ background: 'rgb(var(--ds-canvas))' }}
      className="flex items-center justify-center min-h-[360px]"
    >
      <div className="flex flex-col items-center gap-3">
        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect width="24" height="24" rx="6" fill="#5e6ad2" />
            <path d="M7 7h5a3 3 0 0 1 0 6H7V7zm0 6h5.5a3.5 3.5 0 0 1 0 4H7v-4z" fill="white" opacity="0.9" />
          </svg>
        </motion.div>

        {/* Slim progress bar */}
        <div
          style={{
            width: 120,
            height: 2,
            background: 'rgb(var(--ds-s2))',
            borderRadius: 9999,
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          <motion.div
            style={{
              height: '100%',
              background: 'rgb(var(--ds-accent))',
              borderRadius: 9999,
            }}
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <p
          className="text-[12px] font-medium"
          style={{ color: 'rgb(var(--ds-ink-s))' }}
        >
          Loading…
        </p>
      </div>
    </div>
  )
}

/* ── Skeleton block ───────────────────────────────────────────────────────────── */
export function SkeletonBlock({ className = '', style = {} }) {
  return (
    <div
      className={`skeleton-block ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

/* ── Skeleton card — matches SchemeCard shape ────────────────────────────────── */
export function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      style={{
        background: 'rgb(var(--ds-s1))',
        border: '1px solid rgb(var(--ds-hl))',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkeletonBlock style={{ height: 18, width: '40%', borderRadius: 9999 }} />
          <SkeletonBlock style={{ height: 14, width: '85%', borderRadius: 4 }} />
          <SkeletonBlock style={{ height: 14, width: '65%', borderRadius: 4 }} />
        </div>
        <SkeletonBlock style={{ height: 32, width: 32, borderRadius: 8, flexShrink: 0 }} />
      </div>
      <SkeletonBlock style={{ height: 12, width: '100%', borderRadius: 4 }} />
      <SkeletonBlock style={{ height: 12, width: '80%', borderRadius: 4 }} />
      <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
        <SkeletonBlock style={{ height: 20, width: 64, borderRadius: 9999 }} />
        <SkeletonBlock style={{ height: 20, width: 48, borderRadius: 9999 }} />
      </div>
    </div>
  )
}

/* ── Skeleton row — horizontal grid ──────────────────────────────────────────── */
export function SkeletonRow({ cols = 4 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 16,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBlock key={i} style={{ height: 96, borderRadius: 12 }} />
      ))}
    </div>
  )
}
