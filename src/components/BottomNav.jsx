import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, List, LayoutDashboard, MessageCircle, Plus, PenLine, Camera } from 'lucide-react'

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
              <PenLine size={20} className="text-slate-600" />
              <span className="text-xs font-medium text-slate-600">Manual</span>
            </button>
            <button
              onClick={() => goTo('/scan-receipt')}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-slate-50"
            >
              <Camera size={20} className="text-slate-600" />
              <span className="text-xs font-medium text-slate-600">Scan</span>
            </button>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 flex items-center px-2 pb-[env(safe-area-inset-bottom)]">
        <NavLink to="/" end className={linkClass}>
          <Home size={20} />
          Home
        </NavLink>
        <NavLink to="/expenses" className={linkClass}>
          <List size={20} />
          Expenses
        </NavLink>

        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={() => setShowActions((s) => !s)}
            className="w-14 h-14 rounded-full bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200"
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>
        </div>

        <NavLink to="/dashboard" className={linkClass}>
          <LayoutDashboard size={20} />
          Stats
        </NavLink>
        <NavLink to="/chat" className={linkClass}>
          <MessageCircle size={20} />
          Chat
        </NavLink>
      </nav>
    </>
  )
}