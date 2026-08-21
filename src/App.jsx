import { Routes, Route } from 'react-router-dom'
import { useAuthListener } from './hooks/useAuthListener'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import HomePage from './pages/HomePage'
import AddExpensePage from './pages/AddExpensePage'
import ReceiptUploadPage from './pages/ReceiptUploadPage'
import ExpenseListPage from './pages/ExpenseListPage'
import DashboardPage from './pages/DashboardPage'
import ChatPage from './pages/ChatPage'
import BudgetPage from './pages/BudgetPage'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'

function App() {
  useAuthListener()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/add-expense" element={<AddExpensePage />} />
        <Route path="/scan-receipt" element={<ReceiptUploadPage />} />
        <Route path="/expenses" element={<ExpenseListPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Route>
    </Routes>
  )
}

export default App