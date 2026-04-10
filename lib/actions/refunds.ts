"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Order, OrderRefundRequest, OrderStatus } from "@/types"
import { verifyAdmin } from "@/lib/actions/admin"
import { stripe, getRefundChargeDetails, restockOrder } from "@/lib/actions/order-helpers"
import { getRefundPolicyForOrder } from "@/lib/refund-policy"
import { getStoreSettings } from "./settings"

function getOrderRefundRequest(order: { user_info?: any } | null | undefined): OrderRefundRequest | null {
  const refundRequest = order?.user_info?.refund_request
  if (!refundRequest || typeof refundRequest !== "object") return null
  return refundRequest as OrderRefundRequest
}

export async function requestRefund(orderId: string, reason: string) {
  const supabase = createClient(cookies())

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { data: null, error: "Not authenticated" }

  const trimmedReason = reason.trim()
  if (!trimmedReason) {
    return { data: null, error: "Please provide a refund reason" }
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, user_id, status, user_info, created_at, payments(id, status, stripe_payment_intent_id)")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single()

  if (orderError || !order) return { data: null, error: "Order not found" }

  const payment = Array.isArray(order.payments) ? order.payments[0] : order.payments
  if (!payment) {
    return { data: null, error: "No payment record found for this order" }
  }

  if (!["succeeded", "completed"].includes(payment.status)) {
    return { data: null, error: "Only paid orders can be refunded" }
  }

  if (["cancelled", "refunded"].includes(order.status)) {
    return { data: null, error: `This order is already ${order.status}` }
  }

  if (!["shipped", "delivered"].includes(order.status)) {
    return { data: null, error: `Refund requests are only available for shipped or delivered orders. For ${order.status} orders, please use the direct "Cancel Order" option in your order details.` }
  }

  const existingRequest = getOrderRefundRequest(order)
  if (existingRequest) {
    return { data: null, error: "A refund request has already been submitted for this order" }
  }

  const { data: settings } = await getStoreSettings()
  const refundRequestDays = Number(settings?.refund_request_days || 30)

  const createdAt = new Date(order.created_at || order.user_info?.created_at)
  const diffMs = Date.now() - createdAt.getTime()
  const daysSinceOrder = diffMs / (1000 * 60 * 60 * 24)

  if (daysSinceOrder > refundRequestDays) {
    return { data: null, error: `Refund request window has expired (${refundRequestDays} days).` }
  }

  const now = new Date().toISOString()
  const nextUserInfo = {
    ...(order.user_info || {}),
    refund_request: {
      reason: trimmedReason,
      previous_order_status: order.status,
      requested_at: now,
      reviewed_at: null,
      refunded_at: null,
      admin_note: null,
      admin_decision: null,
      stripe_refund_id: null,
    },
  }

  const { data, error } = await supabase
    .from("orders")
    .update({
      user_info: nextUserInfo,
      updated_at: now,
    })
    .eq("id", orderId)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Order, error: null }
}

