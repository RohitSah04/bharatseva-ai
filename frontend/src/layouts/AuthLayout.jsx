import { Outlet, Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2" aria-label="BharatSeva AI home">
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center" aria-hidden="true">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">BharatSeva AI</p>
            <p className="text-xs text-gray-500 leading-none mt-0.5">Citizen Copilot</p>
          </div>
        </Link>
        <LanguageSwitcher />
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400">
        Powered by IBM watsonx.ai Granite · Government of India
      </footer>
    </div>
  )
}
