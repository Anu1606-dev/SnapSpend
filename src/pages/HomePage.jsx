import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { PenLine, Camera, ChevronRight, Smile, Brain, Frown, AlertTriangle } from 'lucide-react'
import { fetchExpenses } from '../features/expenses/expensesSlice'
import { fetchBudget } from '../features/budget/budgetSlice'
import { CATEGORY_COLORS } from '../utils/categories'
import { getCurrentMonthTotal, getTodayTotal } from '../utils/expenseCalculations'
import { getUsualMonthlyAverage, getBudgetMood } from '../utils/budgetCalculations'

const MOOD_STYLES = {
  happy: { Icon: Smile, iconBg: 'bg-emerald-500', text: 'text-emerald-700', heroBg: 'bg-gradient-to-br from-emerald-50 to-white', ring: 'ring-emerald-100' },
  thinking: { Icon: Brain, iconBg: 'bg-blue-500', text: 'text-blue-700', heroBg: 'bg-gradient-to-br from-blue-50 to-white', ring: 'ring-blue-100' },
  sad: { Icon: Frown, iconBg: 'bg-amber-500', text: 'text-amber-700', heroBg: 'bg-gradient-to-br from-amber-50 to-white', ring: 'ring-amber-100' },
  tensed: { Icon: AlertTriangle, iconBg: 'bg-red-500', text: 'text-red-700', heroBg: 'bg-gradient-to-br from-red-50 to-white', ring: 'ring-red-100' },
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getFriendlyName(email) {
  if (!email) return ''
  const namePart = email.split('@')[0]
  return namePart.charAt(0).toUpperCase() + namePart.slice(1)
}

export default function HomePage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { items, fetchStatus } = useSelector((state) => state.expenses)
  const { hasBudget, monthlyBudget, fetchStatus: budgetFetchStatus } = useSelector((state) => state.budget)

  useEffect(() => {
    if (user) {
      dispatch(fetchExpenses(user.uid))
      dispatch(fetchBudget(user.uid))
    }
  }, [user, dispatch])

  const todayTotal = useMemo(() => getTodayTotal(items), [items])
  const monthTotal = useMemo(() => getCurrentMonthTotal(items), [items])
  const usualMonthlyAverage = useMemo(() => getUsualMonthlyAverage(items, 3), [items])

  const mood = useMemo(
    () => getBudgetMood({ hasBudget, monthlyBudget: monthlyBudget || 0, currentMonthTotal: monthTotal, usualMonthlyAverage }),
    [hasBudget, monthlyBudget, monthTotal, usualMonthlyAverage]
  )
  const moodStyle = MOOD_STYLES[mood.mood]
  const MoodIcon = moodStyle.Icon

  const recentExpenses = useMemo(
    () => [...items].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5),
    [items]
  )

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          {getGreeting()}{user?.email ? `, ${getFriendlyName(user.email)}` : ''}
        </h1>
        <p className="text-slate-500 text-sm mt-1">Here's where things stand today.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-5 card-hover">
          <p className="text-sm text-slate-500 mb-1">Today</p>
          <p className="text-2xl font-bold text-slate-900">₹{todayTotal.toFixed(2)}</p>
        </div>
        <div className="bg-slate-900 rounded-2xl shadow-sm p-5 card-hover">
          <p className="text-sm text-slate-400 mb-1">This Month</p>
          <p className="text-2xl font-bold text-white">₹{monthTotal.toFixed(2)}</p>
        </div>
      </div>

      {budgetFetchStatus === 'succeeded' && (
        <Link
          to="/budget"
          className={`group flex items-center justify-between gap-4 rounded-2xl shadow-sm p-5 mb-8 card-hover ${moodStyle.heroBg} ring-1 ${moodStyle.ring}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-full ${moodStyle.iconBg} flex items-center justify-center shrink-0`}>
              <MoodIcon size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-semibold uppercase tracking-wide ${moodStyle.text}`}>{mood.label}</p>
              <p className="text-sm text-slate-700 truncate">
                {hasBudget ? mood.message : 'Set up your budget to get insights'}
              </p>
            </div>
          </div>
          <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 shrink-0 flex items-center gap-1">
            Budget <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <Link to="/add-expense" className="group bg-white rounded-2xl shadow-sm p-6 card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
            <PenLine size={22} className="text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Add Expense</p>
            <p className="text-sm text-slate-500">Log one manually in seconds</p>
          </div>
        </Link>

        <Link to="/scan-receipt" className="group bg-white rounded-2xl shadow-sm p-6 card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
            <Camera size={22} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Scan Receipt</p>
            <p className="text-sm text-slate-500">Let AI read it for you</p>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Recent Activity</h2>
          <Link to="/expenses" className="text-sm text-blue-600 font-medium hover:underline">
            View all
          </Link>
        </div>

        {fetchStatus === 'loading' && <p className="text-center text-slate-400 text-sm py-10">Loading...</p>}

        {fetchStatus === 'succeeded' && recentExpenses.length === 0 && (
          <div className="text-center py-10 px-6">
            <p className="text-slate-500 text-sm mb-4">No expenses yet — let's fix that.</p>
            <Link to="/add-expense" className="btn-primary inline-block px-5 py-2 text-sm">
              Add your first expense
            </Link>
          </div>
        )}

        {recentExpenses.map((expense) => (
          <div key={expense.id} className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-50 last:border-b-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[expense.category] }} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{expense.merchant}</p>
                <p className="text-xs text-slate-400">{expense.date}</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-900 shrink-0">₹{Number(expense.amount).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}