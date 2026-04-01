import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { internalCreateOrder } from "@/lib/actions/orders"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message)
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  const supabase = createAdminClient()
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent

        // Update payment record
        await supabase
          .from("payments")
          .update({
            status: "succeeded",
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", pi.id)

        // Move order to processing once payment is confirmed
        const { data: order } = await supabase
          .from("orders")
          .select("id")
          .eq("payment_intent_id", pi.id)
          .maybeSingle()

        if (order) {
          await supabase
            .from("orders")
            .update({
              status: "processing",
              payment_intent_id: pi.id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id)
            .eq("status", "pending")
        }
        break
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.payment_status !== "paid") break

        const piId = session.payment_intent as string

        // Check if order already exists
        const { data: existingOrder } = await supabase
          .from("orders")
          .select("id")
          .eq("payment_intent_id", piId)
          .maybeSingle()

        if (existingOrder) {
          await supabase
            .from("orders")
            .update({ status: "processing", updated_at: new Date().toISOString() })
            .eq("id", existingOrder.id)
            .eq("status", "pending")
          break
        }

        // Create order from metadata
        const metadata = session.metadata
        if (!metadata) break

        const userInfo = JSON.parse(metadata.userInfo)
        const items = JSON.parse(metadata.items)

        await internalCreateOrder(supabase, metadata.userId || userInfo.userId || (session.customer as string) || "guest", {
          user_info: userInfo,
          payment_method: "card",
          stripe_payment_intent_id: piId,
          initial_payment_status: "succeeded",
          shipping_method: metadata.shippingMethod as any,
          subtotal: parseFloat(metadata.subtotal),
          shipping_cost: parseFloat(metadata.shippingCost),
          discount: parseFloat(metadata.discount),
          total_price: parseFloat(metadata.total),
          coupon_id: metadata.couponId || undefined,
          items: items.map((i: any) => ({
            product_id: i.id,
            quantity: i.quantity,
            product_price: i.price,
            product_title: i.name,
            product_image: i.image,
            product_color: i.color,
          })),
        })
        break
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent
        await supabase
          .from("payments")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("stripe_payment_intent_id", pi.id)

        await supabase
          .from("orders")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("payment_intent_id", pi.id)
          .eq("status", "pending")
        break
      }

      case "payment_intent.canceled": {
        const pi = event.data.object as Stripe.PaymentIntent
        await supabase
          .from("payments")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("stripe_payment_intent_id", pi.id)

        await supabase
          .from("orders")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("payment_intent_id", pi.id)
          .eq("status", "pending")
        break
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge
        if (charge.payment_intent) {
          const now = new Date().toISOString()
          const refundAmount = Number(((charge.amount_refunded || 0) / 100).toFixed(2))
          const totalAmount = Number(((charge.amount || 0) / 100).toFixed(2))
          const isFullyRefunded = !!charge.refunded || (charge.amount_refunded || 0) >= (charge.amount || 0)

          const { data: order } = await supabase
            .from("orders")
            .select("id, status, user_info")
            .eq("payment_intent_id", charge.payment_intent)
            .maybeSingle()

          await supabase
            .from("payments")
            .update({ status: "refunded", updated_at: now })
            .eq("stripe_payment_intent_id", charge.payment_intent)

          await supabase
            .from("orders")
            .update({
              status: "refunded",
              user_info: order?.user_info?.refund_request
                ? {
                  ...order.user_info,
                  refund_request: {
                    ...order.user_info.refund_request,
                    refunded_at: now,
                    refund_amount: refundAmount,
                    is_partial_refund: !isFullyRefunded,
                    refund_rate: totalAmount > 0 ? Number((refundAmount / totalAmount).toFixed(4)) : null,
                  },
                }
                : order?.user_info,
              updated_at: now,
            })
            .eq("payment_intent_id", charge.payment_intent)
        }
        break
      }

      default:
        break
    }
  } catch (err: any) {
    console.error("Stripe webhook handler error:", err.message)
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
