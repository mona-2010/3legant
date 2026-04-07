"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { verifyAdmin } from "@/lib/actions/admin"
import {
  LayoutDashboard,
  FileText,
  Package,
  ShoppingCart,
  Ticket,
  CreditCard,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  Settings,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "react-toastify"
import ConfirmationModal from "@/components/common/ConfirmationModal"

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Blogs", href: "/admin/blog", icon: FileText },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "Contact", href: "/admin/contact", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false)

  const pageTitle = navItems.find((item) => item.href === pathname)?.label || "Admin"

  useEffect(() => {
    verifyAdmin().then(({ isAdmin, isAuthenticated }) => {
      if (!isAuthenticated) {
        router.replace("/sign-in")
      } else if (!isAdmin) {
        toast.error("Only admins are allowed to access this page.")
        router.replace("/")
      } else {
        setAuthorized(true)
      }
      setLoading(false)
    })
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/sign-in")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-slate-900/95 border border-slate-700 rounded-xl shadow-xl"
        >
          <Menu size={20} />
        </button>
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-black border-r border-slate-800 transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex flex-col">
            <p className="hidden md:block text-[11px] uppercase tracking-[0.24em] text-slate-400">Control Center</p>
            <h1 className="text-2xl text-white font-poppins font-semibold mt-1">3legant Admin</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                  ? "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
              >
                <item.icon size={18} className={isActive ? "text-emerald-300" : "text-slate-400 group-hover:text-slate-200"} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-black-950/80 backdrop-blur-sm">
          <button
            onClick={() => setIsSignOutModalOpen(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 w-full transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 mt-1 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Store
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/70 z-30 lg:hidden"
        />
      )}

      <main className="flex-1 overflow-auto bg-white text-slate-900">
        <div className="sticky top-0 z-20 border-b border-slate-200/70 backdrop-blur-xl bg-white/70">
        </div>
        <div className="px-6 lg:px-10 py-7 md:py-8">{children}</div>
      </main>

      <ConfirmationModal 
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out? You will need to sign in again to access the admin dashboard."
        confirmText="Log Out"
        icon={LogOut}
        variant="danger"
      />
    </div>
  )
}
