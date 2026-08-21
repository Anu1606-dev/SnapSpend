import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  PiggyBank, Wallet, TrendingDown, TrendingUp, CalendarClock, Pencil,
  Smile, Brain, Frown, AlertTriangle, Target,
} from 'lucide-react'
import { fetchExpenses } from '../features/expenses/expensesSlice'
import { fetchBudget, saveBudget, clearBudgetError } from '../features/budget/budgetSlice'
import { getCurrentMonthTotal } from '../utils/expenseCalculations'
import {
  getDaysInMonth,
  getDaysElapsedInMonth,
  getUsualMonthlyAverage,
  getBudgetMood,
} from '../utils/budgetCalculations'

const MOOD_STYLES = {
  happy: { Icon: Smile, iconBg: 'bg-emerald-500', text: 'text-emerald-700', heroBg: 'bg-gradient-to-br from-emerald-50 to-white', ring: 'ring-emerald-100' },
  thinking: { Icon: Brain, iconBg: 'bg-blue-500', text: 'text-blue-700', heroBg: 'bg-gradient-to-br from-blue-50 to-white', ring: 'ring-blue-100' },
  sad: { Icon: Frown, iconBg: 'bg-amber-500', text: 'text-amber-700', heroBg: 'bg-gradient-to-br from-amber-50 to-white', ring: 'ring-amber-100' },
  tensed: { Icon: AlertTriangle, iconBg: 'bg-red-500', text: 'text-red-700', heroBg: 'bg-gradient-to-br from-red-50 to-white', ring: 'ring-red-100' },
}

const fieldLabel = 'block text-sm font-medium text-slate-700 mb-1.5'
const fieldInput = 'w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow'

