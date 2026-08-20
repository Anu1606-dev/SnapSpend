import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addExpense, clearExpenseError } from '../features/expenses/expensesSlice'
import { suggestCategory } from '../services/gemini'
import { CATEGORIES } from '../utils/categories'
import { getLocalDateString } from '../utils/date'

export default function AddExpensePage() {
  const [amount, setAmount] = useState('')
  const [merchant, setMerchant] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [date, setDate] = useState(() => getLocalDateString())
  const [note, setNote] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [suggesting, setSuggesting] = useState(false)
  const [suggestError, setSuggestError] = useState('')

  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { status, error } = useSelector((state) => state.expenses)

  const handleSuggestCategory = async () => {
    setSuggestError('')
    setSuggesting(true)
    try {
      const suggested = await suggestCategory(merchant, note)
      setCategory(suggested)
    } catch (err) {
      console.error('Category suggestion failed:', err)
      setSuggestError("Gemini's service is temporarily busy — wait a few seconds and try again.")
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
      setDate(getLocalDateString())
      setNote('')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Add Expense</h1>
        <p className="text-slate-500 text-sm mt-1">Log a purchase in a few seconds.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Merchant</label>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              required
              placeholder="e.g. Starbucks"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">Category</label>
              <button
                type="button"
                onClick={handleSuggestCategory}
                disabled={!merchant || suggesting}
                className="text-xs font-medium text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full hover:bg-violet-100 disabled:opacity-40 disabled:hover:bg-violet-50 transition-colors"
              >
                {suggesting ? 'Thinking...' : '✨ Suggest with AI'}
              </button>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {suggestError && <p className="text-xs text-amber-600 mt-1.5">{suggestError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Note <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Any extra detail..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-amber-500 text-white py-2.5 rounded-full font-semibold text-sm hover:bg-amber-600 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {status === 'loading' ? 'Saving...' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}