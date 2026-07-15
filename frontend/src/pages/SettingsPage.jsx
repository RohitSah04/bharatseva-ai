import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Type, Contrast, Globe, LogOut, ChevronRight, Moon, Sun } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import clsx from 'clsx'

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative w-11 h-6 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-blue-500',
        checked ? 'bg-blue-600' : 'bg-gray-300',
      )}
    >
      <span
        className={clsx(
          'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
          checked ? 'left-5' : 'left-0.5',
        )}
        aria-hidden="true"
      />
    </button>
  )
}

export default function SettingsPage() {
  const { highContrast, largeText, toggleHighContrast, toggleLargeText } = useUIStore()
  const { logoutUser } = useAuth()
  const [confirmLogout, setConfirmLogout] = useState(false)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and accessibility preferences.</p>
      </div>

      {/* Accessibility */}
      <div className="card p-5">
        <h2 className="section-title mb-1">Accessibility</h2>
        <p className="text-xs text-gray-500 mb-4">Customize display for better readability</p>

        <SettingRow
          label="Large Text"
          description="Increase font size for better readability (Kamla Devi mode)"
        >
          <Toggle
            checked={largeText}
            onChange={toggleLargeText}
            label="Toggle large text mode"
          />
        </SettingRow>

        <SettingRow
          label="High Contrast"
          description="Increase colour contrast for better visibility"
        >
          <Toggle
            checked={highContrast}
            onChange={toggleHighContrast}
            label="Toggle high contrast mode"
          />
        </SettingRow>
      </div>

      {/* Language */}
      <div className="card p-5">
        <h2 className="section-title mb-1">Language</h2>
        <p className="text-xs text-gray-500 mb-4">Interface language setting</p>
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-gray-400" aria-hidden="true" />
          <LanguageSwitcher />
        </div>
      </div>

      {/* Account */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Account</h2>

        {!confirmLogout ? (
          <button
            onClick={() => setConfirmLogout(true)}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sign out of BharatSeva AI
          </button>
        ) : (
          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-sm font-medium text-gray-900 mb-3">Are you sure you want to sign out?</p>
            <div className="flex gap-2">
              <button onClick={logoutUser} className="btn-danger text-sm">Sign out</button>
              <button onClick={() => setConfirmLogout(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* App info */}
      <div className="text-center text-xs text-gray-400 pb-6">
        <p>BharatSeva AI v1.0.0</p>
        <p className="mt-0.5">Powered by IBM watsonx.ai Granite</p>
      </div>
    </div>
  )
}
