import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu, Send, CheckCircle, Clock, FileText, ExternalLink,
  ChevronDown, ChevronUp, Bookmark, Play, Sparkles,
  AlertCircle, Brain, MapPin, Phone, ArrowRight, Loader2,
} from 'lucide-react'
import { goalService } from '@/services/goalService'
import { useProfile } from '@/hooks/useProfile'
import { ConfidenceBadge, ConfidenceBar } from '@/components/ConfidenceBadge'
import { DegradedModeBanner } from '@/components/DegradedModeBanner'
import { ExplainabilityDrawer } from '@/components/ExplainabilityDrawer'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

const GOAL_SUGGESTIONS = [
  { emoji: '🌾', text: 'I want to start a dairy farm', persona: 'Farmer' },
  { emoji: '📚', text: 'I want to apply for a scholarship for engineering', persona: 'Student' },
  { emoji: '🏭', text: 'I want to start a food processing business', persona: 'Women MSME' },
  { emoji: '💡', text: 'I want to register my startup and get funding', persona: 'Startup Founder' },
  { emoji: '🌾', text: 'I want crop insurance for my wheat farm', persona: 'Farmer' },
  { emoji: '🏠', text: 'I want to apply for a disability pension', persona: 'Disability' },
]

function EligibilityVerdictBadge({ verdict }) {
  const map = {
    ELIGIBLE: { color: 'bg-emerald-100 text-emerald-800', label: 'Eligible' },
    PARTIAL: { color: 'bg-yellow-100 text-yellow-800', label: 'Partial' },
    INELIGIBLE: { color: 'bg-red-100 text-red-700', label: 'Not Eligible' },
    PARTIALLY_ELIGIBLE: { color: 'bg-yellow-100 text-yellow-800', label: 'Partially Eligible' },
  }
  const style = map[verdict] || map.PARTIAL
  return <span className={clsx('badge text-xs', style.color)}>{style.label}</span>
}

