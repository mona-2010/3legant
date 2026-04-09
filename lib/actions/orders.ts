"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { Order, OrderItem, OrderStatus, PaymentStatus, ShippingMethod, OrderUserInfo } from "@/types"
import { PaymentRow, reserveOrderStock, releaseReservedStock, stripe, getRefundChargeId, restockOrder } from "@/lib/actions/order-helpers"
import { syncSinglePaymentWithStripe, syncOrderPaymentsWithStripe, } from "@/lib/actions/stripe-sync"
import { saveOrderAddresses } from "@/lib/actions/order-addresses"
import { getStoreSettings } from "./settings"
import { clearCartByUserId } from "@/lib/cart/mutations-server"

const ORDER_ITEMS_SELECT = "id,order_id,product_id,product_title,product_price,product_image,product_color,quantity,created_at,products(stock,is_active)"
const PAYMENTS_SELECT = "id,order_id,user_id,amount,currency,status,payment_method,transaction_id,stripe_payment_intent_id,processed_at,created_at,updated_at"
const ORDERS_LIST_SELECT = "id,user_id,first_name,last_name,email,payment_method,subtotal,shipping_cost,discount,total_price,status,user_info,created_at,updated_at"

export async function createOrder(orderData: {
  user_info: OrderUserInfo
  payment_method: string
  stripe_payment_intent_id?: string
  initial_payment_status?: PaymentStatus
  shipping_method: ShippingMethod
  subtotal: number
  shipping_cost: number
  discount: number
  total_price: number
  coupon_id?: string
  items: { product_id: string; quantity: number; product_price: number; product_title: string; product_image: string; product_color?: string }[]
}) {
  const supabase = createClient(cookies())

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { data: null, error: "Not authenticated" }

  return internalCreateOrder(supabase, user.id, orderData)
}

/**
 * Shared order creation logic that can be used by both 
 * Server Actions (with user session) and Webhooks (with admin client).
 */
export async function internalCreateOrder(
  supabase: ReturnType<typeof createClient> | ReturnType<typeof import("@/lib/supabase/admin").createAdminClient>,
  userId: string,
  orderData: {
    user_info: OrderUserInfo
    payment_method: string
    stripe_payment_intent_id?: string
    initial_payment_status?: PaymentStatus
    shipping_method: ShippingMethod
    subtotal: number
    shipping_cost: number
    discount: number
    total_price: number
    coupon_id?: string
    items: { product_id: string; quantity: number; product_price: number; product_title: string; product_image: string; product_color?: string }[]
  }
) {

  if (orderData.coupon_id) {
    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select("id, is_active, valid_until, min_purchase_amount, max_uses, current_uses")
      .eq("id", orderData.coupon_id)
      .single()

    if (couponError || !coupon || coupon.is_active !== true) {
      return { data: null, error: "Coupon is no longer valid" }
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return { data: null, error: "Coupon has expired" }
    }

    if (coupon.min_purchase_amount && orderData.subtotal < coupon.min_purchase_amount) {
      return { data: null, error: `Minimum order amount is $${coupon.min_purchase_amount}` }
    }

    if (coupon.max_uses && (coupon.current_uses || 0) >= coupon.max_uses) {
      return { data: null, error: "Coupon usage limit reached" }
    }
  }

  const { error: stockError, reservedItems } = await reserveOrderStock(
    supabase,
    orderData.items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    }))
  )

  if (stockError) {
    return { data: null, error: stockError }
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      first_name: orderData.user_info.first_name,
      last_name: orderData.user_info.last_name,
      email: orderData.user_info.email,
      phone: orderData.user_info.phone || null,
      street_address: orderData.user_info.shipping.street_address,
      country: orderData.user_info.shipping.country,
      town_city: orderData.user_info.shipping.city,
      state: orderData.user_info.shipping.state || null,
      zip_code: orderData.user_info.shipping.zip_code || null,
      status: (orderData.initial_payment_status === "succeeded" ? "processing" : "pending") as OrderStatus,
      user_info: orderData.user_info,
      payment_method: orderData.payment_method,
      payment_intent_id: orderData.stripe_payment_intent_id || null,
      shipping_method: orderData.shipping_method,
      subtotal: orderData.subtotal,
      shipping_cost: orderData.shipping_cost,
      discount: orderData.discount,
      total_price: orderData.total_price,
      coupon_id: orderData.coupon_id || null,
    })
    .select()
    .single()

  if (orderError) {
    await releaseReservedStock(supabase, reservedItems)
    return { data: null, error: orderError.message }
  }

  const orderItems = orderData.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    product_price: item.product_price,
    product_title: item.product_title,
    product_image: item.product_image,
    product_color: item.product_color,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id)
    await releaseReservedStock(supabase, reservedItems)
    return { data: null, error: itemsError.message }
  }

  const { data: paymentRow, error: paymentError } = await supabase
    .from("payments")
    .insert({
      order_id: order.id,
      user_id: userId,
      amount: orderData.total_price,
      payment_method: orderData.payment_method,
      status: (orderData.initial_payment_status || "pending") as PaymentStatus,
      stripe_payment_intent_id: orderData.stripe_payment_intent_id || null,
      processed_at:
        orderData.initial_payment_status === "succeeded"
          ? new Date().toISOString()
          : null,
    })
    .select("id, order_id, status, stripe_payment_intent_id, processed_at")
    .single()

  if (paymentError) {
    console.error("Payment record creation failed:", paymentError.message)
  } else if (paymentRow) {
    await syncSinglePaymentWithStripe(
      supabase,
      paymentRow as PaymentRow,
      order.status as OrderStatus
    )
  }

  if (order.status === "processing") {
    console.log(`[OrderAction] Clearing cart for completed order ${order.id} (Status: ${order.status})`)
    await clearCartByUserId(supabase, userId)
  }

  await saveOrderAddresses(supabase, userId, order.id, orderData.user_info)

  revalidatePath("/admin/orders")
  revalidatePath("/account/orders")

  return { data: order as Order, error: null }
}

