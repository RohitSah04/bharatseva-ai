import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import { LoadingSpinner } from '@/components/LoadingSpinner'

/* ── BSLogo ──────────────────────────────────────────────────────────────────── */
function BSLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#5e6ad2" />
      <path d="M7 7h5a3 3 0 0 1 0 6H7V7zm0 6h5.5a3.5 3.5 0 0 1 0 4H7v-4z" fill="white" opacity="0.9" />
    </svg>
  )
}

/* ── Password strength indicator ─────────────────────────────────────────────── */
function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ chars', pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
  ]
  if (!password) return null
  return (
    <div className="flex gap-2 mt-2 flex-wrap" aria-label="Password requirements">
      {checks.map(({ label, pass }) => (
        <span
          key={label}
          className="flex items-center gap-1 text-[11px]"
          style={{ color: pass ? '#27a644' : 'rgb(var(--ds-ink-s))' }}
        >
          <CheckCircle className="w-3 h-3" aria-hidden="true" />
          {label}
        </span>
      ))}
    </div>
  )
}

export default function SignupPage() {
  const { signupUser, loading, error } = useAuth()
  const { t } = useTranslation()
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Wordmark */}
      <div className="flex flex-col items-center mb-8">
        <BSLogo />
        <h1
          className="mt-3 text-[22px] font-semibold leading-tight"
          style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.025em' }}
        >
          {t('create_account')}
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>
          {t('create_account_subtitle')}
        </p>
      </div>

      {/* Form card */}
      <div
        style={{
          background: 'rgb(var(--ds-s1))',
          border: '1px solid rgb(var(--ds-hl))',
          borderRadius: 12,
          padding: 24,
        }}
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* Error banner */}
          <AnimatePresence>
            {displayError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-2 p-3 rounded-lg overflow-hidden"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} aria-hidden="true" />
                <p className="text-[12px]" style={{ color: '#f87171' }}>{displayError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div>
            <label htmlFor="signup-email" className="label">{t('email')}</label>
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

          {/* Password */}
          <div>
            <label htmlFor="signup-password" className="label">{t('password')}</label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingRight: 40 }}
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'rgb(var(--ds-ink-s))' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'rgb(var(--ds-ink))' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgb(var(--ds-ink-s))' }}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="confirm-password" className="label">{t('confirm_password')}</label>
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password || !confirm}
            className="btn-primary w-full flex items-center justify-center gap-2"
            style={{ padding: '10px 14px' }}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Creating account…
              </>
            ) : t('create_account')}
          </button>
        </form>
      </div>

      {/* Sign in link */}
      <p className="text-center text-[13px] mt-5" style={{ color: 'rgb(var(--ds-ink-s))' }}>
        {t('have_account')}{' '}
        <Link
          to="/login"
          className="font-semibold transition-colors"
          style={{ color: 'rgb(var(--ds-accent))', textDecoration: 'none' }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        >
          {t('sign_in')}
        </Link>
      </p>
    </motion.div>
  )
}
