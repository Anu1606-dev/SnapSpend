import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { fetchProfile, saveProfile, clearProfileError } from '../features/profile/profileSlice'
import { AVATAR_COLORS } from '../utils/avatarColors'

export default function ProfilePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { firstName, lastName, avatarColor, fetchStatus, saveStatus, error } = useSelector((state) => state.profile)

  const [firstNameInput, setFirstNameInput] = useState(null)
  const [lastNameInput, setLastNameInput] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (user) dispatch(fetchProfile(user.uid))
  }, [user, dispatch])

  const resolvedFirstName = firstNameInput ?? firstName ?? ''
  const resolvedLastName = lastNameInput ?? lastName ?? ''
  const resolvedColor = selectedColor ?? avatarColor ?? AVATAR_COLORS[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearProfileError())
    setSuccessMessage('')
    const result = await dispatch(
      saveProfile({
        userId: user.uid,
        firstName: resolvedFirstName,
        lastName: resolvedLastName,
        avatarColor: resolvedColor,
      })
    )
    if (saveProfile.fulfilled.match(result)) {
      setSuccessMessage('Profile updated!')
    }
  }

  const initial = resolvedFirstName ? resolvedFirstName.charAt(0).toUpperCase() : '?'

  return (
    <div className="max-w-xl mx-auto p-6 md:p-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-fog hover:text-slate-700 dark:hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Your Profile</h1>
        <p className="text-slate-500 dark:text-fog text-sm mt-1">This is what shows up around SnapSpend.</p>
      </div>

      {fetchStatus === 'loading' ? (
        <p className="text-center text-slate-400 text-sm py-16">Loading...</p>
      ) : (
        <div className="bg-white dark:bg-bg-card rounded-2xl shadow-sm p-6 md:p-8">
          <div className="flex justify-center mb-6">
            <span
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg transition-colors duration-300"
              style={{ backgroundColor: resolvedColor }}
            >
              {initial}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-fog mb-1.5">First Name</label>
                <input
                  type="text"
                  value={resolvedFirstName}
                  onChange={(e) => setFirstNameInput(e.target.value)}
                  required
                  placeholder="e.g. Priya"
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-line dark:bg-bg-inset dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-fog mb-1.5">Surname</label>
                <input
                  type="text"
                  value={resolvedLastName}
                  onChange={(e) => setLastNameInput(e.target.value)}
                  placeholder="e.g. Sharma"
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-line dark:bg-bg-inset dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-fog mb-2">Choose an Avatar Color</label>
              <div className="flex flex-wrap gap-3">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-150 hover:scale-110"
                    style={{ backgroundColor: color }}
                    aria-label={`Choose avatar color ${color}`}
                  >
                    {resolvedColor === color && <Check size={16} className="text-white" />}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 dark:text-mist mt-2">
                Custom photo avatars are coming soon — for now, pick a color that's you.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-coral bg-red-50 dark:bg-coral/10 border border-red-100 dark:border-coral/20 px-3 py-2 rounded-xl">
                {error}
              </p>
            )}
            {successMessage && (
              <p className="text-sm text-emerald-700 dark:text-teal bg-emerald-50 dark:bg-teal-deep border border-emerald-100 dark:border-teal/20 px-3 py-2 rounded-xl">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={saveStatus === 'loading'}
              className="w-full py-2.5 rounded-full font-semibold text-sm text-white bg-linear-to-r from-blue-500 via-violet-500 to-pink-500 dark:from-azure dark:via-azure-hover dark:to-teal shadow-sm shadow-violet-500/30 dark:shadow-azure/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/40 dark:hover:shadow-azure/40 active:translate-y-0 active:scale-[0.98] disabled:opacity-50"
            >
              {saveStatus === 'loading' ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}