"use client"

import ShoppingCart from "@/components/layout/ShoppingCart"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/store/store"
import { increaseQty, decreaseQty, removeFromCart, removeCoupon } from "@/store/cartSlice"
import { removeCartItem, updateCartItemQuantity } from "@/lib/cart/mutations"
import { calculateShippingCost } from "@/lib/shipping"
import { calculateDiscountAmount } from "@/lib/coupons"
import { useEffect } from "react"
import { toast } from "react-toastify"
import { useCouponSync } from "@/lib/hooks"

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const quantityFlushTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const pendingQtyByItemRef = useRef<Record<string, number>>({})

  const cartItems = useSelector((state: RootState) => state.cart.items)
  const shippingMethod = useSelector((state: RootState) => state.cart.shippingMethod)
  const appliedCoupon = useSelector((state: RootState) => state.cart.appliedCoupon)

  const updateQuantity = async (id: string, type: "inc" | "dec") => {
    const item = cartItems.find(i => i.id === id)
    if (!item) return

    if (type === "dec" && item.quantity <= 1) return

    const newQty = type === "inc" ? item.quantity + 1 : item.quantity - 1

    type === "inc" ? dispatch(increaseQty(id)) : dispatch(decreaseQty(id))

    pendingQtyByItemRef.current[id] = newQty
    if (quantityFlushTimersRef.current[id]) {
      clearTimeout(quantityFlushTimersRef.current[id])
    }

    quantityFlushTimersRef.current[id] = setTimeout(async () => {
      const finalQty = pendingQtyByItemRef.current[id]
      if (typeof finalQty === "number") {
        await updateCartItemQuantity(id, finalQty)
      }
      delete pendingQtyByItemRef.current[id]
      delete quantityFlushTimersRef.current[id]
    }, 250)
  }

  const removeItem = async (id: string) => {
    await removeCartItem(id)
    dispatch(removeFromCart(id))
  }

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shippingCost = calculateShippingCost(shippingMethod, subtotal)
  const discount = appliedCoupon ? calculateDiscountAmount(appliedCoupon.coupon, subtotal) : 0
  const total = subtotal + shippingCost - discount

  // Real-time coupon synchronization with subtotal-aware validation
  useCouponSync({
    enabled: !!appliedCoupon,
    subtotal,
    showNotification: true,
    debug: false
  })

  useEffect(() => {
    if (!appliedCoupon) return
    const minRequired = appliedCoupon.coupon.min_purchase_amount
    if (typeof minRequired === "number" && subtotal < minRequired) {
      dispatch(removeCoupon())
      toast.warning("Coupon removed: minimum order amount not met")
    }
  }, [appliedCoupon, subtotal, dispatch])

  useEffect(() => {
    return () => {
      Object.values(quantityFlushTimersRef.current).forEach((timer) => clearTimeout(timer))

      for (const [id, qty] of Object.entries(pendingQtyByItemRef.current)) {
        void updateCartItemQuantity(id, qty)
      }

      quantityFlushTimersRef.current = {}
      pendingQtyByItemRef.current = {}
    }
  }, [])

  return (
    <ShoppingCart
      cartItems={cartItems}
      updateQuantity={updateQuantity}
      subtotal={subtotal}
      shippingCost={shippingCost}
      discount={discount}
      total={total}
      onCheckout={() => {
        if (cartItems.length === 0) return
        router.push("/cart/checkout")
      }}
      removeItem={removeItem}
    />
  )
}