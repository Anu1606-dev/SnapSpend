// Returns a date as 'YYYY-MM-DD' using the LOCAL timezone — never UTC.
// Avoids the classic bug where `.toISOString()` converts to UTC first,
// which rolls the date back by a day (and sometimes a whole month) for
// any timezone ahead of UTC, like IST.
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}