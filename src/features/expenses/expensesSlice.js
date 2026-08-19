import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../services/firebase'

export const addExpense = createAsyncThunk(
  'expenses/addExpense',
  async ({ userId, amount, merchant, category, date, note }, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(collection(db, 'expenses'), {
        userId,
        amount: Number(amount),
        merchant,
        category,
        date,          // stored as 'YYYY-MM-DD' string
        note: note || '',
        createdAt: serverTimestamp(),
      })
      return {
        id: docRef.id,
        userId,
        amount: Number(amount),
        merchant,
        category,
        date,
        note: note || '',
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearExpenseError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addExpense.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload) // newest expense goes to the front
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { clearExpenseError } = expensesSlice.actions
export default expensesSlice.reducer