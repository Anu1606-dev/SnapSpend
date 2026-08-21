import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Send, Bot } from 'lucide-react'
import { fetchExpenses } from '../features/expenses/expensesSlice'
import { createExpenseChatSession, sendChatMessage } from '../services/gemini'

const STARTER_PROMPTS = [
  'How much did I spend last month?',
  'What did I spend most on this month?',
  'Show me my Food expenses this week',
]

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}

export default function ChatPage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { items, fetchStatus } = useSelector((state) => state.expenses)

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi! Ask me anything about your spending — like "how much did I spend on food last month?"',
    },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const chatSessionRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (user) {
      dispatch(fetchExpenses(user.uid))
    }
    chatSessionRef.current = createExpenseChatSession()
  }, [user, dispatch])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const handleSend = async (textOverride) => {
    const text = (textOverride ?? input).trim()
    if (!text || sending) return

    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setSending(true)

    try {
      const { text: replyText, sourceCount } = await sendChatMessage(chatSessionRef.current, text, items)
      setMessages((prev) => [...prev, { role: 'assistant', text: replyText, sourceCount }])
    } catch (err) {
      console.error('Chat request failed:', err)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: "Gemini's service is temporarily busy — try asking again in a few seconds." },
      ])
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSend()
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 flex flex-col" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Ask SnapSpend</h1>
        <p className="text-slate-500 text-sm mt-1">Real answers, pulled from your real spending.</p>
      </div>

      <div
        className="flex-1 bg-white rounded-2xl shadow-sm p-4 md:p-5 overflow-y-auto mb-4 space-y-4"
        style={{ minHeight: '400px', maxHeight: '60vh' }}
      >
        {fetchStatus === 'loading' && <p className="text-xs text-slate-400">Loading your expense data...</p>}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-emerald-400" />
              </div>
            )}
            <div className="max-w-[75%] flex flex-col gap-1">
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
              {msg.role === 'assistant' && typeof msg.sourceCount === 'number' && (
                <span className="text-xs text-slate-400 px-1">
                  {msg.sourceCount > 0
                    ? `Sourced from ${msg.sourceCount} matching transaction${msg.sourceCount !== 1 ? 's' : ''}`
                    : 'No matching transactions found'}
                </span>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-emerald-400" />
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-bl-sm">
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              disabled={sending}
              className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your spending..."
          disabled={sending}
          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-white bg-linear-to-r from-amber-500 to-orange-500 shadow-sm shadow-amber-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/30 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}