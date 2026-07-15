import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/store/uiStore'
import { Globe } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
]

export function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation()
  const { setLanguage } = useUIStore()

  const handleChange = (code) => {
    i18n.changeLanguage(code)
    setLanguage(code)
  }

  return (
    <div className={`flex items-center gap-1 ${className}`} role="group" aria-label="Language selector">
      <Globe className="w-4 h-4 text-gray-400" aria-hidden="true" />
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleChange(lang.code)}
          className={`px-2 py-1 text-xs rounded-md transition-colors ${
            i18n.language === lang.code
              ? 'bg-blue-100 text-blue-700 font-semibold'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
          aria-pressed={i18n.language === lang.code}
          aria-label={`Switch to ${lang.label}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
