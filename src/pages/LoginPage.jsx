import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logInUser, clearError } from '../features/auth/authSlice'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { status, error, user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearError())
    await dispatch(logInUser({ email, password }))
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 dark:bg-surface flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-electric/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-violet/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-mint/10 rounded-full blur-3xl" />

        <span className="relative text-2xl font-extrabold bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          SnapSpend
        </span>

        <div className="relative">
          <p className="text-3xl font-bold text-white leading-snug mb-4">
            Know exactly where<br />your money goes.
          </p>
          <p className="text-cloud text-sm max-w-sm">
            Snap a receipt, let AI handle the rest. Track spending, spot trends, and just ask when you need answers.
          </p>
        </div>

        <p className="relative text-xs text-smoke">© 2026 SnapSpend</p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-void px-6 py-12 transition-colors duration-200">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <span className="text-2xl font-extrabold bg-linear-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
              SnapSpend
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 dark:text-cloud mb-8">Log in to keep track of your spending.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-cloud mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-edge dark:bg-surface dark:text-white dark:placeholder-smoke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-cloud mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-edge dark:bg-surface dark:text-white dark:placeholder-smoke rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-rose bg-red-50 dark:bg-rose/10 border border-red-100 dark:border-rose/20 px-3 py-2 rounded-xl">
                {error}
              </p>
            )}

            <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-2.5 text-sm">
              {status === 'loading' ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-slate-500 dark:text-cloud mt-6 text-center">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 dark:text-electric font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}