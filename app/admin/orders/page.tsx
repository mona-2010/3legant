"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { getAllOrders, updateOrderStatus } from "@/lib/actions/orders"
import { getStoreSettings } from "@/lib/actions/settings"
import { reviewRefundRequest } from "@/lib/actions/refunds"
import { getRefundPolicyForOrder } from "@/lib/refund-policy"
import { createClient } from "@/lib/supabase/client"
import { Order, OrderItem, OrderStatus, Payment } from "@/types"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react"
import { toast } from "react-toastify"
import OrderDetailPanel from "./OrderDetailPanel"

const ITEMS_PER_PAGE = 10
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const

const statusOptions: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-purple-100 text-purple-700",
}

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-600",
  succeeded: "bg-green-50 text-green-700",
  completed: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-600",
  cancelled: "bg-gray-50 text-gray-500",
  refunded: "bg-purple-50 text-purple-600",
}

const refundStatusColors: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  approved: "bg-blue-100 text-blue-700",
  rejected: "bg-gray-100 text-gray-600",
  completed: "bg-purple-100 text-purple-700",
}

type OrderItemWithProductStock = OrderItem & { products?: { stock?: number; is_active?: boolean } | null }
type OrderWithPayments = Order & { order_items: OrderItemWithProductStock[]; payments: Payment[] }

