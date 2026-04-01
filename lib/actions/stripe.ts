"use server"

import { stripe } from "@/lib/stripe"
import { CartItem, ShippingMethod } from "@/types"
import { headers } from "next/headers"
import { createOrder } from "./orders"

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
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: data.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: [item.image],
            metadata: {
              product_id: item.product_id || item.id,
              color: item.color || "",
            }
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${baseUrl}/cart/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart/checkout`,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // Expires in exactly 30 minutes
      metadata: {
        orderId: order.id,
        userId: data.userId,
        userInfo: JSON.stringify(data.userInfo),
        shippingMethod: data.shippingMethod,
        subtotal: data.subtotal,
        shippingCost: data.shippingCost,
        discount: data.discount,
        total: data.total,
        couponId: data.couponId || "",
        items: JSON.stringify(data.items.map(i => ({
          id: i.product_id || i.id,
          quantity: i.quantity,
          price: i.price,
          name: i.name,
          image: i.image,
          color: i.color
        })))
      },
    })

    return { url: session.url }
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error)
    return { error: error.message }
  }
}
