import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { logOutUser } from '../features/auth/authSlice'

export default function HomePage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to SnapSpend</h1>
        <p className="text-gray-600 mb-6">Logged in as {user?.email}</p>

        <div className="flex gap-3">
          <Link
            to="/add-expense"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + Add Expense
          </Link>
          <button
            onClick={() => dispatch(logOutUser())}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}