import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Home, LayoutDashboard, List, Plus, Camera, MessageCircle, LogOut } from 'lucide-react'
import { logOutUser } from '../features/auth/authSlice'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: List },
  { to: '/add-expense', label: 'Add Expense', icon: Plus },
  { to: '/scan-receipt', label: 'Scan Receipt', icon: Camera },
  { to: '/chat', label: 'Ask AI', icon: MessageCircle },
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await dispatch(logOutUser())
    navigate('/login')
  }

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 bg-slate-900 text-slate-200 min-h-screen sticky top-0">
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
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} strokeWidth={2} />
          Log Out
        </button>
      </div>
    </aside>
  )
}