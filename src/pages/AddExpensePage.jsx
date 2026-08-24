import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Wallet, Store, Tag, CreditCard, CalendarDays, MapPin, StickyNote, Sparkles } from 'lucide-react'
import { addExpense, clearExpenseError } from '../features/expenses/expensesSlice'
import { suggestCategory } from '../services/gemini'
import { CATEGORIES, CATEGORY_COLORS } from '../utils/categories'
import { PAYMENT_METHODS } from '../utils/paymentMethods'
import { getLocalDateString } from '../utils/date'

const fieldLabel = 'flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-cloud mb-1.5'
const fieldInput =
  'w-full px-4 py-2.5 border border-slate-200 dark:border-edge dark:bg-inset dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow'

export default function AddExpensePage() {
  const [amount, setAmount] = useState('')
  const [merchant, setMerchant] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [date, setDate] = useState(() => getLocalDateString())
  const [location, setLocation] = useState('')
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
      addExpense({ userId: user.uid, amount, merchant, category, date, note, paymentMethod, location })
    )

    if (addExpense.fulfilled.match(result)) {
      setSuccessMessage('Expense saved!')
      setAmount('')
      setMerchant('')
      setCategory(CATEGORIES[0])
      setPaymentMethod(PAYMENT_METHODS[0])
      setDate(getLocalDateString())
      setLocation('')
      setNote('')
    }
  }

  const showPreview = amount && merchant

  return (
    <div className="max-w-xl mx-auto p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Add Expense</h1>
        <p className="text-slate-500 dark:text-cloud text-sm mt-1">Log a purchase with all the details.</p>
      </div>

      <div className="bg-white dark:bg-surface rounded-2xl shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className={fieldLabel}>
                <Wallet size={14} className="text-slate-400 dark:text-smoke" />
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-smoke text-sm">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder="0.00"
                  className={`${fieldInput} pl-8`}
                />
              </div>
            </div>

            <div>
              <label className={fieldLabel}>
                <Store size={14} className="text-slate-400 dark:text-smoke" />
                Merchant
              </label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                required
                placeholder="e.g. Starbucks"
                className={fieldInput}
              />
            </div>
          </div>

          <hr className="border-slate-100 dark:border-edge" />

          {/* Both cells now contain ONLY a label + select — identical structure, guaranteed alignment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={fieldLabel}>
                <Tag size={14} className="text-slate-400 dark:text-smoke" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`${fieldInput} bg-white dark:bg-inset`}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={fieldLabel}>
                <CreditCard size={14} className="text-slate-400 dark:text-smoke" />
                Payment
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={`${fieldInput} bg-white dark:bg-inset`}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>

          {/* AI suggest button now lives in its own row, outside the grid entirely */}
          <div>
            <button
              type="button"
              onClick={handleSuggestCategory}
              disabled={!merchant || suggesting}
              className="flex items-center gap-1 text-xs font-medium text-white dark:bg-linear-to-r dark:from-mint dark:to-electric bg-violet-600 px-2.5 py-1 rounded-full hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              <Sparkles size={12} />
              {suggesting ? 'Thinking...' : 'Suggest category with AI'}
            </button>
            {suggestError && <p className="text-xs text-amber-600 dark:text-sun mt-1.5">{suggestError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={fieldLabel}>
                <CalendarDays size={14} className="text-slate-400 dark:text-smoke" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={fieldInput}
              />
            </div>

            <div>
              <label className={fieldLabel}>
                <MapPin size={14} className="text-slate-400 dark:text-smoke" />
                Location <span className="text-slate-400 dark:text-smoke font-normal ml-1">(optional)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Connaught Place"
                className={fieldInput}
              />
            </div>
          </div>

          <div>
            <label className={fieldLabel}>
              <StickyNote size={14} className="text-slate-400 dark:text-smoke" />
              Note <span className="text-slate-400 dark:text-smoke font-normal ml-1">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Any extra detail..."
              className={`${fieldInput} resize-none`}
            />
          </div>

          {showPreview && (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-edge bg-slate-50/70 dark:bg-inset/70 p-4">
              <p className="text-xs font-medium text-slate-400 dark:text-smoke mb-2">Preview</p>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[category] }}
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 dark:text-white truncate">{merchant}</p>
                    <p className="text-xs text-slate-400 dark:text-smoke truncate">
                      {category} · {paymentMethod}
                      {location && ` · ${location}`}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-slate-900 dark:text-white shrink-0">₹{Number(amount || 0).toFixed(2)}</p>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-rose bg-red-50 dark:bg-rose/10 border border-red-100 dark:border-rose/20 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="text-sm text-emerald-700 dark:text-mint bg-emerald-50 dark:bg-mint-deep/40 border border-emerald-100 dark:border-mint/30 px-3 py-2 rounded-xl">
              {successMessage}
            </p>
          )}

          <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-2.5 text-sm">
            {status === 'loading' ? 'Saving...' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}