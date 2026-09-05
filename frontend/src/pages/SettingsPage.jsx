import { useState } from 'react'
import { LogOut, Moon, Sun, Globe, Contrast } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { motion, AnimatePresence } from 'framer-motion'

/* ── Setting row ─────────────────────────────────────────────────────────────── */
function SettingRow({ label, description, children }) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-4 last:pb-0 first:pt-0"
      style={{ borderBottom: '1px solid rgb(var(--ds-hl))' }}
    >
      <div className="flex-1">
        <p className="text-[13px] font-medium leading-tight" style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.014em' }}>
          {label}
        </p>
        {description && (
          <p className="text-[11px] mt-0.5" style={{ color: 'rgb(var(--ds-ink-s))' }}>{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

/* ── Toggle switch ───────────────────────────────────────────────────────────── */
function Toggle({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative w-10 h-5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2"
      style={{
        background: checked ? 'rgb(var(--ds-accent))' : 'rgb(var(--ds-s3))',
        border: '1px solid',
        borderColor: checked ? 'rgba(94,106,210,0.5)' : 'rgb(var(--ds-hl-s))',
      }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
        style={{ left: checked ? 20 : 2 }}
        aria-hidden="true"
      />
    </button>
  )
}

/* ── Section card ────────────────────────────────────────────────────────────── */
function SettingSection({ title, description, children }) {
  return (
    <div
      style={{
        background: 'rgb(var(--ds-s1))',
        border: '1px solid rgb(var(--ds-hl))',
        borderRadius: 12,
        padding: '20px',
      }}
    >
      <h2
        className="section-title mb-0.5"
        style={{ fontSize: 13 }}
      >
        {title}
      </h2>
      {description && (
        <p className="text-[11px] mb-4" style={{ color: 'rgb(var(--ds-ink-s))' }}>{description}</p>
      )}
      <div className="[&>*:last-child]:border-b-0">
        {children}
      </div>
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const { highContrast, toggleHighContrast, theme, setTheme } = useUIStore()
  const { logoutUser } = useAuth()
  const { t } = useTranslation()
  const [confirmLogout, setConfirmLogout] = useState(false)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">

      {/* Header */}
      <div>
        <p className="text-eyebrow mb-1">Preferences</p>
        <h1 className="page-title">{t('settings')}</h1>
        <p className="mt-1 text-[13px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>
          Manage your account and accessibility preferences.
        </p>
      </div>

      {/* Accessibility */}
      <SettingSection
        title={t('accessibility')}
        description={t('accessibility_desc')}
      >
        <SettingRow label={t('high_contrast')} description={t('high_contrast_desc')}>
          <Toggle
            checked={highContrast}
            onChange={toggleHighContrast}
            label="Toggle high contrast mode"
          />
        </SettingRow>
      </SettingSection>

      {/* Appearance & Language */}
      <SettingSection
        title={t('appearance_language')}
        description={t('appearance_desc')}
      >
        <SettingRow label={t('theme')} description={t('theme_desc')}>
          <div className="flex items-center gap-2">
            {theme === 'dark'
              ? <Moon className="w-3.5 h-3.5" style={{ color: 'rgb(var(--ds-ink-s))' }} aria-hidden="true" />
              : <Sun className="w-3.5 h-3.5" style={{ color: 'rgb(var(--ds-ink-s))' }} aria-hidden="true" />
            }
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="input-field"
              style={{ padding: '4px 10px', fontSize: 12, width: 'auto' }}
              aria-label="Theme selector"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </SettingRow>

        <SettingRow label={t('language')} description={t('language_desc')}>
          <LanguageSwitcher />
        </SettingRow>
      </SettingSection>

      {/* Account */}
      <SettingSection title={t('account')}>
        <AnimatePresence mode="wait">
          {!confirmLogout ? (
            <motion.div
              key="logout-trigger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-1"
            >
              <button
                onClick={() => setConfirmLogout(true)}
                className="flex items-center gap-2 text-[13px] font-medium transition-colors"
                style={{ color: '#f87171' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                {t('sign_out')}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="logout-confirm"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl"
              style={{
                background: 'rgba(239,68,68,0.07)',
                border: '1px solid rgba(239,68,68,0.18)',
              }}
            >
              <p
                className="text-[13px] font-medium mb-3"
                style={{ color: 'rgb(var(--ds-ink))' }}
              >
                {t('sign_out_confirm')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={logoutUser}
                  className="flex items-center gap-2 text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.30)',
                    color: '#f87171',
                  }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t('logout')}
                </button>
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="btn-secondary"
                  style={{ fontSize: 12, padding: '5px 12px' }}
                >
                  {t('cancel')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SettingSection>

      {/* App footer */}
      <div className="text-center pb-6">
        <p className="text-[11px]" style={{ color: 'rgb(var(--ds-ink-3))' }}>
          BharatSeva AI v1.0.0
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: 'rgb(var(--ds-ink-3))' }}>
          Powered by IBM watsonx.ai · Granite
        </p>
      </div>
    </div>
  )
}
