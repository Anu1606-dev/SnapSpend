import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../services/firebase'

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const snap = await getDoc(doc(db, 'profiles', userId))
      if (!snap.exists()) return null
      return snap.data()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const saveProfile = createAsyncThunk(
  'profile/saveProfile',
  async ({ userId, firstName, lastName, avatarColor }, { rejectWithValue }) => {
    try {
      const data = { firstName, lastName, avatarColor, updatedAt: serverTimestamp() }
      await setDoc(doc(db, 'profiles', userId), data, { merge: true })
      return { firstName, lastName, avatarColor }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  firstName: '',
  lastName: '',
  avatarColor: '',
  hasProfile: false,
  fetchStatus: 'idle',
  saveStatus: 'idle',
  error: null,
}

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.fetchStatus = 'loading'
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded'
        if (action.payload) {
          state.firstName = action.payload.firstName || ''
          state.lastName = action.payload.lastName || ''
          state.avatarColor = action.payload.avatarColor || ''
          state.hasProfile = true
        }
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.fetchStatus = 'failed'
        state.error = action.payload
      })
      .addCase(saveProfile.pending, (state) => {
        state.saveStatus = 'loading'
        state.error = null
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        state.firstName = action.payload.firstName
        state.lastName = action.payload.lastName
        state.avatarColor = action.payload.avatarColor
        state.hasProfile = true
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.error = action.payload
      })
  },
})

export const { clearProfileError } = profileSlice.actions
export default profileSlice.reducer