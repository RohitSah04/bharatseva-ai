import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function LoginPage() {
  const { loginUser, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    await loginUser(email, password)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-2">Sign in to your BharatSeva AI account</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="label mb-0">Password</label>
              <button
                type="button"
                onClick={() => alert('Please contact support to reset your password.')}
                className="text-xs text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="btn-primary w-full py-2.5"
          >
            {loading ? <LoadingSpinner size="sm" className="text-white" /> : 'Sign in'}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs font-semibold text-blue-700 mb-1">Demo credentials</p>
          <p className="text-xs text-blue-600">admin@bharatseva.ai / Admin@12345</p>
          <p className="text-xs text-blue-600">ramesh@demo.ai / Citizen@123</p>
        </div>
      </div>

      <p className="text-center text-sm text-gray-600 mt-5">
        Don't have an account?{' '}
        <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
          Sign up free
        </Link>
      </p>
    </motion.div>
  )
}
