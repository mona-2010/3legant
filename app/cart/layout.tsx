"use client"

import { Header } from "@/components/dynamicComponents"
import Footer from "@/components/layout/Footer"
import StepIndicator from "@/components/layout/StepIndicator"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/store/store"
import { setCart, clearCart } from "@/store/cartSlice"
import { fetchCart } from "@/lib/cart/fetchCart"
import { toast } from "react-toastify"
import { useAuth } from "@/components/providers/AuthProvider"

export default function CartLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()

  const activeStep = pathname === "/cart/complete" ? 3 : pathname === "/cart/checkout" ? 2 : 1
  const pageHeading = pathname === "/cart/complete" ? "Complete" : pathname === "/cart/checkout" ? "Checkout" : "Cart"

  useEffect(() => {
    if (!loading && !user) {
      dispatch(clearCart())
      if (pathname !== "/sign-in") {
        toast.error("Please sign in to access your cart")
        router.replace("/sign-in")
      }
    }
  }, [dispatch, loading, pathname, router, user])

  useEffect(() => {
    const userId = user?.id
    if (!userId) return

    const loadCart = async () => {
      const items = await fetchCart(userId)
      dispatch(setCart(items))
    }

    void loadCart()
  }, [dispatch, user?.id])

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading...</p></div>
  }

  if (!user) return null

  return (
    <div>
      <Header />
      <div className="page-content-container">
        <h1 className="mt-5 md:mt-10 font-poppins text-center text-[30px] md:text-[36px] lg:text-[54px]">{pageHeading}</h1>
        <StepIndicator activeStep={activeStep} />
        {children}
      </div>
      <Footer />
    </div>
  )
}
