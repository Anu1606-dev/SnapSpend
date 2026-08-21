import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Pencil, Trash2 } from 'lucide-react'
import { fetchExpenses, updateExpense, deleteExpense } from '../features/expenses/expensesSlice'
import { CATEGORIES, CATEGORY_COLORS } from '../utils/categories'

export default function ExpenseListPage() {
  const dispatch = useDispatch()
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

  const filtered = items
    .filter((exp) => filterCategory === 'All' || exp.category === filterCategory)
    .filter((exp) => !startDate || exp.date >= startDate)
    .filter((exp) => !endDate || exp.date <= endDate)
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  const hasActiveFilters = filterCategory !== 'All' || startDate || endDate

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

  const inputClass =
    'w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow'

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 min-w-0">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Your Expenses</h1>
        <p className="text-slate-500 text-sm mt-1">
          {filtered.length} expense{filtered.length !== 1 ? 's' : ''}
          {hasActiveFilters ? ' matching your filters' : ' total'}
        </p>
      </div>

      {/* Filter bar — 2-column grid on mobile (won't overflow), free-flowing row from sm+ */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4 sm:items-end">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`${inputClass} bg-white sm:w-auto`}
          >
            <option value="All">All</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`${inputClass} sm:w-auto`}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`${inputClass} sm:w-auto`}
          />
        </div>

        {hasActiveFilters && (
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="text-sm text-slate-500 hover:text-slate-700 font-medium pb-2"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {fetchStatus === 'loading' && (
          <p className="text-center text-slate-400 text-sm py-12">Loading expenses...</p>
        )}

        {fetchStatus === 'failed' && (
          <p className="text-center text-red-600 text-sm py-12">{fetchError}</p>
        )}

        {fetchStatus === 'succeeded' && filtered.length === 0 && (
          <div className="text-center py-12 px-6">
            <p className="text-slate-500 text-sm">
              {hasActiveFilters ? 'No expenses match these filters.' : 'No expenses yet.'}
            </p>
          </div>
        )}

        {filtered.map((expense) => {
          const color = CATEGORY_COLORS[expense.category] || '#6b7280'

          return (
            <div key={expense.id} className="border-b border-slate-50 last:border-b-0 px-4 sm:px-5 py-4 min-w-0">
              {editingId === expense.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.amount}
                        onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                        className={`${inputClass} py-1.5`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Merchant</label>
                      <input
                        type="text"
                        value={editForm.merchant}
                        onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })}
                        className={`${inputClass} py-1.5`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className={`${inputClass} py-1.5 bg-white`}
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        className={`${inputClass} py-1.5`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Note</label>
                    <input
                      type="text"
                      value={editForm.note}
                      onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                      className={`${inputClass} py-1.5`}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleEditSave(expense.id)}
                      className="bg-amber-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-amber-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // flex-col on mobile (stacks, never cramps), flex-row from sm+ (side by side)
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-slate-800 truncate max-w-[55vw] sm:max-w-none">
                          {expense.merchant}
                        </p>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: `${color}1A`, color }}
                        >
                          {expense.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {expense.date}
                        {expense.note && ` · ${expense.note}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <p className="font-semibold text-slate-900">₹{Number(expense.amount).toFixed(2)}</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditClick(expense)}
                        aria-label="Edit expense"
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        disabled={deletingId === expense.id}
                        aria-label="Delete expense"
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}