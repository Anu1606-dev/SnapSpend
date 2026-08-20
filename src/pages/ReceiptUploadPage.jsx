import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { extractReceiptData } from '../services/gemini'
import { addExpense, clearExpenseError } from '../features/expenses/expensesSlice'
import { CATEGORIES } from '../utils/categories'
import { getLocalDateString } from '../utils/date'

export default function ReceiptUploadPage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')
  const [extracted, setExtracted] = useState(false)

  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [note, setNote] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { status } = useSelector((state) => state.expenses)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setExtracted(false)
    setExtractError('')
    setSuccessMessage('')
  }

  const handleExtract = async () => {
    setExtracting(true)
    setExtractError('')

    try {
      const data = await extractReceiptData(selectedFile)
      setMerchant(data.merchant || '')
      setAmount(data.amount != null ? String(data.amount) : '')
      setDate(data.date || getLocalDateString())
      setCategory(CATEGORIES.includes(data.category) ? data.category : CATEGORIES[0])
      setExtracted(true)
    } catch (err) {
      console.error('Receipt extraction failed:', err)
      setExtractError(
        "Gemini's service is temporarily busy — wait a few seconds and try again, or enter the details manually below."
      )
      setDate(getLocalDateString())
      setExtracted(true)
    } finally {
      setExtracting(false)
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
      setSelectedFile(null)
      setPreviewUrl(null)
      setExtracted(false)
      setMerchant('')
      setAmount('')
      setDate('')
      setCategory(CATEGORIES[0])
      setNote('')
    }
  }

  const handleChooseDifferent = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  return (
    <div className="max-w-xl mx-auto p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Scan Receipt</h1>
        <p className="text-slate-500 text-sm mt-1">Let AI read the details for you.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
        {!selectedFile && (
          <label className="flex flex-col items-center justify-center gap-3 w-full border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
            <span className="text-4xl">📷</span>
            <div>
              <p className="text-sm font-medium text-slate-700">Tap to choose a receipt photo</p>
              <p className="text-xs text-slate-400 mt-1">JPG or PNG works best</p>
            </div>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        )}

        {selectedFile && !extracted && (
          <div className="space-y-4">
            <img
              src={previewUrl}
              alt="Receipt preview"
              className="w-full rounded-2xl border border-slate-100 max-h-80 object-contain bg-slate-50"
            />
            <button
              onClick={handleExtract}
              disabled={extracting}
              className="w-full bg-blue-600 text-white py-2.5 rounded-full font-semibold text-sm hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {extracting && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
              {extracting ? 'Reading receipt...' : '✨ Extract Details'}
            </button>
            <button
              onClick={handleChooseDifferent}
              className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Choose a different photo
            </button>
          </div>
        )}

        {extracted && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {extractError && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl">
                {extractError}
              </p>
            )}

            <img
              src={previewUrl}
              alt="Receipt preview"
              className="w-full rounded-2xl border border-slate-100 max-h-56 object-contain bg-slate-50"
            />

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
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Category</label>
                {!extractError && (
                  <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                    ✨ AI suggested
                  </span>
                )}
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
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
              />
            </div>

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
              {status === 'loading' ? 'Saving...' : 'Confirm & Save Expense'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}