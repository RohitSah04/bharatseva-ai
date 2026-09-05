import { motion } from 'framer-motion'
import { Bot, User, Brain } from 'lucide-react'
import { ConfidenceBadge } from './ConfidenceBadge'
import clsx from 'clsx'

function GraniteBadge() {
  return (
    <span className="badge-ibm">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      IBM Granite
    </span>
  )
}

export function ChatBubble({ message, onShowExplanation }) {
  const isUser = message.role === 'user'
  const hasMeta = message.confidence != null || (message.sources && message.sources.length > 0) || message.reasoning

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={clsx('flex gap-3 max-w-full', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: isUser ? 'rgb(var(--ds-accent))' : 'rgb(var(--ds-s3))',
          color: isUser ? '#fff' : 'rgb(var(--ds-accent))',
          border: isUser ? 'none' : '1px solid rgb(var(--ds-hl-s))',
        }}
        aria-hidden="true"
      >
        {isUser
          ? <User className="w-4 h-4" />
          : <Bot className="w-4 h-4" />
        }
      </div>

      {/* Content */}
      <div className={clsx('flex flex-col gap-1.5 max-w-[75%]', isUser && 'items-end')}>
        <div
          className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
          style={
            isUser
              ? { background: 'rgb(var(--ds-accent))', color: '#fff', borderRadius: '16px 16px 4px 16px' }
              : { background: 'rgb(var(--ds-s1))', border: '1px solid rgb(var(--ds-hl))', color: 'rgb(var(--ds-ink))', borderRadius: '16px 16px 16px 4px' }
          }
          role={isUser ? undefined : 'article'}
          aria-label={isUser ? 'Your message' : 'AI response'}
        >
          {typeof message.message === 'string'
            ? <p className="whitespace-pre-wrap">{message.message}</p>
            : message.message
          }
          {message.reply && (
            <p className="whitespace-pre-wrap">{message.reply}</p>
          )}
        </div>

        {/* AI metadata */}
        {!isUser && hasMeta && (
          <div className="flex items-center gap-2 flex-wrap">
            {message.confidence != null && (
              <ConfidenceBadge score={message.confidence} showPercent />
            )}
            {!message.fallback_used && <GraniteBadge />}
            {(message.reasoning || message.sources?.length > 0) && onShowExplanation && (
              <button
                onClick={() => onShowExplanation(message)}
                className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
                style={{ color: 'rgb(var(--ds-accent))' }}
                aria-label="View AI reasoning and sources"
              >
                <Brain className="w-3 h-3" aria-hidden="true" />
                View reasoning
              </button>
            )}
          </div>
        )}

        {message.fallback_used && (
          <span className="text-xs font-medium" style={{ color: '#fbbf24' }}>Rule-based fallback</span>
        )}

        {message.created_at && (
          <time
            dateTime={message.created_at}
            className="text-xs"
            style={{ color: 'rgb(var(--ds-ink-3))' }}
          >
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </time>
        )}
      </div>
    </motion.div>
  )
}
