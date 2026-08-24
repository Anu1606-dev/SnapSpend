import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../services/firebase'

export const fetchBudget = createAsyncThunk(
  'budget/fetchBudget',
  async (userId, { rejectWithValue }) => {
    try {
      const snap = await getDoc(doc(db, 'budgets', userId))
      if (!snap.exists()) return null
      // Same fix as expenses — strip the non-serializable Timestamp.
      const data = snap.data()
      delete data.updatedAt
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const saveBudget = createAsyncThunk(
  'budget/saveBudget',
  async ({ userId, monthlyIncome, monthlyBudget }, { rejectWithValue }) => {
    try {
      const data = {
        monthlyIncome: Number(monthlyIncome),
        monthlyBudget: Number(monthlyBudget),
        updatedAt: serverTimestamp(),
      }
      await setDoc(doc(db, 'budgets', userId), data, { merge: true })
      return { monthlyIncome: Number(monthlyIncome), monthlyBudget: Number(monthlyBudget) }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  monthlyIncome: null,
  monthlyBudget: null,
  hasBudget: false,
  fetchStatus: 'idle',
  saveStatus: 'idle',
  error: null,
}

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    clearBudgetError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudget.pending, (state) => {
        state.fetchStatus = 'loading'
        state.error = null
      })
      .addCase(fetchBudget.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded'
        if (action.payload) {
          state.monthlyIncome = action.payload.monthlyIncome
          state.monthlyBudget = action.payload.monthlyBudget
          state.hasBudget = true
        } else {
          state.hasBudget = false
        }
      })
      .addCase(fetchBudget.rejected, (state, action) => {
        state.fetchStatus = 'failed'
        state.error = action.payload
      })
      .addCase(saveBudget.pending, (state) => {
        state.saveStatus = 'loading'
        state.error = null
      })
      .addCase(saveBudget.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        state.monthlyIncome = action.payload.monthlyIncome
        state.monthlyBudget = action.payload.monthlyBudget
        state.hasBudget = true
      })
      .addCase(saveBudget.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.error = action.payload
      })
  },
})

export const { clearBudgetError } = budgetSlice.actions
export default budgetSlice.reducer