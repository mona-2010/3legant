"use client"

import { OrderItem, OrderStatus, Payment } from "@/types"

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-600",
  succeeded: "bg-green-50 text-green-700",
  completed: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-600",
  cancelled: "bg-gray-50 text-gray-500",
  refunded: "bg-purple-50 text-purple-600",
}

type OrderItemWithProductStock = OrderItem & {
  products?: { stock?: number; is_active?: boolean } | null
}

type Props = {
  order: {
    id: string
    created_at: string
    status: OrderStatus
    subtotal: number
    shipping_cost: number
    discount: number
    total_price: number
    payment_method: string
    user_info?: any
    street_address?: string
    town_city?: string
    state?: string
    zip_code?: string
    country?: string
  }
  orderItems: OrderItemWithProductStock[]
  payment: Payment | undefined
  refundRequest: any
  refundStatus: string | null
  refundAdminNote: string
  refundAmount: string
  onRefundAdminNoteChange: (note: string) => void
  onRefundAmountChange: (amount: string) => void
  maxRefundAmount: number
  refundRate: number
  daysSinceOrder: number
  onRefundReview: (decision: "approve" | "reject") => void
  reviewingRefund: boolean
}

export default function OrderDetailPanel({
  order, orderItems, payment, refundRequest, refundStatus,
  refundAdminNote, refundAmount, onRefundAdminNoteChange, onRefundAmountChange,
  maxRefundAmount, refundRate, daysSinceOrder, onRefundReview, reviewingRefund,
}: Props) {
  const userInfo = order.user_info || {}
  const shipping = order.user_info?.shipping
  const customerFirstName = userInfo.first_name || userInfo.firstName || shipping?.first_name || shipping?.firstName || ""
  const customerLastName = userInfo.last_name || userInfo.lastName || shipping?.last_name || shipping?.lastName || ""
  const customerName = `${customerFirstName} ${customerLastName}`.trim() || "Guest"
  const customerEmail = userInfo.email || userInfo.emailAddress || ""
  const shippingLine = shipping
    ? `${shipping.street_address}, ${shipping.city}${shipping.state ? `, ${shipping.state}` : ""} ${shipping.zip_code || ""}, ${shipping.country}`
    : `${order.street_address || ""}, ${order.town_city || ""}${order.state ? `, ${order.state}` : ""} ${order.zip_code || ""}, ${order.country || ""}`

  return (
    <td colSpan={9} className="px-4 py-4">
      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
        <div>
          <p className="text-gray-500 font-medium mb-1">Customer</p>
          <p className="font-medium">{customerName}</p>
          <p className="text-xs text-gray-400">{customerEmail || "-"}</p>
        </div>
        <div>
          <p className="text-gray-500 font-medium mb-1">Shipping Address</p>
          <p>{shippingLine}</p>
        </div>
        <div>
          <p className="text-gray-500 font-medium mb-1">Order Breakdown</p>
          <p>Subtotal: ${Number(order.subtotal).toFixed(2)}</p>
          <p>Shipping: ${Number(order.shipping_cost).toFixed(2)}</p>
          {Number(order.discount) > 0 && <p>Discount: -${Number(order.discount).toFixed(2)}</p>}
          <p className="font-semibold mt-1">Total: ${Number(order.total_price).toFixed(2)}</p>
        </div>
        {payment && (
          <div>
            <p className="text-gray-500 font-medium mb-1">Payment Details</p>
            <p>Method: <span className="capitalize">{payment.payment_method}</span></p>
            <p>Status: <span className={`font-medium capitalize ${paymentStatusColors[payment.status]?.split(" ")[1] || ""}`}>{payment.status}</span></p>
            {payment.stripe_payment_intent_id && (
              <p className="font-mono text-xs text-gray-400 mt-1">PI: {payment.stripe_payment_intent_id.slice(0, 20)}…</p>
            )}
            {payment.processed_at && (
              <p className="text-xs text-gray-400">Processed: {new Date(payment.processed_at).toLocaleString()}</p>
            )}
          </div>
        )}
      </div>

      {orderItems.length > 0 && (
        <div>
          <p className="text-gray-500 text-sm font-medium mb-2">Items ({orderItems.length})</p>
          <div className="space-y-2">
            {orderItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded border text-sm">
                <div>
                  <span>{item.product_title} × {item.quantity}</span>
                  <p className="text-xs text-gray-500">
                    Remaining stock: {item.products?.stock ?? "-"}
                    {item.products?.stock === 0 && " (Out of stock)"}
                    {item.products?.is_active === false && " - Inactive"}
                  </p>
                </div>
                <span className="font-medium">${(Number(item.product_price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {refundRequest && (
        <div className="mt-4 rounded border bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Refund Request</p>
              <p className="text-xs text-gray-400 capitalize">Status: {refundStatus}</p>
            </div>
          </div>
          <p className="mt-3 text-xs uppercase tracking-wide text-gray-400">Reason</p>
          <p className="text-sm">{refundRequest.reason}</p>
          {refundRequest.admin_note && (
            <>
              <p className="mt-3 text-xs uppercase tracking-wide text-gray-400">Admin Note</p>
              <p className="text-sm">{refundRequest.admin_note}</p>
            </>
          )}
          {typeof refundRequest.refund_amount === "number" && (
            <>
              <p className="mt-3 text-xs uppercase tracking-wide text-gray-400">Refund Amount</p>
              <p className="text-sm">
                ${Number(refundRequest.refund_amount).toFixed(2)}
                {refundRequest.is_partial_refund ? " (Partial)" : " (Full)"}
              </p>
            </>
          )}
          {refundStatus === "pending" && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">
                Policy max after {daysSinceOrder} day(s): ${maxRefundAmount.toFixed(2)} ({Math.round(refundRate * 100)}%)
              </p>
              <input
                type="number"
                min="0"
                max={maxRefundAmount}
                step="0.01"
                value={refundAmount}
                onChange={(e) => onRefundAmountChange(e.target.value)}
                placeholder={`Refund amount (max $${maxRefundAmount.toFixed(2)})`}
                className="mb-3 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none"
              />
              <textarea
                value={refundAdminNote}
                onChange={(e) => onRefundAdminNoteChange(e.target.value)}
                placeholder="Optional admin note"
                className="min-h-24 w-full rounded border border-gray-300 p-3 text-sm outline-none"
              />
              <div className="mt-3 flex gap-3">
                <button onClick={() => onRefundReview("approve")} disabled={reviewingRefund} className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-60">
                  {reviewingRefund ? "Processing..." : "Approve and Refund"}
                </button>
                <button onClick={() => onRefundReview("reject")} disabled={reviewingRefund} className="rounded border border-gray-300 px-4 py-2 text-sm disabled:opacity-60">
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </td>
  )
}
