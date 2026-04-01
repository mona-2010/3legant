"use client"

import { useEffect, useRef, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/store/store"
import { removeCoupon } from "@/store/cartSlice"
import { createClient } from "@/lib/supabase/client"
import { toast } from "react-toastify"
import { Coupon } from "@/types"
import { calculateDiscountAmount } from "@/lib/coupons"

interface UseCouponSyncOptions {
  enabled?: boolean
  subtotal?: number
  showNotification?: boolean
  debug?: boolean
}

export function useCouponSync(options: UseCouponSyncOptions = {}) {
  const {
    enabled = true,
    subtotal = 0,
    showNotification = true,
    debug = false
  } = options

  const dispatch = useDispatch<AppDispatch>()
  const appliedCoupon = useSelector((state: RootState) => state.cart.appliedCoupon)

  const subscriptionRef = useRef<any>(null)
  const lastValidStateRef = useRef<{ isValid: boolean; signature: string } | null>(null)

  const syncCouponForSubtotal = useCallback(() => {
    if (!appliedCoupon?.coupon?.id || !enabled) return

    const typedCoupon = appliedCoupon.coupon as Coupon
    const isActive = typedCoupon.is_active
    const isNotExpired = !typedCoupon.valid_until || new Date(typedCoupon.valid_until) > new Date()
    const meetsMinOrder = !typedCoupon.min_purchase_amount || subtotal >= typedCoupon.min_purchase_amount
    const hasRemainingUsage = !typedCoupon.max_uses || (typedCoupon.current_uses ?? 0) < typedCoupon.max_uses
    const isNowValid = isActive && isNotExpired && meetsMinOrder && hasRemainingUsage
    
    // Check if the discount amount has changed based on the new subtotal
    const currentDiscount = calculateDiscountAmount(typedCoupon, subtotal)
    
    const signature = JSON.stringify({
      source: "subtotal",
      isNowValid,
      id: typedCoupon.id,
      subtotal,
      discount: currentDiscount
    })

    const stateChanged = !lastValidStateRef.current || lastValidStateRef.current.signature !== signature
    if (!isNowValid && stateChanged) {
      lastValidStateRef.current = { isValid: false, signature }
      dispatch(removeCoupon())
      if (showNotification) {
        const reason = !isActive
          ? "deactivated"
          : !isNotExpired
            ? "expired"
            : !meetsMinOrder
              ? "below minimum order"
              : "usage limit reached"
        toast.warning(`Coupon has been ${reason}`)
      }
      return
    }

    if (stateChanged && isNowValid) {
      lastValidStateRef.current = { isValid: true, signature }
    }
  }, [appliedCoupon, enabled, subtotal, dispatch, showNotification])

  const invalidateFromRealtimeChange = useCallback((payload: any) => {
    if (!appliedCoupon?.coupon?.id || !enabled) return

    const row = payload?.new ?? payload?.old ?? {}
    if (!row?.id || row.id !== appliedCoupon.coupon.id) return

    if (payload?.eventType === "DELETE") {
      const signature = `${appliedCoupon.coupon.id}:deleted`
      const stateChanged = !lastValidStateRef.current || lastValidStateRef.current.signature !== signature
      if (stateChanged) {
        lastValidStateRef.current = { isValid: false, signature }
        dispatch(removeCoupon())
        if (showNotification) {
          toast.warning("Applied coupon is no longer available")
        }
      }
      return
    }

    const typedRow = row as Coupon
    const isActive = typedRow.is_active
    const isNotExpired = !typedRow.valid_until || new Date(typedRow.valid_until) > new Date()
    const meetsMinOrder = !typedRow.min_purchase_amount || subtotal >= typedRow.min_purchase_amount
    const hasRemainingUsage = !typedRow.max_uses || (typedRow.current_uses ?? 0) < typedRow.max_uses
    const isNowValid = isActive && isNotExpired && meetsMinOrder && hasRemainingUsage

    const currentDiscount = calculateDiscountAmount(typedRow, subtotal)
    const signature = `${row.id}:realtime:${subtotal}:${currentDiscount}:${isActive}`
    
    const stateChanged = !lastValidStateRef.current || lastValidStateRef.current.signature !== signature
    if (!isNowValid && stateChanged) {
      lastValidStateRef.current = { isValid: false, signature }
      dispatch(removeCoupon())
      if (showNotification) {
        const reason = !isActive ? "deactivated" : !isNotExpired ? "expired" : !meetsMinOrder ? "below minimum order" : "usage limit reached"
        toast.warning(`Coupon has been ${reason}`)
      }
      return
    }

    if (stateChanged && isNowValid) {
      lastValidStateRef.current = { isValid: true, signature }
    }
  }, [appliedCoupon, enabled, subtotal, dispatch, showNotification, debug])

  useEffect(() => {
    if (!enabled || !appliedCoupon?.coupon?.id) return
    syncCouponForSubtotal()
  }, [enabled, appliedCoupon?.coupon?.id, subtotal, syncCouponForSubtotal])

  // useEffect(() => {
  //   if (!enabled || !appliedCoupon?.coupon?.id) return

  //   const setupSubscription = async () => {
  //     try {
  //       const supabase = await createClient()
  //       const subscription = supabase
  //         .channel("coupons_sync")
  //         .on(
  //           "postgres_changes",
  //           {
  //             event: "*",
  //             schema: "public",
  //             table: "coupons",
  //             filter: `id=eq.${appliedCoupon.coupon.id}`,
  //           },
  //           (payload: any) => {
  //             invalidateFromRealtimeChange(payload)
  //           }
  //         )
  //         .subscribe()

  //       subscriptionRef.current = subscription
  //     } catch (error) {
  //       if (debug) console.error("Failed to subscribe to coupon changes:", error)
  //     }
  //   }

  //   setupSubscription()

  //   return () => {
  //     if (subscriptionRef.current) {
  //       subscriptionRef.current.unsubscribe()
  //       subscriptionRef.current = null
  //     }
  //   }
  // }, [enabled, appliedCoupon?.coupon?.id, invalidateFromRealtimeChange, debug])

  return {
    isValid: lastValidStateRef.current?.isValid ?? appliedCoupon != null,
  }
}
