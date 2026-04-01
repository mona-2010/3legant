"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Coupon } from "@/types"
import { calculateDiscountAmount } from "@/lib/coupons"

type SuggestedCoupon = {
  coupon: Coupon
  amountNeeded: number
  estimatedDiscount: number
  isEligible: boolean
}

export async function validateCoupon(code: string, orderTotal: number) {
  const supabase = createClient(cookies())

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { data: null, error: "Not authenticated" }

  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("id, code, description, discount_type, discount_value, max_discount_amount, min_purchase_amount, max_uses, current_uses, valid_from, valid_until, is_active, created_at, updated_at")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single()

  if (error || !coupon) return { data: null, error: "Invalid coupon code" }

  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    return { data: null, error: "Coupon has expired" }
  }

  if (coupon.min_purchase_amount && orderTotal < coupon.min_purchase_amount) {
    return { data: null, error: `Minimum order amount is $${coupon.min_purchase_amount}` }
  }

  if (coupon.max_uses) {
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("coupon_id", coupon.id)

    if ((count || 0) >= coupon.max_uses) {
      return { data: null, error: "Coupon usage limit reached" }
    }
  }

  const { count: userUsage } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("coupon_id", coupon.id)
    .eq("user_id", user.id)

  if ((userUsage || 0) > 0) {
    return { data: null, error: "You have already used this coupon" }
  }

  const discount = calculateDiscountAmount(coupon as Coupon, orderTotal)

  return { data: { coupon: coupon as Coupon, discount }, error: null }
}

export async function getCoupons() {
  const supabase = createClient(cookies())
  const { data, error } = await supabase
    .from("coupons")
    .select("id, code, description, discount_type, discount_value, max_discount_amount, min_purchase_amount, max_uses, current_uses, valid_from, valid_until, is_active, created_at, updated_at")
    .order("created_at", { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data: data as Coupon[], error: null }
}

export async function createCoupon(coupon: Omit<Coupon, "id" | "created_at" | "updated_at" | "current_uses">) {
  const supabase = createClient(cookies())
  const { data, error } = await supabase
    .from("coupons")
    .insert({ ...coupon, code: coupon.code.toUpperCase() })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Coupon, error: null }
}

export async function updateCoupon(id: string, updates: Partial<Coupon>) {
  const supabase = createClient(cookies())
  if (updates.code) updates.code = updates.code.toUpperCase()

  const { data, error } = await supabase
    .from("coupons")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Coupon, error: null }
}

export async function deleteCoupon(id: string) {
  const supabase = createClient(cookies())
  const { error } = await supabase.from("coupons").delete().eq("id", id)
  if (error) return { error: error.message }
  return { error: null }
}

export async function getSuggestedCoupons(orderTotal: number) {
  const supabase = createClient(cookies())
  const nowIso = new Date().toISOString()
  const NEARBY_THRESHOLD = 10

  const [{ data: noExpiry, error: noExpiryError }, { data: unexpired, error: unexpiredError }] = await Promise.all([
    supabase
      .from("coupons")
      .select("id, code, description, discount_type, discount_value, max_discount_amount, min_purchase_amount, max_uses, current_uses, valid_from, valid_until, is_active, created_at, updated_at")
      .eq("is_active", true)
      .is("valid_until", null),
    supabase
      .from("coupons")
      .select("id, code, description, discount_type, discount_value, max_discount_amount, min_purchase_amount, max_uses, current_uses, valid_from, valid_until, is_active, created_at, updated_at")
      .eq("is_active", true)
      .gte("valid_until", nowIso),
  ])

  if (noExpiryError && unexpiredError) {
    return { data: null, error: noExpiryError.message || unexpiredError.message }
  }

  const map = new Map<string, Coupon>()
    ;[...(noExpiry || []), ...(unexpired || [])].forEach((coupon) => {
      map.set(coupon.id, coupon as Coupon)
    })

  let coupons = Array.from(map.values())

  const suggestions = coupons
    .map((coupon) => {
      const minRequired = coupon.min_purchase_amount ?? 0
      const amountNeeded = Math.max(0, minRequired - orderTotal)
      const isEligible = amountNeeded === 0

      // Show suggestions only when already eligible or close to min amount.
      if (!isEligible && amountNeeded > NEARBY_THRESHOLD) {
        return null
      }

      const discountBase = isEligible ? orderTotal : minRequired
      const estimatedDiscount = calculateDiscountAmount(coupon, discountBase)

      return {
        coupon,
        amountNeeded: Math.round(amountNeeded * 100) / 100,
        estimatedDiscount: Math.round(estimatedDiscount * 100) / 100,
        isEligible,
      } satisfies SuggestedCoupon
    })
    .filter((item): item is SuggestedCoupon => Boolean(item))
    .sort((a, b) => {
      if (a.isEligible !== b.isEligible) return a.isEligible ? -1 : 1
      if (a.amountNeeded !== b.amountNeeded) return a.amountNeeded - b.amountNeeded
      if (a.estimatedDiscount !== b.estimatedDiscount) return b.estimatedDiscount - a.estimatedDiscount
      return a.coupon.code.localeCompare(b.coupon.code)
    })
    .slice(0, 8)

  return { data: suggestions, error: null }
}
