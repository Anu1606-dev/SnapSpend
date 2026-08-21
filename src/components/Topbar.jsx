import ThemeToggle from './ThemeToggle'
import ProfileMenu from './ProfileMenu'

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-100 dark:border-slate-800 px-4 md:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <span className="md:hidden text-lg font-extrabold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
          SnapSpend
        </span>
      </div>

      <ProfileMenu />
    </header>
  )
}