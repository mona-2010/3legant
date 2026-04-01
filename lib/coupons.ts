import { Coupon } from "@/types"

export function calculateDiscountAmount(coupon: Coupon, subtotal: number): number {
  if (!coupon || subtotal <= 0) return 0

  let discount = 0
  if (coupon.discount_type === "percentage") {
    discount = (subtotal * coupon.discount_value) / 100
    if (coupon.max_discount_amount) {
      discount = Math.min(discount, coupon.max_discount_amount)
    }
  } else {
    discount = Math.min(coupon.discount_value, subtotal)
  }

  return Math.round(discount * 100) / 100
}
