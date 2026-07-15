import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap, ArrowRight, Shield, Brain, Globe, Users, CheckCircle,
  Wheat, GraduationCap, Heart, Cpu, Star, ChevronRight,
} from 'lucide-react'

const FEATURES = [
  { icon: Brain, title: 'AI-Powered Copilot', desc: 'Tell us your goal. Get a complete government journey — schemes, documents, timeline, deadlines.' },
  { icon: Shield, title: 'Eligibility Engine', desc: 'IBM Granite AI checks your eligibility against 100+ schemes instantly with confidence scores.' },
  { icon: Globe, title: 'Multi-language', desc: 'Full support for English and Hindi. Architecture ready for all 22 Indian scheduled languages.' },
  { icon: Users, title: '7 Citizen Personas', desc: 'Designed for farmers, students, women entrepreneurs, senior citizens, and startup founders.' },
]

const CATEGORIES = [
  { icon: Wheat, label: 'Farmers', color: 'bg-green-100 text-green-700', to: '/schemes?category=farmer' },
  { icon: GraduationCap, label: 'Scholarships', color: 'bg-blue-100 text-blue-700', to: '/schemes?category=scholarship' },
  { icon: Heart, label: 'Women', color: 'bg-pink-100 text-pink-700', to: '/schemes?category=women' },
  { icon: Users, label: 'Senior Citizens', color: 'bg-purple-100 text-purple-700', to: '/schemes?category=senior_citizen' },
  { icon: Cpu, label: 'Startups', color: 'bg-indigo-100 text-indigo-700', to: '/schemes?category=startup' },
  { icon: Zap, label: 'MSME', color: 'bg-cyan-100 text-cyan-700', to: '/schemes?category=msme' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center" aria-hidden="true">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">BharatSeva AI</p>
              <p className="text-xs text-gray-500 leading-none">Citizen Copilot</p>
            </div>
          </div>
          <nav className="flex items-center gap-3" aria-label="Primary">
            <Link to="/login" className="btn-ghost text-sm">Log in</Link>
            <Link to="/signup" className="btn-primary text-sm">Get started free</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center" aria-labelledby="hero-heading">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 mb-6">
            <Zap className="w-3.5 h-3.5" aria-hidden="true" />
            Powered by IBM watsonx.ai Granite
          </div>
          <h1
            id="hero-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight text-balance mb-6"
          >
            India's AI Citizen<br />
            <span className="text-blue-600">Intelligence Platform</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 text-balance">
            Discover government schemes, check eligibility, upload documents, and get a complete action plan —
            powered by AI. For every Indian citizen.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/signup" className="btn-primary text-base px-6 py-3">
              Start your journey
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-6 py-3">
              Sign in
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4"
          aria-label="Key statistics"
        >
          {[
            { value: '100+', label: 'Government Schemes' },
            { value: 'IBM AI', label: 'Granite-Powered' },
            { value: '7', label: 'Citizen Personas' },
            { value: '2', label: 'Languages' },
          ].map(({ value, label }) => (
            <div key={label} className="card py-4 px-3">
              <p className="text-2xl font-bold text-blue-600">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* AI Copilot Demo */}
      <section className="bg-gray-900 py-16" aria-labelledby="copilot-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 id="copilot-heading" className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Meet your AI Citizen Copilot
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Just tell us what you want. The Copilot creates a complete government scheme roadmap for you.
            </p>
          </div>

          {/* Chat preview */}
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  R
                </div>
                <div className="bg-blue-600 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-xs">
                  मैं डेयरी फार्म शुरू करना चाहता हूँ
                </div>
              </div>
              <div className="flex items-start gap-3 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white text-gray-800 text-sm px-4 py-3 rounded-2xl rounded-tr-sm max-w-sm shadow-sm">
                  <p className="font-semibold mb-2">I found 4 relevant schemes for you:</p>
                  <ul className="space-y-1.5 text-xs">
                    {['PM-KISAN (95% eligible)', 'NABARD Dairy Scheme (82% eligible)', 'Animal Husbandry Infrastructure (78%)', 'Kisan Credit Card (90%)'].map((s) => (
                      <li key={s} className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" aria-hidden="true" />
                        {s}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center gap-2">
                    <span className="badge bg-emerald-100 text-emerald-700 text-xs">94% confidence</span>
                    <span className="text-xs text-gray-400">IBM Granite AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="text-2xl font-bold text-gray-900 text-center mb-8">
          Find schemes for your situation
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map(({ icon: Icon, label, color, to }) => (
            <Link
              key={label}
              to={to}
              className="card-hover flex flex-col items-center py-5 px-3 gap-2 text-center"
              aria-label={`Browse ${label} schemes`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`} aria-hidden="true">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16" aria-labelledby="features-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 id="features-heading" className="text-2xl font-bold text-gray-900 text-center mb-10">
            Built for every Indian citizen
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3" aria-hidden="true">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="card p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to find your benefits?</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">Join thousands of citizens discovering government schemes they qualify for.</p>
          <Link to="/signup" className="btn-primary text-base px-6 py-3">
            Get started free
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        <p>BharatSeva AI · Built with IBM watsonx.ai · For Every Indian Citizen</p>
        <p className="text-xs mt-1 text-gray-400">An IBM Innovation Showcase Project</p>
      </footer>
    </div>
  )
}
