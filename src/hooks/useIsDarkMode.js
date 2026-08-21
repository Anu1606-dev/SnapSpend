import { useState, useEffect } from 'react'

// Recharts (used on the Dashboard) renders raw SVG with hardcoded hex
// colors — CSS dark: classes can't reach inside it. This hook lets any
// component react in JavaScript whenever the theme toggles, by watching
// for the .dark class appearing/disappearing on <html>.
export function useIsDarkMode() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return isDark
}