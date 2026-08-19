import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { addExpense, clearExpenseError } from '../features/expenses/expensesSlice'
import { suggestCategory } from '../services/gemini'
import { CATEGORIES } from '../utils/categories'

export default function AddExpensePage() {
  const [amount, setAmount] = useState('')
  const [merchant, setMerchant] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [suggesting, setSuggesting] = useState(false)
  const [suggestError, setSuggestError] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { status, error } = useSelector((state) => state.expenses)

  const handleSuggestCategory = async () => {
    setSuggestError('')
    setSuggesting(true)
    try {
      const suggested = await suggestCategory(merchant, note)
      setCategory(suggested)
    } catch {
      setSuggestError("Couldn't get a suggestion — pick a category manually.")
    } finally {
      setSuggesting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearExpenseError())
    setSuccessMessage('')

    const result = await dispatch(
      addExpense({ userId: user.uid, amount, merchant, category, date, note })
    )

    if (addExpense.fulfilled.match(result)) {
      setSuccessMessage('Expense saved!')
      setAmount('')
      setMerchant('')
      setCategory(CATEGORIES[0])
      setDate(new Date().toISOString().split('T')[0])
      setNote('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Add Expense</h1>
          <button onClick={() => navigate('/')} className="text-sm text-blue-600 hover:underline">
            ← Back home
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Merchant</label>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              required
              placeholder="e.g. Starbucks"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <button
                type="button"
                onClick={handleSuggestCategory}
                disabled={!merchant || suggesting}
                className="text-xs text-purple-600 hover:underline disabled:text-gray-300 disabled:no-underline"
              >
                {suggesting ? 'Thinking...' : '✨ Suggest with AI'}
              </button>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {suggestError && <p className="text-xs text-amber-600 mt-1">{suggestError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Any extra detail..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          {successMessage && (
            <p className="text-sm text-green-700 bg-green-50 p-2 rounded">{successMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {status === 'loading' ? 'Saving...' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}