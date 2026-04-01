import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
})

export async function POST(req: NextRequest) {
  try {
    const { amount, paymentMethod = "auto" } = await req.json()

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const params: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount * 100),
      currency: "usd",
    }

    if (paymentMethod === "paypal") {
      params.payment_method_types = ["paypal"]
    } else if (paymentMethod === "card") {
      params.payment_method_types = ["card"]
    } else {
      params.automatic_payment_methods = { enabled: true }
    }

    const paymentIntent = await stripe.paymentIntents.create(params)
    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
