import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import expensesReducer from '../features/expenses/expensesSlice'
import budgetReducer from '../features/budget/budgetSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    expenses: expensesReducer,
    budget: budgetReducer,
  },
})