import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Cpu, Send, CheckCircle, Clock, FileText, ExternalLink,
  ChevronDown, ChevronUp, Bookmark, Play, Sparkles,
  AlertCircle, Brain, MapPin, Phone, ArrowRight, Loader2,
  Zap, Target, Star, Trophy,
} from 'lucide-react'
import { goalService } from '@/services/goalService'
import { useProfile } from '@/hooks/useProfile'
import { ConfidenceBadge, ConfidenceBar } from '@/components/ConfidenceBadge'
import { DegradedModeBanner } from '@/components/DegradedModeBanner'
import { ExplainabilityDrawer } from '@/components/ExplainabilityDrawer'
import { toast } from '@/components/Toast'
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

const LOADING_STEPS = [
  { label: 'Analysing your goal with IBM Granite AI', icon: Brain },
  { label: 'Searching 100+ government schemes', icon: Target },
  { label: 'Checking your eligibility', icon: CheckCircle },
  { label: 'Building your personalised roadmap', icon: Sparkles },
]

/* ── EligibilityVerdictBadge ─────────────────────────────────────────────── */
function EligibilityVerdictBadge({ verdict }) {
  const map = {
    ELIGIBLE:           { cls: 'badge-emerald', label: 'Eligible' },
    PARTIAL:            { cls: 'badge-amber',   label: 'Partial' },
    INELIGIBLE:         { cls: 'badge-red',     label: 'Not Eligible' },
    PARTIALLY_ELIGIBLE: { cls: 'badge-amber',   label: 'Partially Eligible' },
  }
  const s = map[verdict] || map.PARTIAL
  return <span className={clsx('badge text-[11px]', s.cls)}>{s.label}</span>
}

