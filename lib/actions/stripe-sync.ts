import { createClient } from "@/lib/supabase/server"
import { OrderStatus, PaymentStatus } from "@/types"
import {
  PaymentRow,
  mapPaymentToOrderStatus,
  resolveStripeStatus,
} from "@/lib/actions/order-helpers"

export async function syncSinglePaymentWithStripe(
  supabase: ReturnType<typeof createClient>,
  payment: PaymentRow,
  currentOrderStatus: OrderStatus
): Promise<{ payment: PaymentRow; orderStatus: OrderStatus }> {
  if (!payment.stripe_payment_intent_id) return { payment, orderStatus: currentOrderStatus }

  // Avoid polling Stripe for terminal states that should not drift without a webhook.
  if (payment.status === "cancelled" || payment.status === "failed" || payment.status === "refunded") {
    return { payment, orderStatus: currentOrderStatus }
  }

  const remoteStatus = await resolveStripeStatus(payment.stripe_payment_intent_id)
  if (!remoteStatus) return { payment, orderStatus: currentOrderStatus }

  let nextPayment = payment
  if (remoteStatus !== payment.status) {
    const updates: Record<string, unknown> = { status: remoteStatus, updated_at: new Date().toISOString() }
    if ((remoteStatus === "succeeded" || remoteStatus === "completed") && !payment.processed_at) {
      updates.processed_at = new Date().toISOString()
    }

    const { data: updatedPayment } = await supabase.from("payments")
      .update(updates).eq("id", payment.id)
      .select("id, order_id, status, stripe_payment_intent_id, processed_at").single()

    if (updatedPayment) {
      nextPayment = updatedPayment as PaymentRow
    } else {
      nextPayment = {
        ...payment,
        status: remoteStatus,
        processed_at: payment.processed_at || ((remoteStatus === "succeeded" || remoteStatus === "completed") ? new Date().toISOString() : null),
      }
    }
  }

  const nextOrderStatus = mapPaymentToOrderStatus(nextPayment.status, currentOrderStatus)
  if (nextOrderStatus !== currentOrderStatus) {
    const orderUpdates: Record<string, unknown> = { status: nextOrderStatus, updated_at: new Date().toISOString() }
    if (nextOrderStatus === "delivered") orderUpdates.delivered_at = new Date().toISOString()
    await supabase.from("orders").update(orderUpdates).eq("id", payment.order_id)
  }

  return { payment: nextPayment, orderStatus: nextOrderStatus }
}

export async function syncOrderPaymentsWithStripe(
  supabase: ReturnType<typeof createClient>,
  orders: any[]
) {
  const syncedOrders: any[] = []

  for (const order of orders) {
    const payments = Array.isArray(order.payments) ? order.payments : order.payments ? [order.payments] : []
    if (payments.length === 0 || !payments[0]) {
      syncedOrders.push({ ...order, payments })
      continue
    }

    const payment = payments[0] as PaymentRow
    const { payment: syncedPayment, orderStatus } = await syncSinglePaymentWithStripe(
      supabase,
      payment,
      order.status as OrderStatus,
    )

    syncedOrders.push({
      ...order,
      status: orderStatus,
      payments: [{ ...payments[0], ...syncedPayment }, ...payments.slice(1)],
    })
  }

  return syncedOrders
}
