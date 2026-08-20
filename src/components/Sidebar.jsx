import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logOutUser } from '../features/auth/authSlice'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/expenses', label: 'Expenses', icon: '📋' },
  { to: '/add-expense', label: 'Add Expense', icon: '➕' },
  { to: '/scan-receipt', label: 'Scan Receipt', icon: '📷' },
  { to: '/chat', label: 'Ask AI', icon: '💬' },
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
        <span className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          SnapSpend
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
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
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-red-400 transition-colors"
        >
          <span className="text-base">🚪</span>
          Log Out
        </button>
      </div>
    </aside>
  )
}