/* ── SchemeItem ──────────────────────────────────────────────────────────── */
function SchemeItem({ scheme, rank, delay = 0 }) {
  const [expanded, setExpanded] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -10 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        border: '1px solid rgb(var(--ds-hl))',
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'border-color 150ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--ds-hl-s))' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--ds-hl))' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left transition-colors"
        style={{ background: 'rgb(var(--ds-s1))' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgb(var(--ds-s2))' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgb(var(--ds-s1))' }}
        aria-expanded={expanded}
      >
        {/* Rank badge */}
        <div
          className="w-7 h-7 rounded-lg text-[11px] font-bold flex items-center justify-center flex-shrink-0 text-white"
          style={{ background: 'rgb(var(--ds-accent))' }}
          aria-hidden="true"
        >
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="font-semibold text-[13px] leading-tight" style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.014em' }}>
              {scheme.scheme_name}
            </span>
            <EligibilityVerdictBadge verdict={scheme.eligibility_verdict} />
          </div>
          <ConfidenceBar score={scheme.confidence} className="max-w-28" />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {scheme.confidence != null && <ConfidenceBadge score={scheme.confidence} showPercent />}
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4" style={{ color: 'rgb(var(--ds-ink-s))' }} aria-hidden="true" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 pt-3 space-y-2.5"
              style={{ borderTop: '1px solid rgb(var(--ds-hl))', background: 'rgb(var(--ds-s2))' }}
            >
              {scheme.office_address && (
                <div className="flex items-start gap-2 text-[12px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(var(--ds-ink-s))' }} aria-hidden="true" />
                  <span>{scheme.office_address}</span>
                </div>
              )}
              {scheme.office_contact && (
                <div className="flex items-start gap-2 text-[12px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>
                  <Phone className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(var(--ds-ink-s))' }} aria-hidden="true" />
                  <span>{scheme.office_contact}</span>
                </div>
              )}
              {scheme.application_url && (
                <a
                  href={scheme.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium hover:underline"
                  style={{ color: 'rgb(var(--ds-accent))' }}
                >
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  Apply online
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── RoadmapStep ─────────────────────────────────────────────────────────── */
function RoadmapStep({ step, index, total, delay = 0 }) {
  const [expanded, setExpanded] = useState(false)
  const isLast = index === total - 1
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-4"
    >
      {/* Timeline */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-8 h-8 rounded-lg text-white text-[11px] font-bold flex items-center justify-center"
          style={{ background: 'rgb(var(--ds-accent))' }}
        >
          {step.step || index + 1}
        </div>
        {!isLast && (
          <div
            className="w-px flex-1 my-2 min-h-6"
            style={{ background: 'linear-gradient(to bottom, rgb(var(--ds-accent)), transparent)' }}
            aria-hidden="true"
          />
        )}
      </div>
      {/* Content */}
      <div className="flex-1 pb-5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left"
          aria-expanded={expanded}
        >
          <div className="flex items-start justify-between gap-2">
            <p
              className="text-[13px] font-semibold leading-tight transition-colors"
              style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.014em' }}
            >
              {step.action}
            </p>
            <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
              {step.estimated_days && (
                <span className="badge badge-indigo flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                  ~{step.estimated_days}d
                </span>
              )}
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-3.5 h-3.5" style={{ color: 'rgb(var(--ds-ink-s))' }} />
              </motion.div>
            </div>
          </div>
        </button>
        <AnimatePresence>
          {expanded && step.responsible_office && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="text-[12px] mt-1.5 overflow-hidden"
              style={{ color: 'rgb(var(--ds-ink-s))' }}
            >
              Office: {step.responsible_office}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ── LoadingPlan — terminal-style step animation ────────────────────────── */
function LoadingPlan() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev))
    }, 900)
    return () => clearInterval(interval)
  }, [])

  const progress = ((activeStep + 1) / LOADING_STEPS.length) * 100

  return (
    <div
      style={{
        background: 'rgb(var(--ds-s1))',
        border: '1px solid rgb(var(--ds-hl))',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {/* Terminal header */}
      <div
        className="flex items-center gap-2 px-4"
        style={{ height: 40, background: 'rgb(var(--ds-s2))', borderBottom: '1px solid rgb(var(--ds-hl))' }}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} aria-hidden="true" />
        <div className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} aria-hidden="true" />
        <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} aria-hidden="true" />
        <span className="ml-2 text-[11px] font-mono" style={{ color: 'rgb(var(--ds-ink-s))' }}>IBM Granite AI · Processing</span>
        <div className="ml-auto">
          <span className="live-dot" aria-hidden="true" />
        </div>
      </div>

      {/* Steps */}
      <div className="p-5 space-y-2" role="status" aria-label="Generation progress" aria-live="polite">
        {LOADING_STEPS.map((step, i) => {
          const Icon = step.icon
          const done   = i < activeStep
          const active = i === activeStep
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3"
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                background: active ? 'rgba(94,106,210,0.08)' : 'transparent',
                border: active ? '1px solid rgba(94,106,210,0.15)' : '1px solid transparent',
                transition: 'all 300ms ease',
              }}
            >
              {/* Status icon */}
              <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                {done ? (
                  <CheckCircle className="w-4 h-4" style={{ color: '#27a644' }} aria-hidden="true" />
                ) : active ? (
                  <motion.div
                    className="w-3 h-3 rounded-full border-2"
                    style={{ borderColor: 'rgb(var(--ds-accent))', borderTopColor: 'transparent' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                    aria-hidden="true"
                  />
                ) : (
                  <div
                    className="w-3 h-3 rounded-full border"
                    style={{ borderColor: 'rgb(var(--ds-hl-s))' }}
                    aria-hidden="true"
                  />
                )}
              </div>
              {/* Label */}
              <span
                className="text-[13px] font-medium"
                style={{
                  color: done   ? '#27a644'
                       : active ? 'rgb(var(--ds-ink))'
                                : 'rgb(var(--ds-ink-s))',
                }}
              >
                {done ? '✓ ' : ''}{step.label}
              </span>
            </motion.div>
          )
        })}

        {/* Progress bar */}
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgb(var(--ds-hl))' }}>
          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              className="progress-fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <p className="text-[11px] mt-2 text-right" style={{ color: 'rgb(var(--ds-ink-s))' }}>
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────────────────────── */
export default function CopilotPage() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const [goalText, setGoalText] = useState('')
  const [plan, setPlan] = useState(null)
  const [goalId, setGoalId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activating, setActivating] = useState(false)
  const [activated, setActivated] = useState(false)
  const [activationResult, setActivationResult] = useState(null)
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
      setPlan(data)
      setDegraded(data.degraded || data.fallback_used || false)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to generate plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleActivate = async () => {
    if (!goalId || activated) return
    setActivating(true)
    setError(null)
    try {
      const res = await goalService.activateGoal(goalId)
      const result = res.data
      setActivationResult(result)
      setActivated(true)
      const appsCreated = result?.applications_created ?? result?.tracker_ids?.length ?? 0
      const calCreated  = result?.calendar_entries_created ?? 0
      toast.success(
        `Plan activated! ${appsCreated} tracker entr${appsCreated === 1 ? 'y' : 'ies'} and ${calCreated} deadline reminder${calCreated === 1 ? '' : 's'} created.`
      )
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to activate plan.'
      setError(msg)
      toast.error(msg)
    } finally {
      setActivating(false)
    }
  }

  const handleSuggestion = (text) => {
    setGoalText(text)
    textareaRef.current?.focus()
  }

  const parsedPlan    = plan?.plan || {}
  const schemes       = parsedPlan.relevant_schemes || []
  const docChecklist  = parsedPlan.aggregated_document_checklist || []
  const roadmap       = parsedPlan.step_by_step_roadmap || []
  const nextActions   = parsedPlan.next_actions || []
  const confidence    = plan?.confidence ?? null
  const sources       = plan?.sources || []
  const reasoning     = plan?.reasoning || ''

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-600 flex items-center justify-center shadow-glow-sm" aria-hidden="true">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="page-title">AI Citizen Copilot</h1>
              <span className="badge-ibm inline-flex">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                IBM Granite
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Tell me your goal. I'll find the right schemes, check eligibility, and build your roadmap.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Input section ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="card p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="goal-input" className="label text-base font-semibold">
              What's your goal?
            </label>
            <textarea
              id="goal-input"
              ref={textareaRef}
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="e.g., I want to start a dairy farm / मैं डेयरी फार्म शुरू करना चाहता हूँ"
              rows={3}
              className="input-field resize-none text-base mt-1"
              aria-describedby="goal-hint"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
              }}
            />
            <p id="goal-hint" className="text-xs text-slate-400 mt-1.5">
              Write in English or Hindi · Press Ctrl+Enter to submit
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !goalText.trim()}
            className="btn-primary shadow-glow-sm hover:shadow-glow px-6 py-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Generate My Plan
              </>
            )}
          </button>
        </form>

        {/* Suggestion chips */}
        <AnimatePresence>
          {!plan && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700"
            >
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Try these examples</p>
              <div className="flex flex-wrap gap-2">
                {GOAL_SUGGESTIONS.map(({ emoji, text, persona }) => (
                  <button
                    key={text}
                    onClick={() => handleSuggestion(text)}
                    className="text-xs px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 rounded-xl transition-all duration-150 font-medium border border-transparent hover:border-indigo-200 dark:hover:border-indigo-700"
                    aria-label={`Use suggestion: ${text} (${persona})`}
                  >
                    {emoji} {text}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Error ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <LoadingPlan />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {plan && !loading && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            {degraded && <DegradedModeBanner />}

            {/* Plan header card */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-600 flex items-center justify-center" aria-hidden="true">
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                    <h2 className="font-bold text-slate-900 dark:text-white text-lg">Your Personalised Plan</h2>
                    {confidence != null && <ConfidenceBadge score={confidence} showPercent />}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {parsedPlan.goal_summary || `Plan generated for: "${goalText}"`}
                  </p>
                  {parsedPlan.estimated_total_timeline_days && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <span className="badge badge-indigo flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        ~{parsedPlan.estimated_total_timeline_days} days timeline
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap flex-shrink-0">
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
                      Explain AI
                    </button>
                  )}
                  <button
                    onClick={handleActivate}
                    disabled={activating || activated}
                    className={activated ? 'btn-secondary opacity-70 cursor-default' : 'btn-primary shadow-glow-sm'}
                    aria-label={activated ? 'Plan already activated' : 'Activate this plan — creates tracker entries and calendar events'}
                  >
                    {activating ? (
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    ) : activated ? (
                      <CheckCircle className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Play className="w-4 h-4" aria-hidden="true" />
                    )}
                    {activated ? 'Plan Activated' : 'Activate Plan'}
                  </button>
                </div>
              </div>

              {/* Activated success state */}
              <AnimatePresence>
                {activated && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800"
                  >
                    <div className="flex items-start gap-3">
                      <Trophy className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-1">Plan activated successfully!</p>
                        <div className="flex flex-wrap gap-3 text-xs text-emerald-700 dark:text-emerald-400">
                          {activationResult?.applications_created != null && (
                            <span>✓ {activationResult.applications_created} tracker {activationResult.applications_created === 1 ? 'entry' : 'entries'} created</span>
                          )}
                          {activationResult?.applications_already_existed > 0 && (
                            <span>· {activationResult.applications_already_existed} already tracked</span>
                          )}
                          {activationResult?.calendar_entries_created != null && (
                            <span>✓ {activationResult.calendar_entries_created} deadline reminder{activationResult.calendar_entries_created === 1 ? '' : 's'} added</span>
                          )}
                          {activationResult?.schemes_not_found > 0 && (
                            <span className="text-amber-600 dark:text-amber-400">· {activationResult.schemes_not_found} scheme{activationResult.schemes_not_found === 1 ? '' : 's'} not matched</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-3 ml-8">
                      <button
                        onClick={() => navigate('/tracker')}
                        className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        View Tracker →
                      </button>
                      <button
                        onClick={() => navigate('/deadlines')}
                        className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        View Calendar →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Schemes */}
            {schemes.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-indigo-500" aria-hidden="true" />
                  <h3 className="section-title">Relevant Government Schemes</h3>
                  <span className="badge badge-indigo ml-auto">{schemes.length} found</span>
                </div>
                <div className="space-y-3">
                  {schemes.map((scheme, i) => (
                    <SchemeItem key={scheme.scheme_id || i} scheme={scheme} rank={i + 1} delay={i * 0.06} />
                  ))}
                </div>
              </div>
            )}

            {/* Document checklist */}
            {docChecklist.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 text-teal-500" aria-hidden="true" />
                  <h3 className="section-title">Documents You'll Need</h3>
                  <span className="badge badge-teal ml-auto">{docChecklist.length} items</span>
                </div>
                <ul className="space-y-2.5" role="list">
                  {docChecklist.map((doc, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" aria-hidden="true" />
                      {doc}
                    </motion.li>
                  ))}
                </ul>
                <button onClick={() => navigate('/documents')} className="btn-secondary mt-5 text-sm">
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  Open Document Vault
                </button>
              </div>
            )}

            {/* Roadmap */}
            {roadmap.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Target className="w-4 h-4 text-indigo-500" aria-hidden="true" />
                  <h3 className="section-title">Step-by-Step Roadmap</h3>
                  <span className="badge badge-indigo ml-auto">{roadmap.length} steps</span>
                </div>
                <div>
                  {roadmap.map((step, i) => (
                    <RoadmapStep key={i} step={step} index={i} total={roadmap.length} delay={i * 0.07} />
                  ))}
                </div>
              </div>
            )}

            {/* Next actions */}
            {nextActions.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ArrowRight className="w-4 h-4 text-teal-500" aria-hidden="true" />
                  <h3 className="section-title">Next Actions</h3>
                </div>
                <ul className="space-y-3" role="list">
                  {nextActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <div className="w-5 h-5 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ArrowRight className="w-3 h-3 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                      </div>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explainability Drawer */}
      <ExplainabilityDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        data={explainData}
      />
    </div>
  )
}
