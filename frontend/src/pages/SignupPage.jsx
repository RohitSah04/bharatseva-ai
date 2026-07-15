import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/LoadingSpinner'

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
  ]
  if (!password) return null
  return (
    <div className="flex gap-2 mt-1.5 flex-wrap" aria-label="Password requirements">
      {checks.map(({ label, pass }) => (
        <span key={label} className={`flex items-center gap-1 text-xs ${pass ? 'text-emerald-600' : 'text-gray-400'}`}>
          <CheckCircle className="w-3 h-3" aria-hidden="true" />
          {label}
        </span>
      ))}
    </div>
  )
}

export default function SignupPage() {
  const { signupUser, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (password !== confirm) {
      setFormError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.')
      return
    }
    await signupUser(email, password)
  }

  const displayError = formError || error

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="text-sm text-gray-500 mt-2">Start discovering government schemes you qualify for</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {displayError && (
            <div role="alert" className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-red-700">{displayError}</p>
            </div>
          )}

          <div>
            <label htmlFor="signup-email" className="label">Email address</label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="label">Password</label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="At least 8 characters"
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
            <PasswordStrength password={password} />
          </div>

          <div>
            <label htmlFor="confirm-password" className="label">Confirm password</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input-field"
              placeholder="Repeat your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password || !confirm}
            className="btn-primary w-full py-2.5"
          >
            {loading ? <LoadingSpinner size="sm" className="text-white" /> : 'Create account'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-gray-600 mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}
