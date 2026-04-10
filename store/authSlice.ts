import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { User } from "@supabase/supabase-js"
import type { RootState } from "./store"

type AuthState = {
  user: User | null
  role: 'admin' | 'user' | null
  status: 'loading' | 'ready'
  profile: {
    full_name: string | null
    avatar_url: string | null
    cachedAt: number | null // timestamp in ms, cached for 10 minutes
  }
}

const initialState: AuthState = {
  user: null,
  role: null,
  status: 'loading',
  profile: {
    full_name: null,
    avatar_url: null,
    cachedAt: null,
  },
}

// Use session-first bootstrap to avoid an extra /auth/v1/user network request
// on every initial page load. Token refresh/user revalidation still happens
// through auth state changes and visibility-triggered refresh logic.
export const initAuth = createAsyncThunk<
  { user: User | null; role: 'admin' | 'user' | null },
  void,
  { state: RootState }
>(
  'auth/init',
  async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user ?? null
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

// Fetch user profile with caching: only fetches if cache is missing or stale (>10 min)
const PROFILE_CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes
export const fetchUserProfile = createAsyncThunk<
  { full_name: string | null; avatar_url: string | null },
  void,
  { state: RootState }
>(
  'auth/fetchProfile',
  async (_, { getState }) => {
    const state = getState() as RootState
    const user = state.auth.user
    if (!user) return { full_name: null, avatar_url: null }

    // Check if cache is still valid
    const now = Date.now()
    if (state.auth.profile.cachedAt && now - state.auth.profile.cachedAt < PROFILE_CACHE_TTL_MS) {
      // Return cached data without fetching
      return {
        full_name: state.auth.profile.full_name,
        avatar_url: state.auth.profile.avatar_url,
      }
    }

    // Cache is stale or missing, fetch fresh data
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return { full_name: null, avatar_url: null }
    }

    return {
      full_name: profile?.full_name ?? null,
      avatar_url: profile?.avatar_url ?? null,
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
    setUserProfile: (state, action: PayloadAction<{ full_name: string | null; avatar_url: string | null }>) => {
      state.profile.full_name = action.payload.full_name
      state.profile.avatar_url = action.payload.avatar_url
      state.profile.cachedAt = Date.now()
    },
    clearAuth: (state) => {
      state.user = null
      state.role = null
      state.profile = { full_name: null, avatar_url: null, cachedAt: null }
      state.status = 'ready'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initAuth.pending, (state) => {
        if (!state.user) {
          state.status = 'loading'
        }
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.role = action.payload.role
        state.status = 'ready'
      })
      .addCase(initAuth.rejected, (state) => {
        state.status = 'ready'
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profile.full_name = action.payload.full_name
        state.profile.avatar_url = action.payload.avatar_url
        state.profile.cachedAt = Date.now()
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        // Keep previous cache on error
      })
  },
})

export const { setAuthUser, clearAuth, setUserProfile } = authSlice.actions

export const selectAuthUser = (state: RootState) => state.auth.user
export const selectAuthRole = (state: RootState) => state.auth.role
export const selectIsAuthLoading = (state: RootState) => state.auth.status === 'loading'
export const selectUserProfile = (state: RootState) => state.auth.profile

export default authSlice.reducer
