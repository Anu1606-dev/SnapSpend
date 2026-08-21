import { Link } from 'react-router-dom'
import { PiggyBank } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import ProfileMenu from './ProfileMenu'

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-100 dark:border-slate-800 px-4 md:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <span className="md:hidden text-lg font-extrabold bg-linear-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
          SnapSpend
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Link
          to="/budget"
          aria-label="Budget"
          className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <PiggyBank size={18} />
        </Link>
        <ProfileMenu />
      </div>
    </header>
  )
}