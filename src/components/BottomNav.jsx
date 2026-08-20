import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

export default function BottomNav() {
  const [showActions, setShowActions] = useState(false)
  const navigate = useNavigate()

  const linkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs font-medium ${
      isActive ? 'text-blue-600' : 'text-slate-400'
    }`

  const goTo = (path) => {
    setShowActions(false)
    navigate(path)
  }

  return (
    <>
      {showActions && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowActions(false)}>
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-3 bg-white rounded-2xl shadow-lg p-2 border border-slate-100">
            <button
              onClick={() => goTo('/add-expense')}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-slate-50"
            >
              <span className="text-lg">✍️</span>
              <span className="text-xs font-medium text-slate-600">Manual</span>
            </button>
            <button
              onClick={() => goTo('/scan-receipt')}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-slate-50"
            >
              <span className="text-lg">📷</span>
              <span className="text-xs font-medium text-slate-600">Scan</span>
            </button>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 flex items-center px-2 pb-[env(safe-area-inset-bottom)]">
        <NavLink to="/" end className={linkClass}>
          <span className="text-lg">🏠</span>
          Home
        </NavLink>
        <NavLink to="/expenses" className={linkClass}>
          <span className="text-lg">📋</span>
          Expenses
        </NavLink>

        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={() => setShowActions((s) => !s)}
            className="w-14 h-14 rounded-full bg-amber-500 text-white text-2xl shadow-lg flex items-center justify-center hover:bg-amber-600 transition-colors"
          >
            +
          </button>
        </div>

        <NavLink to="/dashboard" className={linkClass}>
          <span className="text-lg">📊</span>
          Stats
        </NavLink>
        <NavLink to="/chat" className={linkClass}>
          <span className="text-lg">💬</span>
          Chat
        </NavLink>
      </nav>
    </>
  )
}