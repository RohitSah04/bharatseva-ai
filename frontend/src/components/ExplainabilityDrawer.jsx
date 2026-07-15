import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ExternalLink, Brain, FileText } from 'lucide-react'
import { ConfidenceBadge, ConfidenceBar } from './ConfidenceBadge'

export function ExplainabilityDrawer({ open, onClose, data }) {
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
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="AI Explanation"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" aria-hidden="true" />
                <h2 className="font-semibold text-gray-900">AI Explanation</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close explanation drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Confidence */}
              {confidence != null && (
                <section aria-labelledby="confidence-heading">
                  <h3 id="confidence-heading" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Confidence Score</h3>
                  <div className="flex items-center gap-3">
                    <ConfidenceBadge score={confidence} />
                  </div>
                  <ConfidenceBar score={confidence} className="mt-2" />
                </section>
              )}

              {/* Fallback warning */}
              {fallback_used && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                  <span className="font-medium text-amber-800">Rule-based fallback used.</span>
                  {fallback_reason && <span className="text-amber-700">{fallback_reason}</span>}
                </div>
              )}

              {/* Reasoning */}
              {reasoning && (
                <section aria-labelledby="reasoning-heading">
                  <h3 id="reasoning-heading" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Reasoning</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{reasoning}</p>
                </section>
              )}

              {/* Sources */}
              {sources.length > 0 && (
                <section aria-labelledby="sources-heading">
                  <h3 id="sources-heading" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Government Sources ({sources.length})
                  </h3>
                  <ul className="space-y-2" role="list">
                    {sources.map((source, i) => (
                      <li key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{source.name || source.title}</p>
                          {source.excerpt && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{source.excerpt}</p>
                          )}
                          {source.url && (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                            >
                              View source
                              <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Agent info */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-gray-100">
                {agent_name && (
                  <p className="text-xs text-gray-400">
                    Agent: <span className="font-medium">{agent_name}</span>
                  </p>
                )}
                {!fallback_used && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-blue-700 text-white leading-none">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    Powered by IBM Granite
                  </span>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
