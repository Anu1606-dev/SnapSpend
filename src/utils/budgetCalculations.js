import { getLocalDateString } from './date'

export function getDaysInMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export function getDaysElapsedInMonth(date = new Date()) {
  return date.getDate()
}

// Average of the 3 calendar months immediately BEFORE the current month.
// Current month is excluded since it's still in progress and would drag
// the average down artificially.
export function getUsualMonthlyAverage(expenses, monthsToAverage = 3) {
  const now = new Date()
  const monthKeys = []
  for (let i = 1; i <= monthsToAverage; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthKeys.push(getLocalDateString(d).slice(0, 7))
  }

  const totalsByMonth = {}
  monthKeys.forEach((key) => { totalsByMonth[key] = 0 })

  expenses.forEach((exp) => {
    const key = exp.date.slice(0, 7)
    if (key in totalsByMonth) {
      totalsByMonth[key] += Number(exp.amount)
    }
  })

  const monthsWithData = monthKeys.filter((key) => totalsByMonth[key] > 0)
  if (monthsWithData.length === 0) return 0

  const sum = monthsWithData.reduce((acc, key) => acc + totalsByMonth[key], 0)
  return sum / monthsWithData.length
}

const MOOD_TEXT = {
  happy: { label: 'On Track' },
  thinking: { label: 'Steady' },
  sad: { label: 'Getting Tight' },
  tensed: { label: 'Overspending' },
}

// Pace-based mood: compares spend-so-far vs time-elapsed, not a flat %.
export function getBudgetMood({ hasBudget, monthlyBudget, currentMonthTotal, usualMonthlyAverage }) {
  const daysInMonth = getDaysInMonth()
  const daysElapsed = getDaysElapsedInMonth()
  const monthFraction = daysElapsed / daysInMonth

  if (!hasBudget) {
    return { mood: 'thinking', ...MOOD_TEXT.thinking, message: 'Set up your budget to see insights.' }
  }
  if (daysElapsed < 3) {
    return { mood: 'thinking', ...MOOD_TEXT.thinking, message: 'Early days — check back in a bit.' }
  }

  const pctBudgetUsed = monthlyBudget > 0 ? currentMonthTotal / monthlyBudget : 0
  const dailyPaceSoFar = currentMonthTotal / daysElapsed
  const usualDailyPace = usualMonthlyAverage > 0 ? usualMonthlyAverage / daysInMonth : null
  const paceVsUsual = usualDailyPace ? dailyPaceSoFar / usualDailyPace : null

  if (pctBudgetUsed >= 1) {
    return { mood: 'tensed', ...MOOD_TEXT.tensed, message: "You've already used your full budget for this month." }
  }
  if (paceVsUsual !== null && paceVsUsual >= 1.25) {
    return {
      mood: 'tensed',
      ...MOOD_TEXT.tensed,
      message: `You're spending about ${Math.round((paceVsUsual - 1) * 100)}% faster than your usual pace.`,
    }
  }
  if (pctBudgetUsed >= 0.5 && monthFraction < 0.5) {
    return {
      mood: 'sad',
      ...MOOD_TEXT.sad,
      message: `You've used ${Math.round(pctBudgetUsed * 100)}% of your budget with over half the month left.`,
    }
  }
  if (pctBudgetUsed <= monthFraction * 0.85) {
    return { mood: 'happy', ...MOOD_TEXT.happy, message: "You're pacing comfortably under budget — keep it up!" }
  }

  return { mood: 'thinking', ...MOOD_TEXT.thinking, message: "You're roughly on pace — worth keeping an eye on." }
}