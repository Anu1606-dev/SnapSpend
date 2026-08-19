import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function ProtectedRoute({ children }) {
  const { user, authChecked } = useSelector((state) => state.auth)

  // Still figuring out if someone's logged in — show nothing yet to avoid a flash
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}