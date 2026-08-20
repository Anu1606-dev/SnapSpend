import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchExpenses, updateExpense, deleteExpense } from '../features/expenses/expensesSlice'
import { CATEGORIES } from '../utils/categories'

export default function ExpenseListPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { items, fetchStatus, fetchError } = useSelector((state) => state.expenses)

  const [filterCategory, setFilterCategory] = useState('All')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (user) {
      dispatch(fetchExpenses(user.uid))
    }
  }, [user, dispatch])

  // Dates are stored as 'YYYY-MM-DD' strings — that format sorts and compares
  // correctly with plain string operators (<, >, >=), no need to parse into Date objects.
  const filtered = items
    .filter((exp) => filterCategory === 'All' || exp.category === filterCategory)
    .filter((exp) => !startDate || exp.date >= startDate)
    .filter((exp) => !endDate || exp.date <= endDate)
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  const handleEditClick = (expense) => {
    setEditingId(expense.id)
    setEditForm({
      amount: expense.amount,
      merchant: expense.merchant,
      category: expense.category,
      date: expense.date,
      note: expense.note || '',
    })
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const handleEditSave = async (id) => {
    const result = await dispatch(updateExpense({ id, ...editForm }))
    if (updateExpense.fulfilled.match(result)) {
      setEditingId(null)
      setEditForm(null)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this expense? This cannot be undone.')
    if (!confirmed) return
    setDeletingId(id)
    await dispatch(deleteExpense(id))
    setDeletingId(null)
  }

  const clearFilters = () => {
    setFilterCategory('All')
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Your Expenses</h1>
          <button onClick={() => navigate('/')} className="text-sm text-blue-600 hover:underline">
            ← Back home
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="All">All</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <button onClick={clearFilters} className="text-sm text-gray-500 hover:underline pb-2">
            Clear filters
          </button>

          <div className="ml-auto text-sm text-gray-500 pb-2">
            {filtered.length} expense{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {fetchStatus === 'loading' && (
            <p className="p-6 text-center text-gray-500">Loading expenses...</p>
          )}

          {fetchStatus === 'failed' && (
            <p className="p-6 text-center text-red-600">{fetchError}</p>
          )}

          {fetchStatus === 'succeeded' && filtered.length === 0 && (
            <p className="p-6 text-center text-gray-500">No expenses match these filters yet.</p>
          )}

          {filtered.map((expense) => (
            <div key={expense.id} className="border-b border-gray-100 last:border-b-0 p-4">
              {editingId === expense.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.amount}
                        onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Merchant</label>
                      <input
                        type="text"
                        value={editForm.merchant}
                        onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Note</label>
                    <input
                      type="text"
                      value={editForm.note}
                      onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSave(expense.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800 truncate">{expense.merchant}</p>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {expense.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {expense.date}
                      {expense.note && ` · ${expense.note}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="font-semibold text-gray-800">₹{Number(expense.amount).toFixed(2)}</p>
                    <button
                      onClick={() => handleEditClick(expense)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      disabled={deletingId === expense.id}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      {deletingId === expense.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}