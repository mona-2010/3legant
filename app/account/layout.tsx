"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/dynamicComponents"
import Footer from "@/components/layout/Footer"
import AccountSidebar from "@/components/layout/AccountSideBar"
import { useAuth } from "@/components/providers/AuthProvider"

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in")
    }
  }, [loading, router, user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) return <p className="text-center py-20">Loading...</p>
  if (!user) return null

  return (
    <div>
      <Header />
      <h1 className="text-center font-poppins text-[30px] md:text-[36px] lg:text-[54px] font-[500] my-[40px]">My Account</h1>
      <AccountSidebar user={user} onLogout={handleLogout}>
        {children}
      </AccountSidebar>
      <Footer />
    </div>
  )
}
