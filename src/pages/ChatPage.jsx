import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchExpenses } from '../features/expenses/expensesSlice'
import { createExpenseChatSession, sendChatMessage } from '../services/gemini'

const STARTER_PROMPTS = [
  'How much did I spend last month?',
  'What did I spend most on this month?',
  'Show me my Food expenses this week',
]

export default function ChatPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
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
    // One chat session per visit to this page — it remembers the
    // conversation so far, so follow-up questions stay in context.
    chatSessionRef.current = createExpenseChatSession()
  }, [user, dispatch])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (textOverride) => {
    const text = (textOverride ?? input).trim()
    if (!text || sending) return

    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setSending(true)

    try {
      const replyText = await sendChatMessage(chatSessionRef.current, text, items)
      setMessages((prev) => [...prev, { role: 'assistant', text: replyText }])
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Ask SnapSpend</h1>
          <button onClick={() => navigate('/')} className="text-sm text-blue-600 hover:underline">
            ← Back home
          </button>
        </div>

        {fetchStatus === 'loading' && (
          <p className="text-sm text-gray-400 mb-2">Loading your expense data...</p>
        )}

        <div
          className="flex-1 bg-white rounded-lg shadow-sm p-4 overflow-y-auto mb-4 space-y-3"
          style={{ minHeight: '400px', maxHeight: '60vh' }}
        >
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-2xl rounded-bl-sm text-sm">
                Thinking...
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
                className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-50 disabled:opacity-50"
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}