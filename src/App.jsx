import { Routes, Route } from 'react-router-dom'
import { useAuthListener } from './hooks/useAuthListener'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import HomePage from './pages/HomePage'
import AddExpensePage from './pages/AddExpensePage'
import ReceiptUploadPage from './pages/ReceiptUploadPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  useAuthListener()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-expense"
        element={
          <ProtectedRoute>
            <AddExpensePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scan-receipt"
        element={
          <ProtectedRoute>
            <ReceiptUploadPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App