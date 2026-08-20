import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { fetchExpenses } from '../features/expenses/expensesSlice'
import { CATEGORY_COLORS } from '../utils/categories'
import {
  getCurrentMonthTotal,
  getPreviousMonthTotal,
  getCurrentMonthCount,
  getCategoryBreakdown,
  getMonthlyTrend,
} from '../utils/expenseCalculations'

export default function DashboardPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { items, fetchStatus, fetchError } = useSelector((state) => state.expenses)

  useEffect(() => {
    if (user) {
      dispatch(fetchExpenses(user.uid))
    }
  }, [user, dispatch])

  // useMemo avoids re-running these calculations on every render —
  // only recompute when the underlying expense list actually changes.
  const currentMonthTotal = useMemo(() => getCurrentMonthTotal(items), [items])
  const previousMonthTotal = useMemo(() => getPreviousMonthTotal(items), [items])
  const currentMonthCount = useMemo(() => getCurrentMonthCount(items), [items])
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(items), [items])
  const monthlyTrend = useMemo(() => getMonthlyTrend(items, 6), [items])

  const percentChange =
    previousMonthTotal > 0
      ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
      : null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <button onClick={() => navigate('/')} className="text-sm text-blue-600 hover:underline">
            ← Back home
          </button>
        </div>

        {fetchStatus === 'loading' && (
          <p className="text-center text-gray-500 py-12">Loading your data...</p>
        )}

        {fetchStatus === 'failed' && (
          <p className="text-center text-red-600 py-12">{fetchError}</p>
        )}

        {fetchStatus === 'succeeded' && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 mb-1">This Month</p>
                <p className="text-2xl font-bold text-gray-800">₹{currentMonthTotal.toFixed(2)}</p>
                {percentChange !== null && (
                  <p className={`text-xs mt-1 ${percentChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {percentChange >= 0 ? '▲' : '▼'} {Math.abs(percentChange).toFixed(1)}% vs last month
                  </p>
                )}
              </div>

              <div className="bg-white p-5 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Last Month</p>
                <p className="text-2xl font-bold text-gray-800">₹{previousMonthTotal.toFixed(2)}</p>
              </div>

              <div className="bg-white p-5 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Transactions This Month</p>
                <p className="text-2xl font-bold text-gray-800">{currentMonthCount}</p>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category (This Month)</h2>
              {categoryBreakdown.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No expenses this month yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryBreakdown.map((entry) => (
                        <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Monthly trend */}
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Spending Trend (Last 6 Months)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  )
}