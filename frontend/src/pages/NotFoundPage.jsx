import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: 'rgb(var(--ds-canvas))' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md"
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(94,106,210,0.10)' }}
          aria-hidden="true"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect width="24" height="24" rx="6" fill="#5e6ad2" />
            <path d="M7 7h5a3 3 0 0 1 0 6H7V7zm0 6h5.5a3.5 3.5 0 0 1 0 4H7v-4z" fill="white" opacity="0.9" />
          </svg>
        </div>
        <h1
          className="text-6xl font-black mb-2"
          style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.03em' }}
        >
          404
        </h1>
        <h2
          className="text-xl font-semibold mb-3"
          style={{ color: 'rgb(var(--ds-ink-m))' }}
        >
          Page not found
        </h2>
        <p
          className="text-sm mb-8 max-w-sm mx-auto"
          style={{ color: 'rgb(var(--ds-ink-s))' }}
        >
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link to="/dashboard" className="btn-primary">
            <Home className="w-4 h-4" aria-hidden="true" />
            Back to Dashboard
          </Link>
          <Link to="/schemes" className="btn-secondary">
            <Search className="w-4 h-4" aria-hidden="true" />
            Browse Schemes
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
