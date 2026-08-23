import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('snapspend-theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-cloud hover:bg-slate-100 dark:hover:bg-surface hover:scale-110 active:scale-95 transition-all duration-200"
    >
      {isDark ? <Moon size={18} className="text-electric" /> : <Sun size={18} className="text-amber-500" />}
    </button>
  )
}