export async function getUserOrders() {
  const supabase = createClient(cookies())

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { data: null, error: "Not authenticated" }

  const { data, error } = await supabase
    .from("orders")
    .select(`${ORDERS_LIST_SELECT}, order_items(${ORDER_ITEMS_SELECT}), payments(${PAYMENTS_SELECT})`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return { data: null, error: error.message }

  const synced = await syncOrderPaymentsWithStripe(supabase, data || [])
  return { data: synced as (Order & { order_items: OrderItem[] })[], error: null }
}

export async function getOrderById(orderId: string) {
  const supabase = createClient(cookies())

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { data: null, error: "Not authenticated" }

  const { data, error } = await supabase
    .from("orders")
    .select(`${ORDERS_LIST_SELECT}, order_items(${ORDER_ITEMS_SELECT}), payments(${PAYMENTS_SELECT})`)
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single()

  if (error) return { data: null, error: error.message }

  const synced = await syncOrderPaymentsWithStripe(supabase, data ? [data] : [])
  return { data: synced[0] || data, error: null }
}

export async function getAllOrders(filters?: {
  status?: OrderStatus
  limit?: number
  offset?: number
  dateAfter?: string
}) {
  const supabase = createClient(cookies())

  let query = supabase
    .from("orders")
    .select(`${ORDERS_LIST_SELECT}, order_items(${ORDER_ITEMS_SELECT}), payments(${PAYMENTS_SELECT})`, { count: "exact" })
    .order("created_at", { ascending: false })

  if (filters?.status) query = query.eq("status", filters.status)
  if (filters?.dateAfter) query = query.gte("created_at", filters.dateAfter)
  if (filters?.limit) query = query.limit(filters.limit)
  if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)

  const { data, error, count } = await query
  if (error) return { data: null, error: error.message, count: 0 }

  const synced = await syncOrderPaymentsWithStripe(supabase, data || [])
  return { data: synced, error: null, count }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = createClient(cookies())

  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
  if (status === "delivered") updates.delivered_at = new Date().toISOString()

  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", orderId)
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  // Restock items if cancelled or refunded
  if (status === "cancelled" || status === "refunded") {
    await restockOrder(supabase, orderId)
  }

  if (status === "cancelled") {
    await supabase
      .from("payments")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("order_id", orderId)
      .in("status", ["pending"])
  } else if (status === "refunded") {
    await supabase
      .from("payments")
      .update({ status: "refunded", updated_at: new Date().toISOString() })
      .eq("order_id", orderId)
      .in("status", ["succeeded", "completed"])
  }

  revalidatePath("/admin/orders")
  revalidatePath("/account/orders")
  revalidatePath(`/account/orders/${orderId}`)

  return { data: data as Order, error: null }
}

