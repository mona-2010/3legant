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

type Props = {
  order: {
    id: string
    status: OrderStatus
    payment_method: string
    subtotal?: number
    shipping_cost?: number
    discount?: number
    total_price: number
    user_info?: any
    order_items: OrderItem[]
    payments: Payment[]
    created_at: string
  }
  refundReason: string
  onRefundReasonChange: (value: string) => void
  onRequestRefund: () => void
  requestingRefund: boolean
  onCancelOrder: () => void
  cancelling: boolean
  storeSettings: Record<string, any>
  isMobile?: boolean 
}

export default function OrderExpandedRow({ 
  order, 
  refundReason, 
  onRefundReasonChange, 
  onRequestRefund, 
  requestingRefund, 
  onCancelOrder,
  cancelling,
  storeSettings,
  isMobile 
}: Props) {
  const payment = order.payments?.[0]
  const paymentStatus = payment?.status || "pending"
  const refundRequest = order.user_info?.refund_request
  const refundStatus = refundRequest
    ? order.status === "refunded"
      ? "completed"
      : refundRequest.admin_decision || "pending"
    : null
  const shipping = order.user_info?.shipping
  const shippingLine = shipping
    ? `${shipping.street_address}, ${shipping.city}${shipping.state ? `, ${shipping.state}` : ""} ${shipping.zip_code || ""}, ${shipping.country}`
    : "Address not available"

  const cancellationRefundDays = Number(storeSettings.cancellation_refund_days || 3)
  const refundRequestDays = Number(storeSettings.refund_request_days || 30)

  const createdAt = new Date(order.created_at)
  const diffMs = Date.now() - createdAt.getTime()
  const daysSinceOrder = diffMs / (1000 * 60 * 60 * 24)

  const canCancel = ["pending", "processing"].includes(order.status)
  const isWithinCancellationRefund = daysSinceOrder <= cancellationRefundDays

  const canRequestRefund =
    (paymentStatus === "succeeded" || paymentStatus === "completed") &&
    !refundRequest &&
    order.status !== "cancelled" &&
    order.status !== "refunded" &&
    ["shipped", "delivered"].includes(order.status) &&
    daysSinceOrder <= refundRequestDays
  
  return (
    <div className="text-sm">
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-gray-500 font-medium mb-1">Shipping Address</p>
          <p>{shippingLine}</p>
        </div>
        <div>
          <p className="text-gray-500 font-medium mb-1">Payment Info</p>
          <p>Method: <span className="capitalize">{order.payment_method}</span></p>
          <p>
            Status:{" "}
            <span className={`font-medium capitalize ${paymentStatusColors[paymentStatus]?.split(" ")[1] || ""}`}>
              {paymentStatus}
            </span>
          </p>
          {payment?.processed_at && (
            <p className="text-xs text-gray-400 mt-1">
              Paid on {new Date(payment.processed_at).toLocaleDateString()}
            </p>
          )}
          {refundRequest && (
            <div className="mt-3 rounded border border-gray-100 bg-white p-3">
              <p className="text-gray-500 font-medium mb-1">Refund Request</p>
              <p className="text-xs uppercase tracking-wide text-gray-400">Status</p>
              <p className="capitalize font-medium">{refundStatus}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-gray-400">Reason</p>
              <p>{refundRequest.reason}</p>
              {typeof refundRequest.refund_amount === "number" && (
                <>
                  <p className="mt-2 text-xs uppercase tracking-wide text-gray-400">Refunded Amount</p>
                  <p>
                    ${Number(refundRequest.refund_amount).toFixed(2)}
                    {refundRequest.is_partial_refund ? " (Partial)" : " (Full)"}
                  </p>
                </>
              )}
              {refundRequest.admin_note && (
                <>
                  <p className="mt-2 text-xs uppercase tracking-wide text-gray-400">Admin Note</p>
                  <p>{refundRequest.admin_note}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {order.order_items && order.order_items.length > 0 && (
        <div>
          <p className="text-gray-500 font-medium mb-2">Order Breakdown</p>
          <div className="mb-4 space-y-1 rounded border border-lightgray bg-white px-3 py-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${Number(order.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">${Number(order.shipping_cost || 0).toFixed(2)}</span>
            </div>
            {Number(order.discount || 0) > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Coupon Discount</span>
                <span className="font-medium text-green-700">-${Number(order.discount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="mt-1 flex items-center justify-between border-t pt-1">
              <span className="text-gray-700 font-medium">Total</span>
              <span className="font-semibold">${Number(order.total_price || 0).toFixed(2)}</span>
            </div>
          </div>

          <p className="text-gray-500 font-medium mb-2">Items</p>
          <div className="space-y-1">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between bg-white border border-lightgray rounded px-3 py-2 text-xs">
                <span>
                  {item.product_title}
                  {item.product_color ? ` · ${item.product_color}` : ""} × {item.quantity}
                </span>
                <span className="font-medium">
                  ${(Number(item.product_price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {canCancel && (
        <div className="mt-4 p-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Cancel Order</p>
              <p className="text-xs text-gray-500">
                {isWithinCancellationRefund 
                  ? "Refund will be processed automatically." 
                  : `Cancellation window for refund has passed (${cancellationRefundDays} days).`}
              </p>
            </div>
            <button
              onClick={onCancelOrder}
              disabled={cancelling}
              className="rounded bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-60 hover:bg-red-700 transition"
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          </div>
        </div>
      )}

      {canRequestRefund && (
        <div className="mt-4 p-4 border-t border-gray-100">
          <p className="font-medium text-gray-700 mb-2">Request a refund</p>
          <textarea
            value={refundReason}
            onChange={(e) => onRefundReasonChange(e.target.value)}
            placeholder="Tell us why you want a refund"
            className="min-h-24 w-full rounded border border-gray-300 p-3 text-sm outline-none focus:ring-1 focus:ring-black transition"
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={onRequestRefund}
              disabled={requestingRefund}
              className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-60 hover:bg-slate-800 transition"
            >
              {requestingRefund ? "Submitting..." : "Request Refund"}
            </button>
          </div>
        </div>
      )}

      {!canRequestRefund && (order.status === "shipped" || order.status === "delivered") && !refundRequest && daysSinceOrder > refundRequestDays && (
         <div className="mt-4 p-4 border-t border-gray-100">
            <p className="text-gray-500 text-xs italic text-center">
              Refund request window has expired ({refundRequestDays} days after order placement).
            </p>
         </div>
      )}
    </div>
  )
}

