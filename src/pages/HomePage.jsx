import { useDispatch, useSelector } from 'react-redux'
import { logOutUser } from '../features/auth/authSlice'

export default function HomePage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to SnapSpend</h1>
        <p className="text-gray-600 mb-6">Logged in as {user?.email}</p>
        <button
          onClick={() => dispatch(logOutUser())}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Log Out
        </button>
      </div>
    </div>
  )
}