export async function cancelOrder(orderId: string) {
  const supabase = createClient(cookies())

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: "Not authenticated" }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("status, created_at, user_id, total_price, payments(id, status, stripe_payment_intent_id)")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single()

  if (orderError || !order) return { error: "Order not found" }
  if (order.user_id !== user.id) return { error: "Not authorized" }

  if (!["pending", "processing"].includes(order.status)) {
    return { error: `Direct cancellation is only available for pending or processing orders. For ${order.status} orders, please submit a Refund Request instead.` }
  }

  const { data: settings } = await getStoreSettings()
  const cancellationRefundDays = Number(settings?.cancellation_refund_days || 3)

  const createdAt = new Date(order.created_at)
  const diffMs = Date.now() - createdAt.getTime()
  const daysSinceOrder = diffMs / (1000 * 60 * 60 * 24)

  const shouldRefund = daysSinceOrder <= cancellationRefundDays
  const payment = Array.isArray(order.payments) ? order.payments[0] : order.payments

  if (shouldRefund && order.status === "processing" && payment?.stripe_payment_intent_id) {
    const { chargeId, error: chargeError } = await getRefundChargeId(payment.stripe_payment_intent_id)
    if (chargeError || !chargeId) {
      return { error: `Stripe Refund Failed: ${chargeError || "Could not resolve Stripe charge ID"}. The order status has not been changed.` }
    }

    if (!stripe) return { error: "Stripe configuration missing. Refund aborted." }

    try {
      await stripe.refunds.create({
        charge: chargeId,
        amount: Math.round(Number(order.total_price) * 100),
        metadata: { order_id: orderId, cancellation: "user_requested" }
      })
    } catch (err: any) {
      return { error: `Stripe Refund Error: ${err.message}. The order has not been cancelled.` }
    }
  }

  const now = new Date().toISOString()
  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: "cancelled", updated_at: now })
    .eq("id", orderId)

  if (updateError) return { error: updateError.message }

  await restockOrder(supabase, orderId)

  if (shouldRefund && order.status === "processing") {
    await supabase
      .from("payments")
      .update({ status: "refunded", updated_at: now })
      .eq("order_id", orderId)
  } else {
    await supabase
      .from("payments")
      .update({ status: "cancelled", updated_at: now })
      .eq("order_id", orderId)
      .eq("status", "pending")
  }

  revalidatePath("/account/orders")
  revalidatePath(`/account/orders/${orderId}`)
  revalidatePath("/admin/orders")

  return { error: null }
}

