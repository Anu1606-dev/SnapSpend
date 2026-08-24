import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../services/firebase'

export const addExpense = createAsyncThunk(
  'expenses/addExpense',
  async ({ userId, amount, merchant, category, date, note, paymentMethod, location }, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(collection(db, 'expenses'), {
        userId,
        amount: Number(amount),
        merchant,
        category,
        date,
        note: note || '',
        paymentMethod: paymentMethod || '',
        location: location || '',
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
        paymentMethod: paymentMethod || '',
        location: location || '',
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (userId, { rejectWithValue }) => {
    try {
      const q = query(collection(db, 'expenses'), where('userId', '==', userId))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((docSnap) => {
        // Firestore's createdAt comes back as a Timestamp object, not a
        // plain serializable value. We never display it anywhere in the
        // UI, so we simply leave it out of what goes into Redux.
        const data = docSnap.data()
        delete data.createdAt
        return { id: docSnap.id, ...data }
      })
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, amount, merchant, category, date, note, paymentMethod, location }, { rejectWithValue }) => {
    try {
      const changes = {
        amount: Number(amount),
        merchant,
        category,
        date,
        note: note || '',
        paymentMethod: paymentMethod || '',
        location: location || '',
      }
      await updateDoc(doc(db, 'expenses', id), changes)
      return { id, ...changes }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'expenses', id))
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  items: [],
  status: 'idle',
  error: null,
  fetchStatus: 'idle',
  fetchError: null,
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
        state.items.unshift(action.payload)
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(fetchExpenses.pending, (state) => {
        state.fetchStatus = 'loading'
        state.fetchError = null
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.fetchStatus = 'failed'
        state.fetchError = action.payload
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload }
        }
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
  },
})

export const { clearExpenseError } = expensesSlice.actions
export default expensesSlice.reducer