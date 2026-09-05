import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/store/uiStore'
import { Globe } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'mr', label: 'मराठी' },
  { code: 'gu', label: 'ગુજરાતી' },
]

export function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation()
  const { setLanguage } = useUIStore()

  const handleChange = (e) => {
    const code = e.target.value
    i18n.changeLanguage(code)
    setLanguage(code)
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="w-4 h-4" style={{ color: 'rgb(var(--ds-ink-s))' }} aria-hidden="true" />
      <select
        value={i18n.language || 'en'}
        onChange={handleChange}
        className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
        style={{ color: 'rgb(var(--ds-ink-m))' }}
        aria-label="Language selector"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  )
}