export async function reviewRefundRequest(
  orderId: string,
  decision: "approve" | "reject",
  adminNote?: string,
  adminRefundAmount?: number
) {
  const adminCheck = await verifyAdmin()
  if (!adminCheck.isAuthenticated) return { data: null, error: "Not authenticated" }
  if (!adminCheck.isAdmin) return { data: null, error: "Not authorized" }

  const supabase = createClient(cookies())
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { data: null, error: "Not authenticated" }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status, user_info, total_price, created_at, payments(id, order_id, status, stripe_payment_intent_id)")
    .eq("id", orderId)
    .single()

  if (orderError || !order) return { data: null, error: "Order not found" }

  const refundRequest = getOrderRefundRequest(order)
  if (!refundRequest) {
    return { data: null, error: "No refund request found for this order" }
  }

  if (refundRequest.admin_decision) {
    return { data: null, error: `Refund request is already ${refundRequest.admin_decision}` }
  }

  const payment = Array.isArray(order.payments) ? order.payments[0] : order.payments
  const now = new Date().toISOString()

  if (decision === "reject") {
    const nextUserInfo = {
      ...(order.user_info || {}),
      refund_request: {
        ...refundRequest,
        admin_decision: "rejected",
        admin_note: adminNote?.trim() || null,
        reviewed_at: now,
      },
    }

    const { data, error } = await supabase
      .from("orders")
      .update({
        status: refundRequest.previous_order_status || "delivered",
        user_info: nextUserInfo,
        updated_at: now,
      })
      .eq("id", orderId)
      .select()
      .single()

    if (error) return { data: null, error: error.message }
    return { data: data as Order, error: null }
  }

  if (!payment) return { data: null, error: "Payment record not found" }
  if (!["succeeded", "completed"].includes(payment.status)) {
    return { data: null, error: "Only successful Stripe payments can be refunded" }
  }
  if (!payment.stripe_payment_intent_id) {
    return { data: null, error: "This payment is not linked to Stripe" }
  }

  const { data: settings } = await getStoreSettings()
  const rules = settings?.refund_policy_rules || []

  const { daysSinceOrder, refundRate, maxRefundAmount } = getRefundPolicyForOrder(order.created_at, Number(order.total_price || 0), rules)
  if (maxRefundAmount <= 0) {
    return { data: null, error: "This order is not eligible for a refund amount" }
  }

  const requestedRefundAmount = Number((adminRefundAmount ?? maxRefundAmount).toFixed(2))
  if (!Number.isFinite(requestedRefundAmount) || requestedRefundAmount <= 0) {
    return { data: null, error: "Please provide a valid refund amount" }
  }

  if (requestedRefundAmount > maxRefundAmount) {
    return {
      data: null,
      error: `Refund amount exceeds policy limit. Max allowed is $${maxRefundAmount.toFixed(2)} for ${daysSinceOrder} day(s) since order.`,
    }
  }

  const chargeDetails = await getRefundChargeDetails(payment.stripe_payment_intent_id)
  const { chargeId, refundableAmount, error: chargeError } = chargeDetails
  if (chargeError || !chargeId) return { data: null, error: chargeError || "Unable to find Stripe charge" }
  if (!refundableAmount || refundableAmount <= 0) return { data: null, error: "No refundable amount is left on this Stripe charge" }

  const stripeRefundAmount = Math.min(Math.round(requestedRefundAmount * 100), refundableAmount)
  const finalRefundAmount = Number((stripeRefundAmount / 100).toFixed(2))

  if (!stripe) return { data: null, error: "Stripe is not configured" }

  try {
    const stripeRefund = await stripe.refunds.create({
      charge: chargeId,
      amount: stripeRefundAmount,
      metadata: {
        order_id: orderId,
        payment_id: payment.id,
        refund_amount: finalRefundAmount.toFixed(2),
        refund_rate: refundRate.toString(),
        refund_days: daysSinceOrder.toString(),
      },
    })

    const isFullRefund = Math.abs(finalRefundAmount - Number(order.total_price || 0)) < 0.01

    const nextUserInfo = {
      ...(order.user_info || {}),
      refund_request: {
        ...refundRequest,
        admin_decision: "approved",
        admin_note: adminNote?.trim() || null,
        reviewed_at: now,
        refunded_at: stripeRefund.status === "failed" ? null : now,
        stripe_refund_id: stripeRefund.id,
        refund_amount: finalRefundAmount,
        refund_rate: refundRate,
        days_since_order: daysSinceOrder,
        is_partial_refund: !isFullRefund,
      },
    }

    const { data, error } = await supabase
      .from("orders")
      .update({
        status: stripeRefund.status === "failed"
          ? (refundRequest.previous_order_status || order.status)
          : "refunded",
        user_info: nextUserInfo,
        updated_at: now,
      })
      .eq("id", orderId)
      .select()
      .single()

    if (error) return { data: null, error: error.message }

    if (stripeRefund.status !== "failed") {
      await restockOrder(supabase, orderId)
    }

    if (stripeRefund.status !== "failed") {
      await supabase
        .from("payments")
        .update({
          status: "refunded",
          updated_at: now,
        })
        .eq("id", payment.id)
    }

    return { data: data as Order, error: null }
  } catch (err: any) {
    return { data: null, error: err?.message || "Stripe refund failed" }
  }
}
