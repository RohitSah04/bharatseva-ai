import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Brain, FileText, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react'
import { ConfidenceBadge, ConfidenceBar } from './ConfidenceBadge'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}

const slideIn = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

function SectionHeading({ children }) {
  return (
    <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
      {children}
    </h3>
  )
}

export function ExplainabilityDrawer({ open, onClose, data }) {
  const closeRef = useRef(null)

  // Focus the close button when drawer opens
  useEffect(() => {
    if (open) {
      setTimeout(() => closeRef.current?.focus(), 50)
    }
  }, [open])

  // Trap Escape key
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!data) return null
  const { reasoning, sources = [], confidence, agent_name, fallback_used, fallback_reason } = data

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-float-lg z-50 flex flex-col border-l border-slate-200 dark:border-slate-700"
            role="dialog"
            aria-modal="true"
            aria-label="AI Explanation"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-600 flex items-center justify-center" aria-hidden="true">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-sm">AI Explanation</h2>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Powered by IBM Granite</p>
                </div>
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close explanation drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="flex-1 overflow-y-auto p-5 space-y-6"
            >
              {/* Confidence section */}
              {confidence != null && (
                <motion.section variants={slideIn} aria-labelledby="conf-heading">
                  <SectionHeading>Confidence Score</SectionHeading>
                  <div className="card card-gradient p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <ConfidenceBadge score={confidence} />
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {Math.round(confidence * 100)}%
                      </span>
                    </div>
                    <ConfidenceBar score={confidence} />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {confidence >= 0.85
                        ? 'High confidence — result based on strong matching evidence.'
                        : confidence >= 0.65
                        ? 'Moderate confidence — review the reasoning and verify key criteria.'
                        : 'Lower confidence — manual verification recommended.'}
                    </p>
                  </div>
                </motion.section>
              )}

              {/* Fallback warning */}
              {fallback_used && (
                <motion.div
                  variants={slideIn}
                  className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Rule-based fallback used</p>
                    {fallback_reason && (
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">{fallback_reason}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Reasoning */}
              {reasoning && (
                <motion.section variants={slideIn} aria-labelledby="reason-heading">
                  <SectionHeading>AI Reasoning</SectionHeading>
                  <div className="card p-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {reasoning}
                    </p>
                  </div>
                </motion.section>
              )}

              {/* Sources */}
              {sources.length > 0 && (
                <motion.section variants={slideIn} aria-labelledby="sources-heading">
                  <div className="flex items-center justify-between mb-3">
                    <SectionHeading>Government Sources</SectionHeading>
                    <span className="badge badge-indigo text-[10px]">{sources.length}</span>
                  </div>
                  <ul className="space-y-2.5" role="list">
                    {sources.map((source, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {source.name || source.title}
                          </p>
                          {source.excerpt && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{source.excerpt}</p>
                          )}
                          {source.url && (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1.5 font-medium"
                            >
                              View source
                              <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            </a>
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </motion.section>
              )}

              {/* Footer / agent info */}
              <motion.div
                variants={slideIn}
                className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3"
              >
                <div className="flex items-center gap-2">
                  {!fallback_used && (
                    <ShieldCheck className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                  )}
                  {agent_name && (
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Agent: <span className="font-semibold text-slate-600 dark:text-slate-400">{agent_name}</span>
                    </p>
                  )}
                </div>
                {!fallback_used && (
                  <span className="badge-ibm inline-flex">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    IBM Granite
                  </span>
                )}
              </motion.div>
            </motion.div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