export async function finalizeStripeOrder(sessionId: string) {
  const { stripe } = await import("@/lib/stripe")
  const supabase = createClient(cookies())

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const piId = session.payment_intent as string
    
    const metadata = session.metadata
    const orderIdFromMetadata = metadata?.orderId

    let order = null

    if (orderIdFromMetadata) {
      console.log(`[Sync] Checking database for Order ID: ${orderIdFromMetadata}`)
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("*, order_items(*), payments(*)")
        .eq("id", orderIdFromMetadata)
        .maybeSingle()
      
      if (existingOrder) {
        order = existingOrder
        console.log(`[Sync] Found order in DB with status: ${order.status}`)
        
        if (session.payment_status === "paid") {
          console.log(`[Sync] Payment verified for Order ${order.id}. Current status: ${order.status}`)
          
          if (order.status === "pending") {
            console.log(`[Sync] Updating Order ${order.id} to 'processing'...`)
            const { error: updateError } = await supabase
              .from("orders")
              .update({ 
                status: "processing", 
                payment_intent_id: piId,
                updated_at: new Date().toISOString() 
              })
              .eq("id", order.id)
            
            if (!updateError) {
              order.status = "processing"
              order.payment_intent_id = piId
            }
          }

          // Use Admin client for the payment update to bypass RLS
          const { createAdminClient } = await import("@/lib/supabase/admin")
          const adminSupabase = createAdminClient()
          
          console.log(`[Sync] Ensuring payment record is updated for Order ${order.id}...`)
          await adminSupabase
            .from("payments")
            .update({ 
              status: "succeeded", 
              stripe_payment_intent_id: piId,
              processed_at: new Date().toISOString() 
            })
            .eq("order_id", order.id)
            .eq("status", "pending")
        }
      }
    }

    if (!order && piId) {
      console.log(`[Sync] Order ID not found in metadata. Attempting lookup by Payment Intent ID: ${piId}`)
      const { data: existingByPi } = await supabase
        .from("orders")
        .select("*, order_items(*), payments(*)")
        .eq("payment_intent_id", piId)
        .maybeSingle()
      
      if (existingByPi) order = existingByPi
    }

    if (order) {
      // FINAL SAFETY: Always try to clear the cart if the order is successfully paid,
      // even if the status was already changed by the webhook.
      const { data: { user } } = await supabase.auth.getUser()
      if (user && (order.status === "processing" || order.status === "completed" || order.status === "shipped")) {
        console.log(`[Sync] Final Cart Clear trigger for user ${user.id} (Order: ${order.id}, Status: ${order.status})`)
        
        // Use Admin client for cart clear to ensure success
        const { createAdminClient } = await import("@/lib/supabase/admin")
        const adminSupabase = createAdminClient()
        await clearCartByUserId(adminSupabase, user.id)
      }

      return { data: order }
    }

    if (!metadata) return { error: "Missing metadata" }

    // 4. LAST RESORT: Reconstruct from Stripe if metadata is missing or too bulky
    let userInfo = null
    let items: any[] = []

    if (!userInfo) {
      console.log("[Sync] Reconstructing customer info from Stripe Session...")
      const name = session.customer_details?.name || ""
      const [firstName, ...lastNameParts] = name.split(" ")
      userInfo = {
        first_name: firstName,
        last_name: lastNameParts.join(" ") || ".",
        email: session.customer_details?.email || "",
        phone: session.customer_details?.phone || "",
        shipping: {
          first_name: firstName,
          last_name: lastNameParts.join(" ") || ".",
          street_address: session.customer_details?.address?.line1 || "",
          city: session.customer_details?.address?.city || "",
          state: session.customer_details?.address?.state || "",
          zip_code: session.customer_details?.address?.postal_code || "",
          country: session.customer_details?.address?.country || ""
        }
      }
    }

    if (items.length === 0) {
      console.log("[Sync] Fetching line items from Stripe API...")
      const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
        expand: ["data.price.product"]
      })
      items = lineItems.data.map((li: any) => {
        const product = li.price?.product
        return {
          id: product?.metadata?.product_id || li.description,
          quantity: li.quantity || 1,
          price: (li.price?.unit_amount || 0) / 100,
          name: li.description || "Product",
          image: product?.images?.[0] || "",
          color: product?.metadata?.color || ""
        }
      })
    }

    if (!userInfo || items.length === 0) return { error: "Could not reconstruct order from Stripe data" }

    const orderResult = await createOrder({
      user_info: userInfo,
      payment_method: "card",
      stripe_payment_intent_id: piId,
      initial_payment_status: session.payment_status === "paid" ? "succeeded" : "pending",
      shipping_method: metadata.shippingMethod as ShippingMethod,
      subtotal: parseFloat(metadata.subtotal),
      shipping_cost: parseFloat(metadata.shippingCost),
      discount: parseFloat(metadata.discount),
      total_price: parseFloat(metadata.total),
      coupon_id: metadata.couponId || undefined,
      items: items.map((i: any) => ({
        product_id: i.id,
        quantity: i.quantity,
        product_price: i.price,
        product_title: i.name || undefined,
        product_image: i.image || undefined,
        product_color: i.color || undefined,
      })),
    })

    if (orderResult.error) return { error: orderResult.error }

    const { data: newOrder } = await supabase
      .from("orders")
      .select("*, order_items(*), payments(*)")
      .eq("id", orderResult.data!.id)
      .single()

    return { data: newOrder }
  } catch (error: any) {
    console.error("Finalize Stripe Order Error:", error)
    return { error: error.message }
  }
}

export async function updateOrderPaymentIntent(orderId: string, paymentIntentId: string) {
  const supabase = createClient(cookies())
  const now = new Date().toISOString()

  await supabase
    .from("orders")
    .update({ payment_intent_id: paymentIntentId, updated_at: now })
    .eq("id", orderId)

  await supabase
    .from("payments")
    .update({ stripe_payment_intent_id: paymentIntentId, updated_at: now })
    .eq("order_id", orderId)

  return { success: true }
}