function getCustomerFromOrder(order: OrderWithPayments): { name: string; email: string } {
  const userInfo = (order.user_info || {}) as any
  const shipping = (userInfo.shipping || {}) as any

  const firstName =
    userInfo.first_name ||
    userInfo.firstName ||
    shipping.first_name ||
    shipping.firstName ||
    order.first_name ||
    ""

  const lastName =
    userInfo.last_name ||
    userInfo.lastName ||
    shipping.last_name ||
    shipping.lastName ||
    order.last_name ||
    ""

  const email =
    userInfo.email ||
    userInfo.email_address ||
    userInfo.emailAddress ||
    order.email ||
    ""

  const name = `${firstName} ${lastName}`.trim() || "Guest"
  return { name, email }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderWithPayments[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [refundAdminNote, setRefundAdminNote] = useState<Record<string, string>>({})
  const [refundAmount, setRefundAmount] = useState<Record<string, string>>({})
  const [reviewingRefundId, setReviewingRefundId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(ITEMS_PER_PAGE)
  const lastRealtimeEventKeyRef = useRef<string | null>(null)

  const [storeSettings, setStoreSettings] = useState<any>(null)

  const loadSettings = useCallback(async () => {
    const { data } = await getStoreSettings()
    if (data) setStoreSettings(data)
  }, [])

  const loadOrders = useCallback(async () => {
    const { data } = await getAllOrders({ status: (filterStatus || undefined) as OrderStatus | undefined })
    if (data) setOrders(data as OrderWithPayments[])
    setLoading(false)
  }, [filterStatus])

  const refreshOrdersNow = useCallback(() => {
    void loadOrders()
  }, [loadOrders])

  useEffect(() => {
    void loadSettings()
    void loadOrders()
  }, [loadOrders, loadSettings])

  useEffect(() => {
    setCurrentPage(1)
    setExpandedId(null)
  }, [filterStatus])

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    const { data } = await updateOrderStatus(orderId, status)
    if (data) setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: data.status } : o))
  }

  const handleRefundReview = async (orderId: string, decision: "approve" | "reject") => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return

    const rules = storeSettings?.refund_policy_rules || []
    const { maxRefundAmount } = getRefundPolicyForOrder(order.created_at, Number(order.total_price || 0), rules)
    const fallbackAmount = refundAmount[orderId] ?? maxRefundAmount.toFixed(2)
    const refundValue = Number(fallbackAmount)

    if (decision === "approve" && (!Number.isFinite(refundValue) || refundValue <= 0)) {
      toast.error("Please enter a valid refund amount.")
      return
    }

    if (decision === "approve") {
      if (refundValue > maxRefundAmount) {
        toast.error(`Refund amount exceeds policy max of $${maxRefundAmount.toFixed(2)}.`)
        return
      }
    }

    setReviewingRefundId(orderId)
    const { error } = await reviewRefundRequest(
      orderId,
      decision,
      refundAdminNote[orderId] || "",
      decision === "approve" ? refundValue : undefined,
    )
    setReviewingRefundId(null)
    if (error) { toast.error(error); return }
    toast.success(decision === "approve" ? "Refund processed" : "Refund rejected")
    loadOrders()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  const orderStatusSummary = statusOptions.map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }))

  const totalRevenue = orders.reduce((sum, order) => {
    const paymentStatus = order.payments?.[0]?.status || "pending"
    if (paymentStatus === "succeeded" || paymentStatus === "completed") {
      return sum + Number(order.total_price || 0)
    }
    return sum
  }, 0)

  const totalRefunded = orders.reduce((sum, order) => {
    const paymentStatus = order.payments?.[0]?.status || "pending"
    if (paymentStatus === "refunded") {
      return sum + Number(order.total_price || 0)
    }
    return sum
  }, 0)

  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedOrders = orders.slice((safePage - 1) * pageSize, safePage * pageSize)
  const startItem = orders.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endItem = Math.min(safePage * pageSize, orders.length)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-center lg:text-left font-semibold font-poppins tracking-tight text-slate-900">Orders</h1>
        <p className="text-sm text-center lg:text-left text-slate-500 mt-1">Monitor fulfillment, customer status, and refunds.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-4">
        {orderStatusSummary.map((item) => (
          <div key={`order-${item.status}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Order status</p>
            <div className="mt-2 flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[item.status]}`}>
                {item.status}
              </span>
              <span className="text-xl font-semibold text-slate-900">{item.count}</span>
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total revenue</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              Paid
            </span>
            <span className="text-sm md:text-md lg:text-xl font-semibold text-slate-900">${totalRevenue.toFixed(2)}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total refunded</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              Refunded
            </span>
            <span className="text-xs md:text-md lg:text-xl font-semibold text-slate-900">${totalRefunded.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <select value={filterStatus} onChange={(e) => {
          setCurrentPage(1)
          setFilterStatus(e.target.value)
        }} className="border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-300">
          <option value="">All Status</option>
          {statusOptions.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200 bg-slate-50/70">
                <th className="text-left py-3 px-4">Order ID</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-left py-3 px-4">Total</th>
                <th className="text-left py-3 px-4">Order Status</th>
                <th className="text-left py-3 px-4">Refund</th>
                <th className="text-left py-3 px-4">Payment Status</th>
                <th className="text-left py-3 px-4">Method</th>
                <th className="text-right py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => {
                const payment = order.payments?.[0]
                const paymentStatus = payment?.status || "pending"
                const customer = getCustomerFromOrder(order)
                const refundRequest = order.user_info?.refund_request
                const rules = storeSettings?.refund_policy_rules || []
                const { daysSinceOrder, refundRate, maxRefundAmount } = getRefundPolicyForOrder(order.created_at, Number(order.total_price || 0), rules)
                const refundStatus = refundRequest
                  ? order.status === "refunded" ? "completed" : refundRequest.admin_decision || "pending"
                  : null

                return (
                  <React.Fragment key={order.id}>
                    <tr className="border-b border-slate-100 text-sm hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">#{order.id.slice(0, 8)}</td>
                      <td className="py-3 px-4 text-slate-600">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900">{customer.name}</p>
                        <p className="text-xs text-slate-400">{customer.email || "-"}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">${Number(order.total_price).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-none outline-none cursor-pointer ${statusColors[order.status]}`}>
                          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        {refundStatus ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${refundStatusColors[refundStatus] || "bg-gray-100 text-gray-600"}`}>
                            {refundStatus === "pending" ? "Refund requested" : refundStatus}
                          </span>
                        ) : <span className="text-xs text-slate-400">No request</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${paymentStatusColors[paymentStatus] || "bg-gray-50 text-gray-500"}`}>{paymentStatus}</span>
                      </td>
                      <td className="py-3 px-4 capitalize text-xs text-slate-600">{order.payment_method}</td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)} className="text-slate-500 hover:text-slate-900">
                          {expandedId === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr className="bg-slate-50/80">
                        <OrderDetailPanel
                          order={order}
                          orderItems={order.order_items || []}
                          payment={payment}
                          refundRequest={refundRequest}
                          refundStatus={refundStatus}
                          refundAdminNote={refundAdminNote[order.id] || ""}
                          refundAmount={refundAmount[order.id] ?? maxRefundAmount.toFixed(2)}
                          onRefundAdminNoteChange={(note) => setRefundAdminNote(prev => ({ ...prev, [order.id]: note }))}
                          onRefundAmountChange={(amount) => setRefundAmount(prev => ({ ...prev, [order.id]: amount }))}
                          maxRefundAmount={maxRefundAmount}
                          refundRate={refundRate}
                          daysSinceOrder={daysSinceOrder}
                          onRefundReview={(decision) => handleRefundReview(order.id, decision)}
                          reviewingRefund={reviewingRefundId === order.id}
                        />
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
              {orders.length === 0 && (
                <tr><td colSpan={9} className="text-center py-12 text-slate-500">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {orders.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <p className="text-xs text-slate-500">Showing {startItem}-{endItem} of {orders.length}</p>
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setExpandedId(null)
                  setCurrentPage(1)
                  setPageSize(Number(e.target.value))
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size} / page</option>
                ))}
              </select>
              <button
                onClick={() => {
                  setExpandedId(null)
                  setCurrentPage((prev) => Math.max(1, prev - 1))
                }}
                disabled={safePage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 disabled:opacity-50"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="text-sm text-slate-600">Page {safePage} of {totalPages}</span>
              <button
                onClick={() => {
                  setExpandedId(null)
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }}
                disabled={safePage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 disabled:opacity-50"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
