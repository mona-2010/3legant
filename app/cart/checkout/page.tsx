"use client"

import CheckoutDetail from "@/components/layout/CheckoutDetail"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/store/store"
import {
  increaseQty,
  decreaseQty,
  removeFromCart,
  clearCart,
  removeCoupon,
  setLastOrder
} from "@/store/cartSlice"
import { createOrder } from "@/lib/actions/orders"
import { FormData } from "@/components/forms/CheckOutForm"
import { toast } from "react-toastify"
import { updateCartItemQuantity, removeCartItem } from "@/lib/cart/mutations"
import { calculateShippingCost } from "@/lib/shipping"
import { calculateDiscountAmount } from "@/lib/coupons"
import { OrderUserInfo } from "@/types"
import { useCouponSync } from "@/lib/hooks"

export default function CheckoutPage() {
  const buildUserInfo = (formData: FormData): OrderUserInfo => ({
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    shipping: {
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone,
      street_address: formData.street,
      city: formData.city,
      state: formData.state,
      zip_code: String(formData.zipCode || ""),
      country: formData.country,
    },
    ...(formData.billingStreet
      ? {
        billing: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          street_address: formData.billingStreet,
          city: formData.billingCity || "",
          state: formData.billingState || "",
          zip_code: formData.billingZipCode || "",
          country: formData.billingCountry || "",
        },
      }
      : {}),
  })

  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const cartItems = useSelector((state: RootState) => state.cart.items)
  const shippingMethod = useSelector((state: RootState) => state.cart.shippingMethod)
  const appliedCoupon = useSelector((state: RootState) => state.cart.appliedCoupon)

  const [orderError, setOrderError] = useState<string | null>(null)

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
    const params = new URLSearchParams(window.location.search)
    const paymentIntentId = params.get("payment_intent")
    const redirectStatus = params.get("redirect_status")

    if (!paymentIntentId || !redirectStatus) return

    window.history.replaceState({}, document.title, window.location.pathname)

    if (redirectStatus !== "succeeded") {
      toast.error(
        redirectStatus === "failed"
          ? "PayPal payment failed. Please try again."
          : "PayPal payment was cancelled."
      )
      return
    }

    const savedDataStr = sessionStorage.getItem("paypal_checkout_data")
    if (!savedDataStr) {
      toast.error("Session expired. Please complete your order again.")
      return
    }

    sessionStorage.removeItem("paypal_checkout_data")
    const session = JSON.parse(savedDataStr)

      ; (async () => {
        const { data, error } = await createOrder({
          user_info: buildUserInfo(session.formData),
          payment_method: "paypal",
          stripe_payment_intent_id: paymentIntentId,
          initial_payment_status: "succeeded",
          shipping_method: session.shippingMethod,
          subtotal: session.subtotal,
          shipping_cost: session.shippingCost,
          discount: session.discount,
          total_price: session.total,
          coupon_id: session.couponId,
          items: session.cartItems.map((item: any) => ({
            product_id: item.product_id || item.id,
            quantity: item.quantity,
            product_price: item.price,
            product_title: item.name,
            product_image: item.image,
            product_color: item.color,
          })),
        })

        if (error) {
          toast.error(error)
          setOrderError(error)
          return
        }

        dispatch(setLastOrder({
          order: { ...data!, total_price: session.total },
          items: session.cartItems.map((item: any, i: number) => ({
            id: `temp-${i}`,
            order_id: data!.id,
            product_id: item.product_id || item.id,
            product_title: item.name,
            product_price: item.price,
            product_image: item.image,
            product_color: item.color,
            quantity: item.quantity,
            created_at: new Date().toISOString(),
          })),
        }))
        dispatch(clearCart())
        dispatch(removeCoupon())
        toast.success("Order placed successfully!")
        router.push("/cart/complete")
      })()
  }, [])

  const updateQuantity = async (id: string, type: "inc" | "dec") => {
    const item = cartItems.find(i => i.id === id)
    if (!item) return

    if (type === "dec" && item.quantity <= 1) {
      dispatch(removeFromCart(id))
      await removeCartItem(id)
      return
    }

    const newQty = type === "inc" ? item.quantity + 1 : item.quantity - 1
    if (type === "inc" && typeof item.stock === "number" && newQty > item.stock) return

    type === "inc" ? dispatch(increaseQty(id)) : dispatch(decreaseQty(id))
    void updateCartItemQuantity(id, newQty)
  }

  const removeItem = async (id: string) => {
    await removeCartItem(id)
    dispatch(removeFromCart(id))
  }

  const handlePlaceOrder = async (formData: FormData) => {
    setOrderError(null)

    const { data, error } = await createOrder({
      user_info: buildUserInfo(formData),
      payment_method: formData.payment === "paypal" ? "paypal" : "card",
      stripe_payment_intent_id: formData.stripePaymentIntentId,
      initial_payment_status: formData.stripePaymentIntentId ? "succeeded" : "pending",
      shipping_method: shippingMethod,
      subtotal,
      shipping_cost: shippingCost,
      discount,
      total_price: total,
      coupon_id: appliedCoupon?.coupon.id,
      items: cartItems.map(item => ({
        product_id: item.product_id || item.id,
        quantity: item.quantity,
        product_price: item.price,
        product_title: item.name,
        product_image: item.image,
        product_color: item.color,
      })),
    })

    if (error) {
      setOrderError(error)
      toast.error(error)
      return
    }

    dispatch(setLastOrder({
      order: { ...data!, total_price: total },
      items: cartItems.map((item, i) => ({
        id: `temp-${i}`,
        order_id: data!.id,
        product_id: item.product_id || item.id,
        product_title: item.name,
        product_price: item.price,
        product_image: item.image,
        product_color: item.color,
        quantity: item.quantity,
        created_at: new Date().toISOString(),
      }))
    }))
    dispatch(clearCart())
    dispatch(removeCoupon())
    toast.success("Order placed successfully!")
    router.push("/cart/complete")
  }

  return (
    <>
      {orderError && (
        <p className="text-red-500 text-center my-4">{orderError}</p>
      )}
      <CheckoutDetail
        cartItems={cartItems}
        subtotal={subtotal}
        shippingCost={shippingCost}
        shippingMethod={shippingMethod}
        discount={discount}
        total={total}
        isCartEmpty={cartItems.length === 0}
        appliedCouponId={appliedCoupon?.coupon.id}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
      />
    </>
  )
}
