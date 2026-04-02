import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { OrderStatus, PaymentStatus } from "@/types"
import Stripe from "stripe"

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" })
  : null

export type PaymentRow = {
  id: string
  order_id: string
  status: PaymentStatus
  stripe_payment_intent_id?: string | null
  processed_at?: string | null
}

export type OrderStockItem = { product_id: string; quantity: number }

export function mapIntentToPaymentStatus(intent: Stripe.PaymentIntent): PaymentStatus {
  if (intent.status === "canceled") return "cancelled"
  if (intent.status === "succeeded") return "succeeded"
  if (intent.status === "requires_payment_method" && intent.last_payment_error) return "failed"
  return "pending"
}

export function mapPaymentToOrderStatus(paymentStatus: PaymentStatus, currentOrderStatus: OrderStatus): OrderStatus {
  if (currentOrderStatus === "cancelled") return "cancelled"
  if (paymentStatus === "refunded") return "refunded"
  if (paymentStatus === "cancelled" || paymentStatus === "failed") return "cancelled"
  if ((paymentStatus === "succeeded" || paymentStatus === "completed") && currentOrderStatus === "pending") return "processing"
  return currentOrderStatus
}

export async function getRefundChargeId(paymentIntentId: string) {
  if (!stripe) return { chargeId: null, error: "Stripe is not configured" }
  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge"] })
    const charge = intent.latest_charge
    if (!charge) return { chargeId: null, error: "No captured Stripe charge found" }
    return { chargeId: typeof charge === "string" ? charge : charge.id, error: null }
  } catch (err: any) {
    return { chargeId: null, error: err?.message || "Unable to resolve Stripe charge" }
  }
}

export async function resolveStripeStatus(stripePaymentIntentId: string): Promise<PaymentStatus | null> {
  if (!stripe) return null
  try {
    const intent = await stripe.paymentIntents.retrieve(stripePaymentIntentId, { expand: ["latest_charge"] })
    const latestCharge = intent.latest_charge
    if (latestCharge && typeof latestCharge !== "string") {
      if (latestCharge.refunded || latestCharge.amount_refunded > 0) return "refunded"
    }
    return mapIntentToPaymentStatus(intent)
  } catch (err: any) {
    console.error("Stripe status sync failed:", err?.message || err)
    return null
  }
}

export async function reserveOrderStock(supabase: ReturnType<typeof createClient>, items: OrderStockItem[]) {
  const adminClient = createAdminClient()
  const requestedByProduct = new Map<string, number>()
  for (const item of items) {
    if (!item.product_id || item.quantity <= 0) continue
    requestedByProduct.set(item.product_id, (requestedByProduct.get(item.product_id) || 0) + item.quantity)
  }

  const reservedItems: OrderStockItem[] = []
  for (const [productId, quantity] of requestedByProduct.entries()) {
    let reserved = false
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: product, error: productError } = await adminClient.from("products").select("id, title, stock, is_active").eq("id", productId).single()
      if (productError || !product) return { data: null, error: `Product not found for item ${productId}`, reservedItems }
      if ((product.stock || 0) < quantity) return { data: null, error: `Insufficient stock for ${product.title || "this product"}. Available: ${product.stock || 0}, requested: ${quantity}`, reservedItems }

      const nextStock = Math.max((product.stock || 0) - quantity, 0)
      const { data: updated, error: updateError } = await adminClient.from("products")
        .update({ stock: nextStock, is_active: nextStock <= 0 ? false : product.is_active, updated_at: new Date().toISOString() })
        .eq("id", productId).eq("stock", product.stock).gte("stock", quantity).select("id").maybeSingle()

      if (updateError) return { data: null, error: updateError.message, reservedItems }
      if (updated) { reservedItems.push({ product_id: productId, quantity }); reserved = true; break }
    }
    if (!reserved) return { data: null, error: "Could not reserve stock. Please try again.", reservedItems }
  }
  return { data: reservedItems, error: null, reservedItems }
}

export async function releaseReservedStock(supabase: ReturnType<typeof createClient>, reservedItems: OrderStockItem[]) {
  const adminClient = createAdminClient()
  for (const item of reservedItems) {
    const { data: product } = await adminClient.from("products").select("id, stock").eq("id", item.product_id).single()
    if (!product) continue
    await adminClient.from("products").update({ stock: (product.stock || 0) + item.quantity, updated_at: new Date().toISOString() }).eq("id", item.product_id)
  }
}

export async function restockOrder(supabase: ReturnType<typeof createClient>, orderId: string) {
  const adminClient = createAdminClient()
  const { data: order, error: orderError } = await adminClient
    .from("orders")
    .select("id, coupon_id, order_items(product_id, quantity)")
    .eq("id", orderId)
    .single()

  if (orderError || !order) return { error: orderError?.message || "Order not found" }

  const items = order.order_items as { product_id: string; quantity: number }[]
  if (items && items.length > 0) {
    for (const item of items) {
      const { data: product } = await adminClient
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .single()

      if (product) {
        await adminClient
          .from("products")
          .update({
            stock: (product.stock || 0) + item.quantity,
            is_active: true, // Reactivate if it was out of stock
            updated_at: new Date().toISOString()
          })
          .eq("id", item.product_id)
      }
    }
  }

  if (order.coupon_id) {
    const { data: coupon } = await adminClient
      .from("coupons")
      .select("current_uses, max_uses")
      .eq("id", order.coupon_id)
      .single()

    if (coupon) {
      const nextUses = Math.max(0, (coupon.current_uses || 0) - 1)
      const isActive = coupon.max_uses ? nextUses < coupon.max_uses : true

      await adminClient
        .from("coupons")
        .update({
          current_uses: nextUses,
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq("id", order.coupon_id)
    }
  }

  return { error: null }
}
