import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Home, Search } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md"
      >
        <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-6" aria-hidden="true">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-6xl font-black text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Page not found</h2>
        <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
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
