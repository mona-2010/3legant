"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { getSuggestedCoupons } from "@/lib/actions/coupons"
import { toast } from "react-toastify"

export type SuggestedCouponType = {
  coupon: {
    id: string
    code: string
    description?: string
    discount_type: "percentage" | "fixed"
    discount_value: number
    max_discount_amount?: number | null
    min_purchase_amount?: number | null
    max_uses?: number | null
    current_uses?: number
  }
  amountNeeded: number
  estimatedDiscount: number
  isEligible: boolean
}

interface UseCouponUpdatesOptions {
  enabled?: boolean
  subtotal: number
  showNotification?: boolean
  debug?: boolean
  onNewCoupons?: (suggestions: SuggestedCouponType[]) => void
  onCouponStatusChange?: (suggestions: SuggestedCouponType[]) => void
}

export function useCouponUpdates(options: UseCouponUpdatesOptions) {
  const {
    enabled = true,
    subtotal,
    showNotification = true,
    debug = false,
    onNewCoupons,
    onCouponStatusChange
  } = options

  const [suggestions, setSuggestions] = useState<SuggestedCouponType[]>([])
  const [lastSubtitle, setLastSubtitle] = useState("")

  const subscriptionRef = useRef<any>(null)
  const isRefreshingRef = useRef(false)
  const lastSuggestionsRef = useRef<SuggestedCouponType[]>([])
  const suggestionsRef = useRef<SuggestedCouponType[]>([])

  const suggestionsChanged = useCallback((
    oldSuggestions: SuggestedCouponType[],
    newSuggestions: SuggestedCouponType[]
  ): boolean => {
    if (oldSuggestions.length !== newSuggestions.length) return true

    const oldMap = new Map(oldSuggestions.map((s) => [s.coupon.id, s]))
    for (const next of newSuggestions) {
      const prev = oldMap.get(next.coupon.id)
      if (!prev) return true
      if (prev.coupon.code !== next.coupon.code) return true
      if (prev.coupon.description !== next.coupon.description) return true
      if (prev.coupon.discount_type !== next.coupon.discount_type) return true
      if (Math.abs(prev.coupon.discount_value - next.coupon.discount_value) > 0.01) return true
      if ((prev.coupon.min_purchase_amount ?? null) !== (next.coupon.min_purchase_amount ?? null)) return true
      if ((prev.coupon.max_uses ?? null) !== (next.coupon.max_uses ?? null)) return true
      if ((prev.coupon.current_uses ?? null) !== (next.coupon.current_uses ?? null)) return true
      if ((prev.coupon.max_discount_amount ?? null) !== (next.coupon.max_discount_amount ?? null)) return true
      if (prev.isEligible !== next.isEligible) return true
      if (Math.abs(prev.amountNeeded - next.amountNeeded) > 0.01) return true
      if (Math.abs(prev.estimatedDiscount - next.estimatedDiscount) > 0.01) return true
    }

    return false
  }, [])

  const refreshSuggestions = useCallback(async () => {
    if (!enabled || subtotal <= 0) return
    if (isRefreshingRef.current) return

    isRefreshingRef.current = true

    try {
      const { data: newSuggestions } = await getSuggestedCoupons(subtotal)

      if (!newSuggestions) {
        isRefreshingRef.current = false
        return
      }

      const didChange = suggestionsChanged(lastSuggestionsRef.current, newSuggestions)

      if (!didChange) {
        isRefreshingRef.current = false
        return
      }

      lastSuggestionsRef.current = newSuggestions

      const previousSuggestions = suggestionsRef.current
      const oldIds = new Set(previousSuggestions.map(s => s.coupon.id))
      const newIds = new Set(newSuggestions.map(s => s.coupon.id))

      const newCouponsAdded = newSuggestions.some(s => !oldIds.has(s.coupon.id))
      const couponsRemoved = previousSuggestions.some(s => !newIds.has(s.coupon.id))

      suggestionsRef.current = newSuggestions
      setSuggestions(newSuggestions)

      if (newCouponsAdded) {
        if (showNotification) {
          const newCodes = newSuggestions
            .filter(s => !oldIds.has(s.coupon.id))
            .map(s => s.coupon.code)
            .join(", ")
          toast.info(`New coupon available: ${newCodes}`)
        }
        if (onNewCoupons) {
          onNewCoupons(newSuggestions)
        }
        if (debug) {
          console.log("✨ New coupons detected:", newSuggestions.map(s => s.coupon.code))
        }
      }

      if (couponsRemoved) {
        if (showNotification) {
          const removedCodes = previousSuggestions
            .filter(s => !newIds.has(s.coupon.id))
            .map(s => s.coupon.code)
            .join(", ")
          toast.info(`Coupons updated: ${removedCodes}`)
        }
        if (onCouponStatusChange) {
          onCouponStatusChange(newSuggestions)
        }
        if (debug) {
          console.log("Coupon list updated:", newSuggestions.map(s => s.coupon.code))
        }
      }
    } catch (error) {
      if (debug) {
        console.error("Error refreshing coupon suggestions:", error)
      }
    } finally {
      isRefreshingRef.current = false
    }
  }, [enabled, subtotal, suggestionsChanged, showNotification, onNewCoupons, onCouponStatusChange, debug])

  useEffect(() => {
    if (!enabled || subtotal <= 0) return

    void refreshSuggestions()
  }, [enabled, subtotal, refreshSuggestions])

  // useEffect(() => {
  //   if (!enabled || subtotal <= 0) return

  //   const setupSubscription = async () => {
  //     try {
  //       const supabase = await createClient()

  //       const subscription = supabase
  //         .channel("coupons_updates")
  //         .on(
  //           "postgres_changes",
  //           {
  //             event: "*", // Listen to all changes (INSERT, UPDATE, DELETE)
  //             schema: "public",
  //             table: "coupons",
  //           },
  //           () => {
  //             void refreshSuggestions()
  //           }
  //         )
  //         .subscribe()

  //       subscriptionRef.current = subscription

  //       await refreshSuggestions()

  //       if (debug) {
  //         console.log("🔄 Coupon sync initialized - Realtime only")
  //       }
  //     } catch (error) {
  //       if (debug) {
  //         console.error("Failed to subscribe to coupons:", error)
  //       }
  //     }
  //   }

  //   setupSubscription()

  //   return () => {
  //     if (subscriptionRef.current) {
  //       subscriptionRef.current.unsubscribe()
  //       subscriptionRef.current = null
  //     }
  //   }
  // }, [enabled, subtotal, refreshSuggestions, debug])

  useEffect(() => {
    if (suggestions.length === 0) {
      setLastSubtitle("")
      return
    }

    if (suggestions.length === 1) {
      setLastSubtitle("You have one eligible coupon")
    } else if (suggestions.every(s => s.isEligible)) {
      setLastSubtitle(`All ${suggestions.length} coupons are eligible`)
    } else {
      const eligibleCount = suggestions.filter(s => s.isEligible).length
      setLastSubtitle(`${eligibleCount} of ${suggestions.length} coupons eligible`)
    }
  }, [suggestions])

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [])

  return {
    suggestions,
    lastSubtitle,
  }
}
