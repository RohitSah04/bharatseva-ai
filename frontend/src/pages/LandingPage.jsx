import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Shield, Brain, Globe, Users, CheckCircle,
  Wheat, GraduationCap, Heart, Cpu, ChevronDown,
  FileText, Clock, TrendingUp, Sparkles, Building, Award, Star, MapPin,
} from 'lucide-react'

/* ─── Data ───────────────────────────────────────────────────────────────────── */

const STATS = [
  { value: '96',  label: 'Govt. Schemes', suffix: '+' },
  { value: '94',  label: 'AI Confidence', suffix: '%' },
  { value: '7',   label: 'Citizen Personas' },
  { value: '6',   label: 'Languages' },
]

const TRUST_BADGES = [
  'IBM Granite AI',
  'watsonx.ai',
  'RAG Powered',
  'Agentic AI',
  'DPDP Compliant',
  '96+ Schemes',
]

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Citizen Copilot',
    desc: 'Tell us your goal in plain language. Get a complete government scheme roadmap — eligibility, documents, timeline.',
    badge: 'Flagship',
  },
  {
    icon: Shield,
    title: 'Eligibility Engine',
    desc: 'IBM Granite AI checks eligibility against 96+ schemes with confidence scores and full reasoning.',
    badge: 'AI-Powered',
  },
  {
    icon: Globe,
    title: 'Multi-language',
    desc: 'Full support for 6 Indian languages. Architecture ready for all 22 scheduled languages.',
    badge: 'Inclusive',
  },
  {
    icon: FileText,
    title: 'Document Vault',
    desc: 'Securely store and verify documents. AI cross-checks against scheme requirements automatically.',
    badge: 'Secure',
  },
]

const CATEGORIES = [
  { icon: Wheat,           label: 'Farmers',        to: '/schemes?category=farmer',         count: '32 schemes' },
  { icon: GraduationCap,  label: 'Education',       to: '/schemes?category=scholarship',    count: '18 schemes' },
  { icon: Heart,           label: 'Women',           to: '/schemes?category=women',          count: '14 schemes' },
  { icon: Users,           label: 'Senior Citizens', to: '/schemes?category=senior_citizen', count: '11 schemes' },
  { icon: Cpu,             label: 'Startups',        to: '/schemes?category=startup',        count: '9 schemes'  },
  { icon: Building,        label: 'MSME',            to: '/schemes?category=msme',           count: '16 schemes' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Tell us your goal', desc: 'Describe what you want in English or Hindi — no bureaucratic jargon needed.', icon: Brain },
  { step: '02', title: 'AI maps your journey', desc: 'IBM Granite finds relevant schemes, checks eligibility, and builds a step-by-step roadmap.', icon: Sparkles },
  { step: '03', title: 'Track & accomplish', desc: 'Follow your action plan, track applications, get deadline reminders, and celebrate approvals.', icon: Award },
]

const TESTIMONIALS = [
  { name: 'Ramesh Kumar', role: 'Dairy Farmer, Bihar', text: 'Found 4 eligible dairy schemes I never knew existed. PM-KISAN loan approved in 3 weeks!', initials: 'RK' },
  { name: 'Priya Sharma', role: 'Student, Odisha',     text: 'Got full scholarship for my engineering course. The document checklist saved me 10 trips to the office.', initials: 'PS' },
  { name: 'Meera Patel',  role: 'Entrepreneur, Gujarat', text: 'Mudra loan application tracked from submission to approval. Everything in one place.', initials: 'MP' },
]

const FAQS = [
  { q: 'Is BharatSeva AI free to use?', a: 'Yes. BharatSeva AI is completely free for all Indian citizens. It is an IBM Innovation Showcase project.' },
  { q: 'What languages are supported?', a: 'English and Hindi are fully supported. Telugu, Tamil, Marathi, and Gujarati are in active development. Architecture supports all 22 scheduled languages.' },
  { q: 'Is my data safe?', a: 'All data is encrypted in transit and at rest. Documents are stored in a private vault. We never share personal data with third parties.' },
  { q: 'How accurate is the eligibility check?', a: 'The IBM Granite AI model achieves 94% average confidence. Every result includes a reasoning explanation and confidence score so you can decide.' },
  { q: 'Do I need to visit any government office?', a: 'BharatSeva AI guides you through the application process, including which offices to visit and what to bring — reducing unnecessary visits.' },
]

/* ─── Animation variants ─────────────────────────────────────────────────────── */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

/* ─── Sub-components ─────────────────────────────────────────────────────────── */

/* Logo mark */
function BSLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#5e6ad2" />
      <path d="M7 7h5a3 3 0 0 1 0 6H7V7zm0 6h5.5a3.5 3.5 0 0 1 0 4H7v-4z" fill="white" opacity="0.9" />
    </svg>
  )
}

