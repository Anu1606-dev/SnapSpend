import { getLocalDateString } from './date'

// 'YYYY-MM' is just the first 7 characters of the local date string
function getMonthKey(date) {
  return getLocalDateString(date).slice(0, 7)
}

export function getCurrentMonthTotal(expenses) {
  const currentMonthKey = getMonthKey(new Date())
  return expenses
    .filter((exp) => exp.date.startsWith(currentMonthKey))
    .reduce((sum, exp) => sum + Number(exp.amount), 0)
}

export function getPreviousMonthTotal(expenses) {
  const now = new Date()
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthKey = getMonthKey(prevMonthDate)
  return expenses
    .filter((exp) => exp.date.startsWith(prevMonthKey))
    .reduce((sum, exp) => sum + Number(exp.amount), 0)
}

export function getCurrentMonthCount(expenses) {
  const currentMonthKey = getMonthKey(new Date())
  return expenses.filter((exp) => exp.date.startsWith(currentMonthKey)).length
}

export function getCategoryBreakdown(expenses, monthKey = null) {
  const targetMonth = monthKey || getMonthKey(new Date())
  const monthExpenses = expenses.filter((exp) => exp.date.startsWith(targetMonth))

  const totals = {}
  monthExpenses.forEach((exp) => {
    totals[exp.category] = (totals[exp.category] || 0) + Number(exp.amount)
  })

  return Object.entries(totals)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}

export function getMonthlyTrend(expenses, monthsCount = 6) {
  const now = new Date()
  const months = []

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = getMonthKey(d)
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    months.push({ key, label, total: 0 })
  }

  expenses.forEach((exp) => {
    const monthKey = exp.date.slice(0, 7)
    const monthEntry = months.find((m) => m.key === monthKey)
    if (monthEntry) {
      monthEntry.total += Number(exp.amount)
    }
  })

  return months
}

export function getTodayTotal(expenses) {
  const todayKey = getLocalDateString()
  return expenses
    .filter((exp) => exp.date === todayKey)
    .reduce((sum, exp) => sum + Number(exp.amount), 0)
}