function SchemeItem({ scheme, rank }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={expanded}
      >
        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-semibold text-gray-900 text-sm">{scheme.scheme_name}</span>
            <EligibilityVerdictBadge verdict={scheme.eligibility_verdict} />
          </div>
          <ConfidenceBar score={scheme.confidence} className="max-w-24" />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {scheme.confidence != null && (
            <ConfidenceBadge score={scheme.confidence} showPercent />
          )}
          {expanded
            ? <ChevronUp className="w-4 h-4 text-gray-400" aria-hidden="true" />
            : <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
          }
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3 bg-gray-50">
              {scheme.office_address && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{scheme.office_address}</span>
                </div>
              )}
              {scheme.office_contact && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{scheme.office_contact}</span>
                </div>
              )}
              {scheme.application_url && (
                <a
                  href={scheme.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  Apply online
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function RoadmapStep({ step, index, total }) {
  const [expanded, setExpanded] = useState(false)
  const isLast = index === total - 1

  return (
    <div className="flex gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
          {step.step || index + 1}
        </div>
        {!isLast && <div className="w-px flex-1 bg-blue-200 my-1 min-h-6" aria-hidden="true" />}
      </div>
      {/* Content */}
      <div className="flex-1 pb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left"
          aria-expanded={expanded}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-gray-900 text-sm">{step.action}</p>
            <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
              {step.estimated_days && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  ~{step.estimated_days}d
                </span>
              )}
              {expanded
                ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              }
            </div>
          </div>
        </button>
        <AnimatePresence>
          {expanded && step.responsible_office && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="text-xs text-gray-500 mt-1 overflow-hidden"
            >
              Office: {step.responsible_office}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function CopilotPage() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const [goalText, setGoalText] = useState('')
  const [plan, setPlan] = useState(null)
  const [goalId, setGoalId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activating, setActivating] = useState(false)
  const [activated, setActivated] = useState(false)
  const [error, setError] = useState(null)
  const [degraded, setDegraded] = useState(false)
  const [explainData, setExplainData] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const resultRef = useRef(null)
  const textareaRef = useRef(null)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!goalText.trim()) return
    setLoading(true)
    setError(null)
    setPlan(null)
    setActivated(false)
    try {
      const res = await goalService.createGoal(goalText.trim())
      const data = res.data
      setGoalId(data.goal_id)
      setPlan(data)                              // store the whole data object
      setDegraded(data.degraded || data.fallback_used || false)
      // Scroll to results
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to generate plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleActivate = async () => {
    if (!goalId) return
    setActivating(true)
    try {
      await goalService.activateGoal(goalId)
      setActivated(true)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to activate plan.')
    } finally {
      setActivating(false)
    }
  }

  const handleSuggestion = (text) => {
    setGoalText(text)
    textareaRef.current?.focus()
  }

  const parsedPlan = plan?.plan || {}
  const schemes = parsedPlan.relevant_schemes || []
  const docChecklist = parsedPlan.aggregated_document_checklist || []
  const roadmap = parsedPlan.step_by_step_roadmap || []
  const nextActions = parsedPlan.next_actions || []
  const confidence = plan?.confidence ?? null
  const sources = plan?.sources || []
  const reasoning = plan?.reasoning || ''

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Cpu className="w-5 h-5 text-blue-600" aria-hidden="true" />
          <h1 className="page-title">AI Citizen Copilot</h1>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-700 text-white leading-none ml-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Powered by IBM Granite
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Tell me your goal. I'll find the right government schemes, check your eligibility,
          and build a complete action plan.
        </p>
      </div>

      {/* Input section */}
      <div className="card p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="goal-input" className="label">
              What's your goal?
            </label>
            <textarea
              id="goal-input"
              ref={textareaRef}
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="e.g., I want to start a dairy farm / मैं डेयरी फार्म शुरू करना चाहता हूँ"
              rows={3}
              className="input-field resize-none text-base"
              aria-describedby="goal-hint"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleSubmit()
                }
              }}
            />
            <p id="goal-hint" className="text-xs text-gray-400 mt-1">
              You can write in English or Hindi. Press Ctrl+Enter to submit.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !goalText.trim()}
            className="btn-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Generating your plan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Generate My Plan
              </>
            )}
          </button>
        </form>

        {/* Suggestions */}
        {!plan && !loading && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {GOAL_SUGGESTIONS.map(({ emoji, text, persona }) => (
                <button
                  key={text}
                  onClick={() => handleSuggestion(text)}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-full transition-colors"
                  aria-label={`Use suggestion: ${text} (${persona})`}
                >
                  {emoji} {text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="card p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Brain className="w-8 h-8 text-blue-600 animate-pulse" aria-hidden="true" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900">Analyzing your goal...</p>
              <p className="text-sm text-gray-500 mt-1">IBM Granite AI is processing your request</p>
            </div>
            <div className="flex gap-2 text-xs text-gray-400">
              {['Finding schemes', 'Checking eligibility', 'Building roadmap'].map((step, i) => (
                <span key={step} className="flex items-center gap-1">
                  {i > 0 && <span>·</span>}
                  {step}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {plan && !loading && (
        <motion.div
          ref={resultRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-5"
        >
          {/* Degraded banner */}
          {degraded && <DegradedModeBanner />}

          {/* Plan header */}
          <div className="card p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Sparkles className="w-4 h-4 text-blue-600" aria-hidden="true" />
                  <h2 className="font-bold text-gray-900">Your Personalised Plan</h2>
                  {confidence != null && <ConfidenceBadge score={confidence} showPercent />}
                </div>
                <p className="text-sm text-gray-700">
                  {parsedPlan.goal_summary || `Plan generated for: "${goalText}"`}
                </p>
                {parsedPlan.estimated_total_timeline_days && (
                  <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    Estimated timeline: <strong className="text-gray-700">{parsedPlan.estimated_total_timeline_days} days</strong>
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {(sources.length > 0 || confidence != null) && (
                  <button
                    onClick={() => {
                      setExplainData({ confidence, sources, reasoning, agent_name: 'goal_planning', fallback_used: plan?.fallback_used })
                      setDrawerOpen(true)
                    }}
                    className="btn-ghost text-sm"
                    aria-label="View AI reasoning and sources"
                  >
                    <Brain className="w-4 h-4" aria-hidden="true" />
                    Explain
                  </button>
                )}
                {!activated ? (
                  <button
                    onClick={handleActivate}
                    disabled={activating}
                    className="btn-primary"
                    aria-label="Activate this plan — creates tracker entries and calendar events"
                  >
                    {activating
                      ? <LoadingSpinner size="sm" className="text-white" />
                      : <Play className="w-4 h-4" aria-hidden="true" />
                    }
                    Activate Plan
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                    Plan Activated!
                  </div>
                )}
              </div>
            </div>

            {activated && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200"
              >
                <p className="text-sm text-emerald-800">
                  <strong>Plan activated.</strong> Application tracker rows and deadline calendar entries have been created.{' '}
                  <button onClick={() => navigate('/tracker')} className="text-emerald-700 underline">
                    View tracker
                  </button>
                </p>
              </motion.div>
            )}
          </div>

          {/* Relevant schemes */}
          {schemes.length > 0 && (
            <div className="card p-5">
              <h3 className="section-title mb-4">Relevant Government Schemes ({schemes.length})</h3>
              <div className="space-y-3">
                {schemes.map((scheme, i) => (
                  <SchemeItem key={scheme.scheme_id || i} scheme={scheme} rank={i + 1} />
                ))}
              </div>
            </div>
          )}

          {/* Document checklist */}
          {docChecklist.length > 0 && (
            <div className="card p-5">
              <h3 className="section-title mb-3">
                <FileText className="w-4 h-4 inline text-blue-600 mr-1.5" aria-hidden="true" />
                Documents You'll Need ({docChecklist.length})
              </h3>
              <ul className="space-y-2" role="list">
                {docChecklist.map((doc, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" aria-hidden="true" />
                    {doc}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/documents')}
                className="btn-secondary mt-4 text-sm"
              >
                <FileText className="w-4 h-4" aria-hidden="true" />
                Open Document Vault
              </button>
            </div>
          )}

          {/* Roadmap */}
          {roadmap.length > 0 && (
            <div className="card p-5">
              <h3 className="section-title mb-4">Step-by-Step Roadmap ({roadmap.length} steps)</h3>
              <div>
                {roadmap.map((step, i) => (
                  <RoadmapStep key={i} step={step} index={i} total={roadmap.length} />
                ))}
              </div>
            </div>
          )}

          {/* Next actions */}
          {nextActions.length > 0 && (
            <div className="card p-5">
              <h3 className="section-title mb-3">Next Actions</h3>
              <ul className="space-y-2" role="list">
                {nextActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <ArrowRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* Explainability Drawer */}
      <ExplainabilityDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        data={explainData}
      />
    </div>
  )
}
