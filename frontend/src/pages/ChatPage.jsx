import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, RefreshCw, Loader2 } from 'lucide-react'
import { chatService } from '@/services/chatService'
import { ChatBubble } from '@/components/ChatBubble'
import { ExplainabilityDrawer } from '@/components/ExplainabilityDrawer'
import { DegradedModeBanner } from '@/components/DegradedModeBanner'
import { ErrorState } from '@/components/ErrorState'
import { useUIStore } from '@/store/uiStore'
import clsx from 'clsx'

const SUGGESTIONS = [
  'What schemes are available for farmers?',
  'How do I apply for PM-KISAN?',
  'What documents do I need for a scholarship?',
  'Tell me about MUDRA loans',
  'How to check my eligibility for Ayushman Bharat?',
]

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [error, setError] = useState(null)
  const [degraded, setDegraded] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [explainData, setExplainData] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const { language } = useUIStore()

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Safe parser: handles null, arrays, objects, valid JSON strings, and invalid JSON
    const parseSources = (raw) => {
      if (!raw) return []
      if (Array.isArray(raw)) return raw
      if (typeof raw === 'object') return [raw]
      if (typeof raw === 'string') {
        try { return JSON.parse(raw) } catch { return [] }
      }
      return []
    }

    // Load chat history
    chatService.getHistory({ page: 1, per_page: 50 })
      .then((res) => {
        const hist = res.data?.history || []
        setMessages(hist.map((h) => ({
          id: h.id,
          role: h.role,
          message: h.message,
          reply: undefined,
          confidence: h.confidence_score,
          sources: parseSources(h.sources),
          agent_used: h.agent_used,
          fallback_used: h.fallback_used,
          created_at: h.created_at,
        })))
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false))
  }, [])

  useEffect(() => { scrollToBottom() }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = {
      id: Date.now(),
      role: 'user',
      message: input.trim(),
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    const text = input.trim()
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await chatService.sendMessage(text, language)
      const data = res.data
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        message: data.reply,
        confidence: data.confidence,
        sources: data.sources || [],
        reasoning: data.reasoning,
        agent_used: data.agent_used,
        fallback_used: data.fallback_used,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMsg])
      if (data.fallback_used || res.meta?.degraded) setDegraded(true)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to send message. Try again.')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setDegraded(false)
    setError(null)
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header */}
      <div
        className="px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid rgb(var(--ds-hl))', background: 'rgb(var(--ds-canvas))' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" style={{ color: 'rgb(var(--ds-accent))' }} aria-hidden="true" />
            <h1 className="font-bold" style={{ color: 'rgb(var(--ds-ink))' }}>AI Chat</h1>
            <span className="badge badge-indigo text-xs">IBM Granite</span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--ds-ink-s))' }}>Ask anything about government schemes</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="btn-ghost text-xs" aria-label="Clear chat history">
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      {/* Degraded banner */}
      {degraded && (
        <div className="px-4 py-2 flex-shrink-0">
          <DegradedModeBanner />
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {loadingHistory ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'rgb(var(--ds-accent))' }} aria-label="Loading chat history" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(94,106,210,0.10)' }}
              aria-hidden="true"
            >
              <MessageSquare className="w-8 h-8" style={{ color: 'rgb(var(--ds-accent))' }} />
            </div>
            <h2 className="font-semibold mb-2" style={{ color: 'rgb(var(--ds-ink))' }}>Start a conversation</h2>
            <p className="text-sm mb-6 max-w-sm" style={{ color: 'rgb(var(--ds-ink-s))' }}>
              Ask me about any government scheme, check eligibility, or get guidance on your application.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-xs px-3 py-1.5 rounded-full transition-colors"
                  style={{
                    background: 'rgb(var(--ds-s1))',
                    color: 'rgb(var(--ds-ink-m))',
                    border: '1px solid rgb(var(--ds-hl))',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--ds-accent))'; e.currentTarget.style.color = 'rgb(var(--ds-accent))' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--ds-hl))'; e.currentTarget.style.color = 'rgb(var(--ds-ink-m))' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              onShowExplanation={(m) => {
                setExplainData({ reasoning: m.reasoning, sources: m.sources, confidence: m.confidence, agent_name: m.agent_used, fallback_used: m.fallback_used })
                setDrawerOpen(true)
              }}
            />
          ))
        )}

        {loading && (
          <div className="flex gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgb(var(--ds-s3))', border: '1px solid rgb(var(--ds-hl-s))' }}
              aria-hidden="true"
            >
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'rgb(var(--ds-accent))' }} />
            </div>
            <div
              className="rounded-2xl rounded-tl-sm px-4 py-3"
              style={{ background: 'rgb(var(--ds-s1))', border: '1px solid rgb(var(--ds-hl))' }}
            >
              <div className="flex gap-1" aria-label="AI is typing">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'rgb(var(--ds-ink-s))', animationDelay: `${i * 0.15}s` }} aria-hidden="true" />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Input */}
      <div
        className="flex-shrink-0 px-4 sm:px-6 py-3"
        style={{ borderTop: '1px solid rgb(var(--ds-hl))', background: 'rgb(var(--ds-canvas))' }}
      >
        <div className="flex items-end gap-3">
          <label htmlFor="chat-input" className="sr-only">Type your message</label>
          <textarea
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about government schemes... (Enter to send)"
            rows={1}
            className="flex-1 input-field resize-none min-h-[42px] max-h-32 py-2.5"
            aria-label="Type your message"
            style={{ height: 'auto' }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="btn-primary p-2.5 flex-shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <p className="text-xs mt-1.5" style={{ color: 'rgb(var(--ds-ink-3))' }}>
          Powered by IBM watsonx.ai Granite · Responses may not be fully accurate — verify with official sources.
        </p>
      </div>

      {/* Explainability drawer */}
      <ExplainabilityDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        data={explainData}
      />
    </div>
  )
}