function StatCard({ icon: Icon, color, label, value, sub, delay = 0 }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    teal: 'bg-teal-50 text-teal-600',
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 card-hover animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colorMap[color]}`}>
        <Icon size={16} />
      </div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function BudgetPage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { items } = useSelector((state) => state.expenses)
  const { monthlyIncome, monthlyBudget, hasBudget, fetchStatus, saveStatus, error } = useSelector((state) => state.budget)

  const [editing, setEditing] = useState(false)
  const [incomeInput, setIncomeInput] = useState('')
  const [budgetInput, setBudgetInput] = useState('')

  useEffect(() => {
    if (user) {
      dispatch(fetchExpenses(user.uid))
      dispatch(fetchBudget(user.uid))
    }
  }, [user, dispatch])

  const handleEdit = () => {
    setEditing(true)
    setIncomeInput(String(monthlyIncome))
    setBudgetInput(String(monthlyBudget))
  }

  const handleCancelEdit = () => {
    setEditing(false)
    if (hasBudget) {
      setIncomeInput(String(monthlyIncome))
      setBudgetInput(String(monthlyBudget))
    } else {
      setIncomeInput('')
      setBudgetInput('')
    }
  }

  const currentMonthTotal = useMemo(() => getCurrentMonthTotal(items), [items])
  const usualMonthlyAverage = useMemo(() => getUsualMonthlyAverage(items, 3), [items])
  const daysInMonth = getDaysInMonth()
  const daysElapsed = getDaysElapsedInMonth()
  const daysRemaining = Math.max(daysInMonth - daysElapsed, 0)

  const mood = useMemo(
    () => getBudgetMood({ hasBudget, monthlyBudget: monthlyBudget || 0, currentMonthTotal, usualMonthlyAverage }),
    [hasBudget, monthlyBudget, currentMonthTotal, usualMonthlyAverage]
  )
  const moodStyle = MOOD_STYLES[mood.mood]
  const MoodIcon = moodStyle.Icon

  const budgetRemaining = hasBudget ? monthlyBudget - currentMonthTotal : null
  const pctBudgetUsed = hasBudget && monthlyBudget > 0 ? currentMonthTotal / monthlyBudget : 0
  const monthFraction = daysElapsed / daysInMonth
  const dailyAllowance = budgetRemaining !== null && daysRemaining > 0 ? Math.max(budgetRemaining, 0) / daysRemaining : null
  const savingsTarget = hasBudget ? monthlyIncome - monthlyBudget : null
  const projectedSpend = daysElapsed > 0 ? (currentMonthTotal / daysElapsed) * daysInMonth : 0
  const projectedSavings = hasBudget ? monthlyIncome - projectedSpend : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearBudgetError())
    const result = await dispatch(saveBudget({ userId: user.uid, monthlyIncome: incomeInput, monthlyBudget: budgetInput }))
    if (saveBudget.fulfilled.match(result)) {
      setEditing(false)
    }
  }

  const showSetupForm = editing || (fetchStatus === 'succeeded' && !hasBudget)

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <PiggyBank size={28} className="text-emerald-500" />
            Budget & Savings
          </h1>
          <p className="text-slate-500 text-sm mt-1">Set a target, track your pace, know where you stand.</p>
        </div>
        {hasBudget && !editing && (
          <button onClick={handleEdit} className="btn-secondary flex items-center gap-1.5 px-4 py-2 text-sm">
            <Pencil size={14} />
            Edit
          </button>
        )}
      </div>

      {fetchStatus === 'loading' && <p className="text-center text-slate-400 text-sm py-16">Loading...</p>}

      {fetchStatus === 'succeeded' && showSetupForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 animate-fade-in-up">
          <h2 className="font-semibold text-slate-900 mb-1">{hasBudget ? 'Update your numbers' : "Let's set up your budget"}</h2>
          <p className="text-sm text-slate-500 mb-6">
            {hasBudget ? 'Adjust your income or spending target anytime.' : 'This powers your savings insights and monthly pace tracking.'}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={fieldLabel}>Monthly Income</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={incomeInput}
                  onChange={(e) => setIncomeInput(e.target.value)}
                  required
                  placeholder="e.g. 60000"
                  className={fieldInput}
                />
              </div>
            </div>
            <div>
              <label className={fieldLabel}>Monthly Max Spend (Budget)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  required
                  placeholder="e.g. 40000"
                  className={fieldInput}
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={saveStatus === 'loading'} className="btn-primary px-6 py-2.5 text-sm">
                {saveStatus === 'loading' ? 'Saving...' : 'Save Budget'}
              </button>
              {hasBudget && (
                <button type="button" onClick={handleCancelEdit} className="btn-secondary px-6 py-2.5 text-sm">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {fetchStatus === 'succeeded' && hasBudget && !editing && (
        <div className="space-y-6">
          <div className={`rounded-2xl shadow-sm p-6 md:p-8 ${moodStyle.heroBg} ring-1 ${moodStyle.ring} animate-fade-in-up`}>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full ${moodStyle.iconBg} flex items-center justify-center shrink-0`}>
                <MoodIcon size={32} className="text-white" strokeWidth={2} />
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide ${moodStyle.text}`}>{mood.label}</p>
                <p className="text-slate-800 font-medium mt-0.5">{mood.message}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <Target size={18} className="text-slate-400" />
              <h2 className="font-semibold text-slate-900">Budget Pace</h2>
            </div>
            <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${moodStyle.iconBg}`}
                style={{ width: `${Math.min(pctBudgetUsed * 100, 100)}%` }}
              />
              <div
                className="absolute top-0 h-full w-0.5 bg-slate-700"
                style={{ left: `${Math.min(monthFraction * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>{Math.round(pctBudgetUsed * 100)}% of budget used</span>
              <span>Day {daysElapsed} of {daysInMonth}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard icon={Wallet} color="blue" label="Monthly Income" value={`₹${monthlyIncome.toFixed(2)}`} delay={100} />
            <StatCard icon={Target} color="violet" label="Monthly Budget" value={`₹${monthlyBudget.toFixed(2)}`} delay={140} />
            <StatCard
              icon={budgetRemaining >= 0 ? TrendingDown : TrendingUp}
              color={budgetRemaining >= 0 ? 'emerald' : 'red'}
              label="Left Till Month End"
              value={`₹${budgetRemaining.toFixed(2)}`}
              sub={dailyAllowance !== null ? `≈ ₹${dailyAllowance.toFixed(0)}/day for ${daysRemaining} days` : null}
              delay={180}
            />
            <StatCard icon={CalendarClock} color="amber" label="Usual Monthly Average" value={`₹${usualMonthlyAverage.toFixed(2)}`} sub="Based on your last 3 months" delay={220} />
            <StatCard icon={PiggyBank} color="teal" label="Savings Target" value={`₹${savingsTarget.toFixed(2)}`} sub="Income − Budget" delay={260} />
            <StatCard
              icon={projectedSavings >= 0 ? Smile : Frown}
              color={projectedSavings >= 0 ? 'emerald' : 'red'}
              label="Projected Savings"
              value={`₹${projectedSavings.toFixed(2)}`}
              sub="At your current pace"
              delay={300}
            />
          </div>
        </div>
      )}
    </div>
  )
}