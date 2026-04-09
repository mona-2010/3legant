"use server"

import { stripe } from "@/lib/stripe"
import { CartItem, ShippingMethod } from "@/types"
import { headers } from "next/headers"
import { createOrder } from "./orders"

const STRIPE_METADATA_VALUE_LIMIT = 500

function toSafeMetadata(input: Record<string, unknown>): Record<string, string> {
  return Object.entries(input).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value === undefined || value === null) return acc

    const asString = String(value)
    acc[key] = asString.length > STRIPE_METADATA_VALUE_LIMIT
      ? asString.slice(0, STRIPE_METADATA_VALUE_LIMIT)
      : asString

    return acc
  }, {})
}

export async function createCheckoutSession(data: {
  items: CartItem[]
  userInfo: any
  shippingMethod: ShippingMethod
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  userId: string
  couponId?: string
}) {
  const host = (await headers()).get("host")
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https"
  const baseUrl = `${protocol}://${host}`

  // 1. Create a "Pending" order first to track this session
  const { data: order, error: orderError } = await createOrder({
    user_info: data.userInfo,
    payment_method: "card",
    initial_payment_status: "pending",
    shipping_method: data.shippingMethod,
    subtotal: data.subtotal,
    shipping_cost: data.shippingCost,
    discount: data.discount,
    total_price: data.total,
    coupon_id: data.couponId,
    items: data.items.map(i => ({
      product_id: i.product_id || i.id,
      quantity: i.quantity,
      product_price: i.price,
      product_title: i.name,
      product_image: i.image,
      product_color: i.color
    }))
  })

  if (orderError || !order) {
    console.error(`[Checkout] Failed to create pending order: ${orderError}`)
    return { error: orderError || "Failed to initialize order" }
  }

  console.log(`[Checkout] Created pending Order: ${order.id}. Redirecting to Stripe...`)

  try {
    const sessionMetadata = toSafeMetadata({
      orderId: order.id,
      userId: data.userId,
      shippingMethod: data.shippingMethod,
      subtotal: data.subtotal,
      shippingCost: data.shippingCost,
      discount: data.discount,
      total: data.total,
      couponId: data.couponId || "",
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: data.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: [item.image],
            metadata: toSafeMetadata({
              product_id: item.product_id || item.id,
              color: item.color || "",
            })
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${baseUrl}/cart/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart/checkout`,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // Expires in exactly 30 minutes
      metadata: sessionMetadata,
      payment_intent_data: {
        metadata: sessionMetadata,
      },
    })

    return { url: session.url }
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error)
    return { error: error.message }
  }
}
