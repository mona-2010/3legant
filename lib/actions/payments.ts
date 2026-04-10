"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { OrderStatus, PaymentStatus } from "@/types"
import {
  mapPaymentToOrderStatus,
  resolveStripeStatus,
} from "@/lib/actions/order-helpers"

export async function updatePaymentStatus(paymentId: string, status: PaymentStatus) {
  const supabase = createClient(cookies())

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (status === "succeeded" || status === "completed") {
    updates.processed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from("payments")
    .update(updates)
    .eq("id", paymentId)
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  if (data?.order_id) {
    const { data: orderRow } = await supabase
      .from("orders")
      .select("status")
      .eq("id", data.order_id)
      .single()

    const currentOrderStatus = (orderRow?.status || "pending") as OrderStatus
    const nextOrderStatus = mapPaymentToOrderStatus(status, currentOrderStatus)
    if (nextOrderStatus !== currentOrderStatus) {
      await supabase
        .from("orders")
        .update({ status: nextOrderStatus, updated_at: new Date().toISOString() })
        .eq("id", data.order_id)
    }
  }

  return { data, error: null }
}

export async function getAllPayments(filters?: {
  status?: PaymentStatus
  limit?: number
}) {
  const supabase = createClient(cookies())

  let query = supabase
    .from("payments")
    .select("*, orders(id, order_number, user_info, first_name, last_name, email, status, total_price)")
    .order("created_at", { ascending: false })

  if (filters?.status) query = query.eq("status", filters.status)
  if (filters?.limit) query = query.limit(filters.limit)

  const { data, error } = await query
  if (error) return { data: null, error: error.message }

  const payments = data || []
  for (const payment of payments) {
    if (!payment.stripe_payment_intent_id) continue
    if (payment.status === "cancelled" || payment.status === "failed" || payment.status === "refunded") continue

    const remoteStatus = await resolveStripeStatus(payment.stripe_payment_intent_id)
    if (!remoteStatus || remoteStatus === payment.status) continue

    const updates: Record<string, unknown> = {
      status: remoteStatus,
      updated_at: new Date().toISOString(),
    }
    if (
      (remoteStatus === "succeeded" || remoteStatus === "completed") &&
      !payment.processed_at
    ) {
      updates.processed_at = new Date().toISOString()
    }

    await supabase.from("payments").update(updates).eq("id", payment.id)
    payment.status = remoteStatus
    if (!payment.processed_at && updates.processed_at) {
      payment.processed_at = updates.processed_at as string
    }

    if (payment.order_id) {
      const currentOrderStatus = (payment.orders?.status || "pending") as OrderStatus
      const nextOrderStatus = mapPaymentToOrderStatus(remoteStatus, currentOrderStatus)
      if (nextOrderStatus !== currentOrderStatus) {
        await supabase
          .from("orders")
          .update({ status: nextOrderStatus, updated_at: new Date().toISOString() })
          .eq("id", payment.order_id)
        if (payment.orders) payment.orders.status = nextOrderStatus
      }
    }
  }

  return { data: payments, error: null }
}
