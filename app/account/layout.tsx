"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/dynamicComponents"
import Footer from "@/components/layout/Footer"
import AccountSidebar from "@/components/layout/AccountSideBar"
import { useAuth } from "@/components/providers/AuthProvider"
import ConfirmationModal from "@/components/common/ConfirmationModal"
import { LogOut } from "lucide-react"
import Breadcrumb from "@/components/BreadCrumb"

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false)

  const accountSegment = pathname?.split("/").filter(Boolean)[1] || ""
  const currentPage = accountSegment
    ? accountSegment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "Account"

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in")
    }
  }, [loading, router, user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading && !user) return <p className="text-center py-20">Loading...</p>
  if (!user) return null

  return (
    <div>
      <Header />
      <div className="page-content-container">
        <div className="block md:hidden mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px] mt-6">
          <Breadcrumb
            currentPage={currentPage}
            crumbs={currentPage !== "Account" ? [{ title: "Account", href: "/account" }] : []}
            showMobileBackOnly
            backHref={currentPage === "Account" ? "/" : "/account"}
          />
        </div>
        <h1 className="text-center font-poppins text-[30px] md:text-[36px] lg:text-[54px] font-[500] my-[20px] md:my-[40px]">My Account</h1>
        <AccountSidebar user={user} onLogout={() => setIsSignOutModalOpen(true)}>
          {children}
        </AccountSidebar>
      </div>
      <Footer />
      
      <ConfirmationModal 
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleLogout}
        title="Log Out"
        message="Are you sure you want to sign out? You will need to sign in again to access your account and orders."
        confirmText="Log Out"
        icon={LogOut}
        variant="danger"
      />
    </div>
  )
}