/* IBM badge */
function IBMBadge() {
  return (
    <span className="badge-ibm">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
      IBM Granite AI
    </span>
  )
}

/* FAQ accordion */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgb(var(--ds-hl))' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-[15px] font-medium" style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.01em' }}>{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4" style={{ color: 'rgb(var(--ds-ink-s))' }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[14px] leading-relaxed" style={{ color: 'rgb(var(--ds-ink-s))' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'rgb(var(--ds-canvas))' }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: 'rgba(var(--ds-canvas), 0.92)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgb(var(--ds-hl))',
          height: 56,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="section-container w-full flex items-center justify-between">
          {/* Wordmark */}
          <div className="flex items-center gap-2.5">
            <BSLogo size={24} />
            <div>
              <p className="text-[13px] font-semibold leading-none" style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.02em' }}>
                BharatSeva AI
              </p>
              <p className="text-[10px] leading-none mt-0.5" style={{ color: 'rgb(var(--ds-ink-s))' }}>
                Citizen Copilot
              </p>
            </div>
          </div>

          {/* CTA cluster */}
          <nav className="flex items-center gap-2" aria-label="Primary navigation">
            <Link to="/login" className="btn-ghost px-3 py-2 text-[13px]">
              Sign in
            </Link>
            <Link to="/signup" className="btn-primary text-[13px] flex items-center gap-1.5">
              Get started free
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        aria-labelledby="hero-heading"
        style={{ paddingTop: 96, paddingBottom: 96 }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: `
              linear-gradient(rgb(var(--ds-hl)) 1px, transparent 1px),
              linear-gradient(90deg, rgb(var(--ds-hl)) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            opacity: 0.25,
          }}
        />
        {/* Fade mask */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, rgb(var(--ds-canvas)) 100%)',
          }}
        />

        <div className="section-container relative text-center">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <span className="eyebrow-pill">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'rgb(var(--ds-accent))' }} aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Powered by IBM watsonx.ai · Granite AI
            </span>
          </motion.div>

          {/* Headline — staggered words */}
          <motion.h1
            id="hero-heading"
            className="text-balance mx-auto"
            style={{ maxWidth: 720 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <motion.span
              className="block text-display-xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              India's AI-Powered
            </motion.span>
            <motion.span
              className="block text-display-xl"
              style={{ color: 'rgb(var(--ds-accent))', display: 'block' }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              Citizen Intelligence
            </motion.span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            className="mt-6 mx-auto text-balance"
            style={{
              maxWidth: 560,
              fontSize: 18,
              lineHeight: 1.55,
              color: 'rgb(var(--ds-ink-m))',
              letterSpacing: '-0.006em',
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            Discover government schemes you qualify for, check eligibility with AI,
            and get a complete action plan — in minutes.
          </motion.p>

          {/* CTA row */}
          <motion.div
            className="mt-10 flex items-center justify-center gap-3 flex-wrap"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              to="/signup"
              className="btn-primary-glow flex items-center gap-2"
              style={{ fontSize: 14, padding: '10px 20px' }}
            >
              Start your journey — free
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              to="/login"
              className="btn-secondary flex items-center gap-2"
              style={{ fontSize: 14, padding: '10px 20px' }}
            >
              Sign in
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="mt-16 mx-auto"
            style={{
              display: 'inline-grid',
              gridTemplateColumns: 'repeat(4, auto)',
              gap: 0,
              background: 'rgb(var(--ds-s1))',
              border: '1px solid rgb(var(--ds-hl))',
              borderRadius: 12,
              overflow: 'hidden',
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Key statistics"
          >
            {STATS.map(({ value, label, suffix }, i) => (
              <div
                key={label}
                style={{
                  padding: '20px 28px',
                  textAlign: 'center',
                  borderLeft: i > 0 ? '1px solid rgb(var(--ds-hl))' : 'none',
                }}
              >
                <p
                  className="font-semibold leading-none"
                  style={{ fontSize: 24, color: 'rgb(var(--ds-ink))', letterSpacing: '-0.03em' }}
                >
                  {value}{suffix}
                </p>
                <p
                  className="mt-1.5 leading-none"
                  style={{ fontSize: 11, color: 'rgb(var(--ds-ink-s))', letterSpacing: '0.02em' }}
                >
                  {label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Trust badges ─────────────────────────────────────────────────────── */}
      <section
        aria-label="Technology stack"
        style={{ borderTop: '1px solid rgb(var(--ds-hl))', borderBottom: '1px solid rgb(var(--ds-hl))', padding: '16px 0' }}
      >
        <div className="section-container">
          <div
            className="flex items-center justify-center gap-2 flex-wrap"
            role="list"
          >
            {TRUST_BADGES.map((badge, i) => (
              <span
                key={badge}
                role="listitem"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'rgb(var(--ds-ink-s))',
                  letterSpacing: '0.02em',
                }}
              >
                {i > 0 && (
                  <span style={{ color: 'rgb(var(--ds-hl-s))', userSelect: 'none' }} aria-hidden="true">·</span>
                )}
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Copilot Demo ───────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        aria-labelledby="copilot-heading"
        style={{ padding: '96px 0' }}
      >
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="mb-5 flex justify-center">
              <IBMBadge />
            </div>
            <h2
              id="copilot-heading"
              className="text-display-md text-balance mx-auto"
              style={{ maxWidth: 560 }}
            >
              Meet your AI Citizen Copilot
            </h2>
            <p
              className="mt-4 mx-auto"
              style={{ fontSize: 16, color: 'rgb(var(--ds-ink-m))', maxWidth: 440 }}
            >
              Just tell it what you want. The AI handles everything else.
            </p>
          </motion.div>

          {/* Product demo panel — DESIGN.md product-screenshot-card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl mx-auto"
          >
            <div
              style={{
                background: 'rgb(var(--ds-s1))',
                border: '1px solid rgb(var(--ds-hl))',
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              {/* Window chrome */}
              <div
                className="flex items-center gap-2 px-4"
                style={{
                  height: 40,
                  borderBottom: '1px solid rgb(var(--ds-hl))',
                  background: 'rgb(var(--ds-s2))',
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} aria-hidden="true" />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} aria-hidden="true" />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e' }} aria-hidden="true" />
                <span className="ml-2 text-[11px] font-mono" style={{ color: 'rgb(var(--ds-ink-s))' }}>
                  AI Citizen Copilot
                </span>
              </div>

              {/* Chat body */}
              <div className="p-5 space-y-4">
                {/* User message */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                    style={{ background: 'rgb(var(--ds-accent))' }}
                    aria-hidden="true"
                  >
                    R
                  </div>
                  <div
                    className="text-[13px] px-3 py-2.5 max-w-xs leading-relaxed"
                    style={{
                      background: 'rgb(var(--ds-accent))',
                      color: '#fff',
                      borderRadius: '8px 8px 8px 2px',
                    }}
                  >
                    मैं डेयरी फार्म शुरू करना चाहता हूँ
                  </div>
                </div>

                {/* AI response */}
                <div className="flex items-start gap-3 flex-row-reverse">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgb(var(--ds-s3))', border: '1px solid rgb(var(--ds-hl-s))' }}
                    aria-hidden="true"
                  >
                    <Brain className="w-3.5 h-3.5" style={{ color: 'rgb(var(--ds-accent))' }} />
                  </div>
                  <div
                    className="text-[13px] px-4 py-4 max-w-sm"
                    style={{
                      background: 'rgb(var(--ds-s2))',
                      border: '1px solid rgb(var(--ds-hl-s))',
                      borderRadius: '8px 8px 2px 8px',
                    }}
                  >
                    <p className="font-semibold mb-3" style={{ color: 'rgb(var(--ds-ink))', fontSize: 13 }}>
                      Found 4 relevant schemes:
                    </p>
                    <ul className="space-y-2">
                      {[
                        { name: 'PM-KISAN', score: '95%' },
                        { name: 'NABARD Dairy Scheme', score: '82%' },
                        { name: 'Kisan Credit Card', score: '90%' },
                        { name: 'Animal Husbandry Infra', score: '78%' },
                      ].map((s) => (
                        <li key={s.name} className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-1.5 text-[12px]" style={{ color: 'rgb(var(--ds-ink-m))' }}>
                            <CheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: '#27a644' }} aria-hidden="true" />
                            {s.name}
                          </span>
                          <span className="text-[11px] font-semibold" style={{ color: '#27a644' }}>{s.score}</span>
                        </li>
                      ))}
                    </ul>
                    <div
                      className="mt-3.5 pt-3 flex items-center gap-2"
                      style={{ borderTop: '1px solid rgb(var(--ds-hl))' }}
                    >
                      <span className="badge badge-emerald">94% confidence</span>
                      <span className="text-[11px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>IBM Granite AI</span>
                    </div>
                  </div>
                </div>

                {/* Processing indicator */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1" aria-hidden="true">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: 'rgb(var(--ds-accent))' }}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.13 }}
                      />
                    ))}
                  </div>
                  <span className="text-[12px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>
                    Building your personalised roadmap…
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="how-heading"
        style={{ padding: '96px 0', borderTop: '1px solid rgb(var(--ds-hl))' }}
      >
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="text-center mb-14"
          >
            <p className="text-eyebrow mb-3">Simple process</p>
            <h2 id="how-heading" className="text-display-md">How it works</h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-5"
          >
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
              <motion.div
                key={step}
                variants={fadeUp}
                style={{
                  background: 'rgb(var(--ds-s1))',
                  border: '1px solid rgb(var(--ds-hl))',
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                {/* Step number */}
                <p
                  className="font-semibold leading-none mb-5"
                  style={{
                    fontSize: 11,
                    color: 'rgb(var(--ds-accent))',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Step {step}
                </p>
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: 'rgba(94,106,210,0.12)', border: '1px solid rgba(94,106,210,0.2)' }}
                  aria-hidden="true"
                >
                  <Icon className="w-4 h-4" style={{ color: 'rgb(var(--ds-accent))' }} />
                </div>
                <h3 className="text-card-title mb-2" style={{ fontSize: 15 }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'rgb(var(--ds-ink-s))', lineHeight: 1.55 }}>{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="categories-heading"
        style={{ padding: '96px 0', borderTop: '1px solid rgb(var(--ds-hl))' }}
      >
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="text-center mb-12"
          >
            <p className="text-eyebrow mb-3">96 real government schemes</p>
            <h2 id="categories-heading" className="text-display-md">Schemes for every citizen</h2>
            <p className="mt-4" style={{ fontSize: 16, color: 'rgb(var(--ds-ink-m))', maxWidth: 440, margin: '16px auto 0' }}>
              From farmers to startup founders — we cover every segment.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
          >
            {CATEGORIES.map(({ icon: Icon, label, to, count }) => (
              <motion.div key={label} variants={fadeUp}>
                <Link
                  to={to}
                  className="group flex flex-col items-center py-6 px-3 gap-2.5 text-center transition-all duration-150"
                  style={{
                    background: 'rgb(var(--ds-s1))',
                    border: '1px solid rgb(var(--ds-hl))',
                    borderRadius: 12,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgb(var(--ds-s2))'
                    e.currentTarget.style.borderColor = 'rgb(var(--ds-hl-s))'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgb(var(--ds-s1))'
                    e.currentTarget.style.borderColor = 'rgb(var(--ds-hl))'
                    e.currentTarget.style.transform = ''
                  }}
                  aria-label={`Browse ${label} schemes — ${count}`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(94,106,210,0.10)', border: '1px solid rgba(94,106,210,0.15)' }}
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5" style={{ color: 'rgb(var(--ds-accent))' }} />
                  </div>
                  <span className="text-[13px] font-medium leading-tight" style={{ color: 'rgb(var(--ds-ink-m))' }}>{label}</span>
                  <span className="text-[11px]" style={{ color: 'rgb(var(--ds-ink-s))' }}>{count}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features (Bento) ─────────────────────────────────────────────────── */}
      <section
        aria-labelledby="features-heading"
        style={{ padding: '96px 0', borderTop: '1px solid rgb(var(--ds-hl))' }}
      >
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="text-center mb-14"
          >
            <p className="text-eyebrow mb-3">Platform capabilities</p>
            <h2 id="features-heading" className="text-display-md">Everything you need</h2>
            <p className="mt-4" style={{ fontSize: 16, color: 'rgb(var(--ds-ink-m))', maxWidth: 440, margin: '16px auto 0' }}>
              A complete platform built for India's 1.4 billion citizens.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {FEATURES.map(({ icon: Icon, title, desc, badge }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                style={{
                  background: 'rgb(var(--ds-s1))',
                  border: '1px solid rgb(var(--ds-hl))',
                  borderRadius: 12,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  transition: 'all 200ms ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgb(var(--ds-s2))'
                  e.currentTarget.style.borderColor = 'rgb(var(--ds-hl-s))'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgb(var(--ds-s1))'
                  e.currentTarget.style.borderColor = 'rgb(var(--ds-hl))'
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.boxShadow = ''
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(94,106,210,0.12)', border: '1px solid rgba(94,106,210,0.18)' }}
                  aria-hidden="true"
                >
                  <Icon className="w-4 h-4" style={{ color: 'rgb(var(--ds-accent))' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-[14px] font-semibold leading-tight" style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.014em' }}>{title}</h3>
                    <span className="badge badge-indigo">{badge}</span>
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'rgb(var(--ds-ink-s))' }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="testimonials-heading"
        style={{ padding: '96px 0', borderTop: '1px solid rgb(var(--ds-hl))' }}
      >
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="text-center mb-12"
          >
            <p className="text-eyebrow mb-3">Real citizens, real results</p>
            <h2 id="testimonials-heading" className="text-display-md">Discovering more benefits</h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-4"
          >
            {TESTIMONIALS.map(({ name, role, text, initials }) => (
              <motion.div
                key={name}
                variants={fadeUp}
                style={{
                  background: 'rgb(var(--ds-s1))',
                  border: '1px solid rgb(var(--ds-hl))',
                  borderRadius: 12,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                {/* Stars */}
                <div className="flex gap-0.5" aria-label="5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5" style={{ fill: '#f59e0b', color: '#f59e0b' }} aria-hidden="true" />
                  ))}
                </div>
                <p className="text-[13.5px] leading-relaxed flex-1" style={{ color: 'rgb(var(--ds-ink-m))' }}>
                  "{text}"
                </p>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                    style={{ background: 'rgb(var(--ds-accent))' }}
                    aria-hidden="true"
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold leading-none" style={{ color: 'rgb(var(--ds-ink))' }}>{name}</p>
                    <p className="text-[11px] leading-none mt-1" style={{ color: 'rgb(var(--ds-ink-s))' }}>{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="faq-heading"
        style={{ padding: '96px 0', borderTop: '1px solid rgb(var(--ds-hl))' }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="text-center mb-12"
          >
            <p className="text-eyebrow mb-3">Questions</p>
            <h2 id="faq-heading" className="text-display-md">Frequently asked</h2>
          </motion.div>
          <div>
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} {...faq} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner (DESIGN.md cta-banner component) ───────────────────── */}
      <section
        aria-labelledby="cta-heading"
        style={{ padding: '96px 0', borderTop: '1px solid rgb(var(--ds-hl))' }}
      >
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              style={{
                background: 'rgb(var(--ds-s1))',
                border: '1px solid rgb(var(--ds-hl-s))',
                borderRadius: 16,
                padding: 48,
                textAlign: 'center',
              }}
            >
              <IBMBadge />
              <h2
                id="cta-heading"
                className="text-display-md mt-6 mb-4 text-balance"
              >
                Ready to find your benefits?
              </h2>
              <p
                className="mx-auto mb-8 text-balance"
                style={{ fontSize: 16, color: 'rgb(var(--ds-ink-m))', maxWidth: 480 }}
              >
                Join thousands of citizens discovering government schemes they qualify for — completely free.
              </p>
              <Link
                to="/signup"
                className="btn-primary-glow inline-flex items-center gap-2"
                style={{ fontSize: 14, padding: '10px 22px' }}
              >
                Start your journey — it's free
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer (DESIGN.md footer component) ───────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgb(var(--ds-hl))', padding: '48px 0 32px' }}>
        <div className="section-container">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            {/* Brand column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <BSLogo size={22} />
                <p className="text-[13px] font-semibold" style={{ color: 'rgb(var(--ds-ink))', letterSpacing: '-0.02em' }}>
                  BharatSeva AI
                </p>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'rgb(var(--ds-ink-s))' }}>
                AI-powered citizen intelligence platform for every Indian.
              </p>
              <div className="mt-4">
                <IBMBadge />
              </div>
            </div>

            {[
              {
                title: 'Product',
                links: ['AI Copilot', 'Scheme Discovery', 'Eligibility Check', 'Document Vault', 'Application Tracker'],
              },
              {
                title: 'Categories',
                links: ['Farmer Schemes', 'Scholarships', 'Women & Gender', 'Senior Citizens', 'Startup & MSME'],
              },
              {
                title: 'Trust & Safety',
                links: ['DPDP Act Compliant', 'Data Encrypted', 'Open Source', 'IBM Innovation Showcase'],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <h3 className="text-[12px] font-semibold mb-4" style={{ color: 'rgb(var(--ds-ink-m))', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  {title}
                </h3>
                <ul className="space-y-2.5">
                  {links.map((item) => (
                    <li key={item}>
                      <Link
                        to="/login"
                        className="text-[12px] transition-colors"
                        style={{ color: 'rgb(var(--ds-ink-s))', textDecoration: 'none' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'rgb(var(--ds-ink))' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgb(var(--ds-ink-s))' }}
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{
              paddingTop: 24,
              borderTop: '1px solid rgb(var(--ds-hl))',
            }}
          >
            <p className="text-[11px]" style={{ color: 'rgb(var(--ds-ink-3))' }}>
              © 2025 BharatSeva AI · An IBM Innovation Showcase Project
            </p>
            <p className="text-[11px]" style={{ color: 'rgb(var(--ds-ink-3))' }}>
              Built with care for every Indian citizen
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
