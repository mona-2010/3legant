"use client"

import { createContext, useContext, useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { AppDispatch } from "@/store/store"
import {
  initAuth,
  setAuthUser,
  clearAuth,
  selectAuthUser,
  selectAuthRole,
  selectIsAuthLoading,
} from "@/store/authSlice"

type AuthContextType = {
  user: User | null
  session: null
  loading: boolean
  role: 'admin' | 'user' | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  role: null,
})

export const useAuth = () => useContext(AuthContext)

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const supabase = useMemo(() => createClient(), [])

  // Read auth state from Redux (not local React state)
  const user = useSelector(selectAuthUser)
  const role = useSelector(selectAuthRole)
  const loading = useSelector(selectIsAuthLoading)

  useEffect(() => {
    // 1. Initial auth bootstrap.
    //    initAuth reads session first to avoid an extra user fetch request.
    dispatch(initAuth())

    // 2. React to future auth events (login, logout, token refresh).
    //    KEY: Only dispatch clearAuth() on an explicit SIGNED_OUT event.
    //    We do NOT clear the user on TOKEN_REFRESHED or transient null sessions
    //    — this prevents the "briefly logged out" redirect bug caused by
    //    Supabase's refresh process firing onAuthStateChange with a null session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: import('@supabase/supabase-js').Session | null) => {
        if (event === 'SIGNED_OUT') {
          dispatch(clearAuth())
        } else if (session?.user) {
          // SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED — update user in Redux
          dispatch(setAuthUser({ user: session.user }))
        }
        // INITIAL_SESSION with null means not logged in → handled by initAuth above
      }
    )

    // 3. When the user returns to this tab, browsers may have throttled the
    //    Supabase auto-refresh timer. Dispatch initAuth() to rehydrate auth state.
    const handleVisibilityChange = () => {
      // Background refresh: Only if visible AND not already checking.
      if (document.visibilityState === 'visible' && !loading) {
        dispatch(initAuth())
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [dispatch, supabase])

  return (
    <AuthContext.Provider value={{ user, session: null, loading, role }}>
      {children}
    </AuthContext.Provider>
  )
}
