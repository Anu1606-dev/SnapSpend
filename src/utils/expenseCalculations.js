// All expense dates are stored as 'YYYY-MM-DD' strings, so slicing the first
// 7 characters gives a 'YYYY-MM' month key we can compare directly.

export function getCurrentMonthTotal(expenses) {
  const currentMonthKey = new Date().toISOString().slice(0, 7)
  return expenses
    .filter((exp) => exp.date.startsWith(currentMonthKey))
    .reduce((sum, exp) => sum + Number(exp.amount), 0)
}

export function getPreviousMonthTotal(expenses) {
  const now = new Date()
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthKey = prevMonthDate.toISOString().slice(0, 7)
  return expenses
    .filter((exp) => exp.date.startsWith(prevMonthKey))
    .reduce((sum, exp) => sum + Number(exp.amount), 0)
}

export function getCurrentMonthCount(expenses) {
  const currentMonthKey = new Date().toISOString().slice(0, 7)
  return expenses.filter((exp) => exp.date.startsWith(currentMonthKey)).length
}

// Returns [{ category, total }] for a given month (defaults to current),
// sorted highest spend first — ready to feed straight into a pie chart.
export function getCategoryBreakdown(expenses, monthKey = null) {
  const targetMonth = monthKey || new Date().toISOString().slice(0, 7)
  const monthExpenses = expenses.filter((exp) => exp.date.startsWith(targetMonth))

  const totals = {}
  monthExpenses.forEach((exp) => {
    totals[exp.category] = (totals[exp.category] || 0) + Number(exp.amount)
  })

  return Object.entries(totals)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}

// Returns the last N months (including the current one) as
// [{ key: 'YYYY-MM', label: 'Mar 26', total }], with 0 for months with no spending —
// so the trend chart always shows a continuous timeline, not just months you happened to spend in.
export function getMonthlyTrend(expenses, monthsCount = 6) {
  const now = new Date()
  const months = []

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toISOString().slice(0, 7)
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