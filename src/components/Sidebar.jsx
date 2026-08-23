import { NavLink } from 'react-router-dom'
import { Home, LayoutDashboard, PiggyBank, List, Plus, Camera, MessageCircle } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/budget', label: 'Budget', icon: PiggyBank },
  { to: '/expenses', label: 'Expenses', icon: List },
  { to: '/add-expense', label: 'Add Expense', icon: Plus },
  { to: '/scan-receipt', label: 'Scan Receipt', icon: Camera },
  { to: '/chat', label: 'Ask AI', icon: MessageCircle },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 bg-slate-900 dark:bg-surface text-slate-200 min-h-screen sticky top-0">
      <div className="px-6 py-6">
        <span className="text-xl font-extrabold bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          SnapSpend
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white dark:bg-linear-to-r dark:from-sun/20 dark:to-flame/10 dark:text-sun'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 dark:hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} strokeWidth={2} className="transition-transform duration-200 group-hover:scale-110" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}