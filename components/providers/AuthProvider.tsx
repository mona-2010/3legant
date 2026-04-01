"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { User, Session } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
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
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<'admin' | 'user' | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let isMounted = true
    let authSubscription: { unsubscribe: () => void } | null = null

    const fetchRole = async (userId: string) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      return profile?.role as 'admin' | 'user' | null
    }

    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      if (!isMounted) return

      setSession(initialSession)
      setUser(initialSession?.user ?? null)

      if (initialSession?.user) {
        const userRole = await fetchRole(initialSession.user.id)
        if (isMounted) setRole(userRole)
      } else {
        setRole(null)
      }

      setLoading(false)

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: string, currentSession: Session | null) => {
          if (!isMounted) return
          setSession(currentSession)
          setUser(currentSession?.user ?? null)

          if (currentSession?.user) {
            const userRole = await fetchRole(currentSession.user.id)
            if (isMounted) setRole(userRole)
          } else {
            setRole(null)
          }

          setLoading(false)
        }
      )

      authSubscription = subscription
    }

    void initializeAuth()

    return () => {
      isMounted = false
      authSubscription?.unsubscribe()
    }
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, session, loading, role }}>
      {children}
    </AuthContext.Provider>
  )
}

