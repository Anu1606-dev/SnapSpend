import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  Wallet, CalendarDays, Receipt, TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3,
} from 'lucide-react'
import { fetchExpenses } from '../features/expenses/expensesSlice'
import { CATEGORY_COLORS } from '../utils/categories'
import { getLocalDateString } from '../utils/date'
import { useIsDarkMode } from '../hooks/useIsDarkMode'
import {
  getCurrentMonthTotal, getPreviousMonthTotal, getCurrentMonthCount, getCategoryBreakdown, getMonthlyTrend,
} from '../utils/expenseCalculations'

export default function DashboardPage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { items, fetchStatus, fetchError } = useSelector((state) => state.expenses)
  const isDark = useIsDarkMode()

  useEffect(() => {
    if (user) {
      dispatch(fetchExpenses(user.uid))
    }
  }, [user, dispatch])

  const currentMonthTotal = useMemo(() => getCurrentMonthTotal(items), [items])
  const previousMonthTotal = useMemo(() => getPreviousMonthTotal(items), [items])
  const currentMonthCount = useMemo(() => getCurrentMonthCount(items), [items])
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(items), [items])
  const monthlyTrend = useMemo(() => getMonthlyTrend(items, 6), [items])
  const currentMonthKey = useMemo(() => getLocalDateString().slice(0, 7), [])

  const percentChange =
    previousMonthTotal > 0 ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 : null

  const gridColor = isDark ? '#2A3442' : '#f1f5f9'
  const axisColor = isDark ? '#2A3442' : '#e2e8f0'
  const tickColor = isDark ? '#8E9BAE' : '#94a3b8'
  const tooltipBg = isDark ? '#1B222B' : '#ffffff'
  const tooltipText = isDark ? '#FFFFFF' : '#0f172a'
  const cursorFill = isDark ? '#141920' : '#f8fafc'
  const currentMonthFill = isDark ? '#EAA054' : '#f59e0b'

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-fog text-sm mt-1">Your spending, visualized.</p>
      </div>

      {fetchStatus === 'loading' && <p className="text-center text-slate-400 text-sm py-16">Loading your data...</p>}
      {fetchStatus === 'failed' && <p className="text-center text-red-600 dark:text-coral text-sm py-16">{fetchError}</p>}

      {fetchStatus === 'succeeded' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-bg-card rounded-2xl shadow-sm p-5 card-hover">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber/15 flex items-center justify-center">
                  <Wallet size={16} className="text-amber-600 dark:text-amber" />
                </div>
                <p className="text-sm text-slate-500 dark:text-fog">This Month</p>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{currentMonthTotal.toFixed(2)}</p>
              {percentChange !== null && (
                <div className={`flex items-center gap-1 text-xs mt-1.5 ${percentChange >= 0 ? 'text-red-600 dark:text-coral' : 'text-emerald-600 dark:text-teal'}`}>
                  {percentChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Math.abs(percentChange).toFixed(1)}% vs last month
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-bg-card rounded-2xl shadow-sm p-5 card-hover">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-azure/15 flex items-center justify-center">
                  <CalendarDays size={16} className="text-blue-600 dark:text-azure" />
                </div>
                <p className="text-sm text-slate-500 dark:text-fog">Last Month</p>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{previousMonthTotal.toFixed(2)}</p>
            </div>

            <div className="bg-white dark:bg-bg-card rounded-2xl shadow-sm p-5 card-hover">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-teal/15 flex items-center justify-center">
                  <Receipt size={16} className="text-violet-600 dark:text-teal" />
                </div>
                <p className="text-sm text-slate-500 dark:text-fog">Transactions</p>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{currentMonthCount}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-bg-card rounded-2xl shadow-sm p-5 md:p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon size={18} className="text-slate-400 dark:text-mist" />
              <h2 className="font-semibold text-slate-900 dark:text-white">Spending by Category</h2>
              <span className="text-xs text-slate-400 dark:text-mist">This month</span>
            </div>
            {categoryBreakdown.length === 0 ? (
              <p className="text-slate-400 dark:text-mist text-sm text-center py-12">No expenses this month yet.</p>
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
                  <Tooltip
                    formatter={(value) => `₹${value.toFixed(2)}`}
                    contentStyle={{ backgroundColor: tooltipBg, border: 'none', borderRadius: '8px', color: tooltipText }}
                  />
                  <Legend wrapperStyle={{ color: tickColor }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white dark:bg-bg-card rounded-2xl shadow-sm p-5 md:p-6">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={18} className="text-slate-400 dark:text-mist" />
              <h2 className="font-semibold text-slate-900 dark:text-white">Spending Trend</h2>
              <span className="text-xs text-slate-400 dark:text-mist">Last 6 months</span>
            </div>
            <div className="flex items-center gap-4 mb-3 ml-6">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-mist">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber" />
                Current month
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-mist">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-azure" />
                Previous months
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isDark ? '#2F72D6' : '#6366f1'} />
                    <stop offset="100%" stopColor={isDark ? '#1D3B61' : '#3b82f6'} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: tickColor }} axisLine={{ stroke: axisColor }} />
                <YAxis tick={{ fontSize: 12, fill: tickColor }} axisLine={{ stroke: axisColor }} />
                <Tooltip
                  formatter={(value) => `₹${value.toFixed(2)}`}
                  cursor={{ fill: cursorFill }}
                  contentStyle={{ backgroundColor: tooltipBg, border: 'none', borderRadius: '8px', color: tooltipText }}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {monthlyTrend.map((entry) => (
                    <Cell key={entry.key} fill={entry.key === currentMonthKey ? currentMonthFill : 'url(#trendGradient)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}