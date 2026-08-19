import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { extractReceiptData } from '../services/gemini'
import { addExpense, clearExpenseError } from '../features/expenses/expensesSlice'
import { CATEGORIES } from '../utils/categories'

export default function ReceiptUploadPage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')
  const [extracted, setExtracted] = useState(false)

  // Form fields — populated by Gemini, editable by the user before saving
  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [note, setNote] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()
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
      setDate(data.date || new Date().toISOString().split('T')[0])
      setExtracted(true)
    } catch {
      setExtractError(
        "Couldn't read that receipt automatically. You can still enter the details manually below."
      )
      // Even on failure, show the form so the user can fill it in by hand
      setDate(new Date().toISOString().split('T')[0])
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
      // Reset everything for the next receipt
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Scan Receipt</h1>
          <button onClick={() => navigate('/')} className="text-sm text-blue-600 hover:underline">
            ← Back home
          </button>
        </div>

        {/* Step 1: choose a photo */}
        {!selectedFile && (
          <div>
            <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400">
              <span className="text-gray-500">Tap to choose a receipt photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Step 2: preview + extract button */}
        {selectedFile && !extracted && (
          <div className="space-y-4">
            <img
              src={previewUrl}
              alt="Receipt preview"
              className="w-full rounded-lg border border-gray-200 max-h-80 object-contain"
            />
            <button
              onClick={handleExtract}
              disabled={extracting}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {extracting ? 'Reading receipt...' : 'Extract Details'}
            </button>
            <button
              onClick={() => {
                setSelectedFile(null)
                setPreviewUrl(null)
              }}
              className="w-full text-sm text-gray-500 hover:underline"
            >
              Choose a different photo
            </button>
          </div>
        )}

        {/* Step 3: review & confirm form */}
        {extracted && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {extractError && (
              <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded">{extractError}</p>
            )}

            <img
              src={previewUrl}
              alt="Receipt preview"
              className="w-full rounded-lg border border-gray-200 max-h-56 object-contain"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {successMessage && (
              <p className="text-sm text-green-700 bg-green-50 p-2 rounded">{successMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {status === 'loading' ? 'Saving...' : 'Confirm & Save Expense'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}