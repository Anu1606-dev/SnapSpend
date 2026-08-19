import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../../services/firebase'

// createAsyncThunk handles the 3-stage lifecycle of an async action automatically:
// "pending" (in progress), "fulfilled" (success), "rejected" (failed).

export const signUpUser = createAsyncThunk(
  'auth/signUpUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return { uid: userCredential.user.uid, email: userCredential.user.email }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const logInUser = createAsyncThunk(
  'auth/logInUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return { uid: userCredential.user.uid, email: userCredential.user.email }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const logOutUser = createAsyncThunk('auth/logOutUser', async () => {
  await signOut(auth)
})

const initialState = {
  user: null,        // null = logged out, or { uid, email } = logged in
  authChecked: false, // becomes true once we've confirmed the login state (prevents a "flash of login page" on refresh)
  status: 'idle',     // 'idle' | 'loading' | 'failed'
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Called by our Firebase listener whenever login state changes
    setUser: (state, action) => {
      state.user = action.payload
      state.authChecked = true
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUpUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(logInUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(logInUser.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload
      })
      .addCase(logInUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(logOutUser.fulfilled, (state) => {
        state.user = null
      })
  },
})

export const { setUser, clearError } = authSlice.actions
export default authSlice.reducer