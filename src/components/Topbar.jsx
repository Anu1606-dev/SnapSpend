import { Link } from 'react-router-dom'
import { PiggyBank } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import ProfileMenu from './ProfileMenu'

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-bg-deep/80 backdrop-blur border-b border-slate-100 dark:border-line px-4 md:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <span className="md:hidden text-lg font-extrabold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
          SnapSpend
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Link
          to="/budget"
          aria-label="Budget"
          className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-fog hover:bg-slate-100 dark:hover:bg-bg-card hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <PiggyBank size={18} />
        </Link>
        <ProfileMenu />
      </div>
    </header>
  )
}