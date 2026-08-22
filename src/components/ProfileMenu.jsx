import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { logOutUser } from '../features/auth/authSlice'

export default function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { firstName, avatarColor } = useSelector((state) => state.profile)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await dispatch(logOutUser())
    navigate('/login')
  }

  const initial = firstName ? firstName.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || '?')

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-bg-card transition-colors"
      >
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
          style={{ backgroundColor: avatarColor || '#64748B' }}
        >
          {initial}
        </span>
        <ChevronDown size={14} className={`text-slate-400 dark:text-mist transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-bg-card rounded-xl shadow-lg border border-slate-100 dark:border-line overflow-hidden animate-fade-in-up z-50">
          <button
            onClick={() => { setOpen(false); navigate('/profile') }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 dark:text-fog hover:bg-slate-50 dark:hover:bg-bg-inset transition-colors"
          >
            <User size={16} />
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-coral hover:bg-red-50 dark:hover:bg-coral/10 transition-colors border-t border-slate-100 dark:border-line"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}