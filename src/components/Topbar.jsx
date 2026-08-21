import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { LogOut } from 'lucide-react'
import { logOutUser } from '../features/auth/authSlice'

export default function Topbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await dispatch(logOutUser())
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100 px-4 md:px-8 py-3 flex items-center">
      <span className="md:hidden text-lg font-extrabold bg-linear-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
        SnapSpend
      </span>

      <button
        onClick={handleLogout}
        className="ml-auto flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 hover:-translate-y-0.5 px-3 py-1.5 rounded-full transition-all duration-200 shrink-0"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">Log Out</span>
      </button>
    </header>
  )
}