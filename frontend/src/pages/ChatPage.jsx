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
    // Load chat history
    chatService.getHistory({ page: 1, per_page: 50 })
      .then((res) => {
        const hist = res.data?.history || []
        // Map to message format
        setMessages(hist.map((h) => ({
          id: h.id,
          role: h.role,
          message: h.message,
          reply: undefined,
          confidence: h.confidence_score,
          sources: Array.isArray(h.sources) ? h.sources : (h.sources ? JSON.parse(h.sources) : []),
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
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <h1 className="font-bold text-gray-900">AI Chat</h1>
            <span className="badge bg-blue-100 text-blue-700 text-xs">IBM Granite</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Ask anything about government schemes</p>
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
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" aria-label="Loading chat history" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4" aria-hidden="true">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900 mb-2">Start a conversation</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-sm">
              Ask me about any government scheme, check eligibility, or get guidance on your application.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-full transition-colors"
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
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1" aria-label="AI is typing">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} aria-hidden="true" />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-3 border-t border-gray-200 bg-white">
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
        <p className="text-xs text-gray-400 mt-1.5">
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
