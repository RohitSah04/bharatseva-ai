import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, CheckCircle, X } from 'lucide-react'
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

export default function LoginPage() {
  const { loginUser, loading, error } = useAuth()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    await loginUser(email, password)
  }

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
          {t('welcome_back')}
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>
          {t('sign_in_subtitle')}
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
            {error && (
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
                <p className="text-[12px]" style={{ color: '#f87171' }}>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div>
            <label htmlFor="email" className="label">{t('email')}</label>
            <input
              id="email"
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
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="label" style={{ marginBottom: 0 }}>{t('password')}</label>
              <button
                type="button"
                onClick={() => setForgotSent(true)}
                className="text-[12px] transition-colors"
                style={{ color: 'rgb(var(--ds-accent))' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >
                {t('forgot_password')}
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
                className="input-field"
                style={{ paddingRight: 40 }}
                placeholder="Enter your password"
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
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="btn-primary w-full flex items-center justify-center gap-2"
            style={{ padding: '10px 14px' }}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Signing in…
              </>
            ) : t('sign_in')}
          </button>
        </form>

        {/* Forgot password notice */}
        <AnimatePresence>
          {forgotSent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              role="alert"
              aria-live="polite"
              className="mt-4 flex items-start gap-2 p-3 rounded-lg overflow-hidden"
              style={{ background: 'rgba(94,106,210,0.08)', border: '1px solid rgba(94,106,210,0.20)' }}
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'rgb(var(--ds-accent))' }} aria-hidden="true" />
              <p className="text-[12px] flex-1" style={{ color: 'rgb(var(--ds-ink-m))' }}>
                Password reset is not available in this demo. Contact <strong>support@bharatseva.ai</strong>.
              </p>
              <button
                onClick={() => setForgotSent(false)}
                className="flex-shrink-0 transition-opacity hover:opacity-70"
                style={{ color: 'rgb(var(--ds-ink-s))' }}
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dev credentials */}
        {import.meta.env.DEV && (
          <div
            className="mt-4 p-3 rounded-lg"
            style={{ background: 'rgb(var(--ds-s2))', border: '1px solid rgb(var(--ds-hl))' }}
          >
            <p className="text-[11px] font-semibold mb-1 uppercase tracking-wide" style={{ color: 'rgb(var(--ds-ink-s))' }}>
              Demo credentials
            </p>
            <p className="text-[11px] font-mono" style={{ color: 'rgb(var(--ds-ink-m))' }}>admin@bharatseva.ai / Admin@12345</p>
            <p className="text-[11px] font-mono" style={{ color: 'rgb(var(--ds-ink-m))' }}>ramesh@demo.ai / Citizen@123</p>
          </div>
        )}
      </div>

      {/* Sign up link */}
      <p className="text-center text-[13px] mt-5" style={{ color: 'rgb(var(--ds-ink-s))' }}>
        {t('no_account')}{' '}
        <Link
          to="/signup"
          className="font-semibold transition-colors"
          style={{ color: 'rgb(var(--ds-accent))', textDecoration: 'none' }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        >
          {t('signup')}
        </Link>
      </p>
    </motion.div>
  )
}
