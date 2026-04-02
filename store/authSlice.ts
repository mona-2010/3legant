import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { User } from "@supabase/supabase-js"
import type { RootState } from "./store"

type AuthState = {
  user: User | null
  role: 'admin' | 'user' | null
  status: 'loading' | 'ready'
}

const initialState: AuthState = {
  user: null,
  role: null,
  status: 'loading',
}

// getUser() is ALWAYS server-verified — it hits the Supabase API and
// automatically refreshes an expired access token using the refresh token.
// Unlike getSession() which just reads (possibly stale) localStorage.
export const initAuth = createAsyncThunk<
  { user: User | null; role: 'admin' | 'user' | null },
  void,
  { state: RootState }
>(
  'auth/init',
  async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { user: null, role: null }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return {
      user,
      role: (profile?.role as 'admin' | 'user') ?? 'user',
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<{ user: User | null; role?: 'admin' | 'user' | null }>) => {
      state.user = action.payload.user
      if (action.payload.role !== undefined) {
        state.role = action.payload.role
      }
      state.status = 'ready'
    },
    clearAuth: (state) => {
      state.user = null
      state.role = null
      state.status = 'ready'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initAuth.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.role = action.payload.role
        state.status = 'ready'
      })
      .addCase(initAuth.rejected, (state) => {
        // Don't clear user on failure — network errors shouldn't log the user out
        state.status = 'ready'
      })
  },
})

export const { setAuthUser, clearAuth } = authSlice.actions

export const selectAuthUser = (state: RootState) => state.auth.user
export const selectAuthRole = (state: RootState) => state.auth.role
export const selectIsAuthLoading = (state: RootState) => state.auth.status === 'loading'

export default authSlice.reducer
