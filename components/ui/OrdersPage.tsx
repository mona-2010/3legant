"use client"

import { Fragment, useCallback, useEffect, useRef, useState } from "react"
import { getAllOrders, cancelOrder } from "@/lib/actions/orders"
import { requestRefund } from "@/lib/actions/refunds"
import { getStoreSettings } from "@/lib/actions/settings"
import { createClient } from "@/lib/supabase/client"
import { Order, OrderItem, OrderStatus, Payment } from "@/types"
import { FaArrowDown, FaArrowUp } from "react-icons/fa"
import { toast } from "react-toastify"
import OrderExpandedRow from "./OrderExpandedRow"
import OrdersSkeleton from "../common/OrdersSkeleton"
import { AiOutlineLoading } from "react-icons/ai"
import { useAuth } from "@/components/providers/AuthProvider"

const orderStatusColors: Record<OrderStatus, string> = {
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

type OrderWithDetails = Order & {
  order_items: OrderItem[]
  payments: Payment[]
}

const ORDERS_PER_PAGE = 6

const OrdersPage = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [refundReasonByOrder, setRefundReasonByOrder] = useState<Record<string, string>>({})
  const [requestingRefundId, setRequestingRefundId] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("")
  const [dateFilter, setDateFilter] = useState<"all" | "7d" | "30d" | "90d">("all")
  const [storeSettings, setStoreSettings] = useState<Record<string, any>>({})
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const lastRealtimeEventKeyRef = useRef<string | null>(null)
  const settingsLoadedRef = useRef(false)
  const inFlightRequestKeyRef = useRef<string | null>(null)
  const lastCompletedRequestRef = useRef<{ key: string; at: number } | null>(null)
  const suppressRealtimeUntilRef = useRef(0)

  const loadOrders = useCallback(async (newOffset = 0) => {
    const requestKey = `${statusFilter}|${dateFilter}|${newOffset}`
    const now = Date.now()

    if (inFlightRequestKeyRef.current === requestKey) return
    if (
      lastCompletedRequestRef.current?.key === requestKey
      && now - lastCompletedRequestRef.current.at < 800
    ) {
      return
    }

    inFlightRequestKeyRef.current = requestKey

    const isLoadingMore = newOffset > 0
    if (isLoadingMore) setLoadingMore(true)
    else setLoading(true)

    const date = new Date()
    const dateAfter = (() => {
      switch (dateFilter) {
        case "7d":
          date.setDate(date.getDate() - 7)
          return date.toISOString()
        case "30d":
          date.setDate(date.getDate() - 30)
          return date.toISOString()
        case "90d":
          date.setDate(date.getDate() - 90)
          return date.toISOString()
        default:
          return null
      }
    })()

    const { data, count } = await getAllOrders({
      status: statusFilter || undefined,
      dateAfter: dateAfter || undefined,
      limit: ORDERS_PER_PAGE,
      offset: newOffset,
    })

    if (data) {
      if (isLoadingMore) {
        setOrders((prev) => [...prev, ...(data as OrderWithDetails[])])
      } else {
        setOrders(data as OrderWithDetails[])
      }
      setTotalCount(count || 0)
      setHasMore(newOffset + ORDERS_PER_PAGE < (count || 0))
    }

    if (isLoadingMore) setLoadingMore(false)
    else setLoading(false)

    inFlightRequestKeyRef.current = null
    lastCompletedRequestRef.current = { key: requestKey, at: Date.now() }
    // Ignore immediate echo events from server-side sync writes triggered during this fetch.
    suppressRealtimeUntilRef.current = Date.now() + 1200
  }, [dateFilter, statusFilter])

  const refreshOrdersNow = useCallback(() => {
    setOffset(0)
    void loadOrders(0)
  }, [loadOrders])

  useEffect(() => {
    if (settingsLoadedRef.current) return
    settingsLoadedRef.current = true

    getStoreSettings().then(({ data }) => {
      if (data) setStoreSettings(data)
    })
  }, [])

  useEffect(() => {
    setOffset(0)
    void loadOrders(0)
  }, [loadOrders])

  // useEffect(() => {
  //   if (!user?.id) return

  //   const supabase = createClient()
  //   let channel: Awaited<ReturnType<typeof supabase.channel>> | null = null
  //   let isMounted = true

  //   const initRealtime = async () => {
  //     if (!isMounted || !user) return

  //     const userId = user.id
  //     const handleRealtimeEvent = (payload: any) => {
  //       if (Date.now() < suppressRealtimeUntilRef.current) return

  //       const row = payload?.new ?? payload?.old ?? {}
  //       if (row?.user_id && row.user_id !== userId) return

  //       const eventKey = `${payload?.table || "unknown"}:${payload?.eventType || "*"}:${row?.id || "unknown"}:${row?.updated_at || ""}`
  //       if (lastRealtimeEventKeyRef.current === eventKey) return

  //       lastRealtimeEventKeyRef.current = eventKey
  //       refreshOrdersNow()
  //     }

  //     channel = supabase
  //       .channel(`orders-history-sync-${userId}`)
  //       .on(
  //         "postgres_changes",
  //         { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${userId}` },
  //         handleRealtimeEvent,
  //       )
  //       .on(
  //         "postgres_changes",
  //         { event: "*", schema: "public", table: "payments", filter: `user_id=eq.${userId}` },
  //         handleRealtimeEvent,
  //       )
  //       .subscribe()
  //   }

  //   void initRealtime()

  //   return () => {
  //     isMounted = false
  //     if (channel) {
  //       void supabase.removeChannel(channel)
  //     }
  //   }
  // }, [refreshOrdersNow, user?.id])

  const handleRefundRequest = async (orderId: string) => {
    const reason = refundReasonByOrder[orderId]?.trim() || ""
    if (!reason) { toast.error("Please enter a refund reason"); return }

    setRequestingRefundId(orderId)
    const { error } = await requestRefund(orderId, reason)
    setRequestingRefundId(null)

    if (error) { toast.error(error); return }

    toast.success("Refund request submitted")
    setRefundReasonByOrder((prev) => ({ ...prev, [orderId]: "" }))
    loadOrders(0)
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return

    setCancellingId(orderId)
    const { error } = await cancelOrder(orderId)
    setCancellingId(null)

    if (error) { toast.error(error); return }

    toast.success("Order cancelled successfully")
    loadOrders(0)
  }

  const handleShowMore = () => {
    const nextOffset = offset + ORDERS_PER_PAGE
    setOffset(nextOffset)
    loadOrders(nextOffset)
  }

  if (loading) return <OrdersSkeleton />

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-4">
        <h1 className="text-2xl font-[500]">Orders</h1>
        <div className="flex items-center gap-5">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as "all" | "7d" | "30d" | "90d")}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="py-8 text-center text-gray-500">No orders found.</p>
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:hidden">
            {orders.map((order) => {
              const paymentStatus = order.payments?.[0]?.status || "pending"
              const isExpanded = expandedId === order.id

              return (
                <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 transition"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-gray-500 truncate">
                          #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-800 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${orderStatusColors[order.status]}`}>
                          {order.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${paymentStatusColors[paymentStatus] || "bg-gray-50 text-gray-500"}`}>
                          {paymentStatus}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          ${Number(order.total_price).toFixed(2)}
                        </span>
                        <span className="text-gray-400 text-xs ml-1">
                          {isExpanded ? <FaArrowUp /> : <FaArrowDown />}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 sm:hidden">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${orderStatusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                      <OrderExpandedRow
                        order={order}
                        refundReason={refundReasonByOrder[order.id] || ""}
                        onRefundReasonChange={(v) =>
                          setRefundReasonByOrder((prev) => ({ ...prev, [order.id]: v }))
                        }
                        onRequestRefund={() => handleRefundRequest(order.id)}
                        requestingRefund={requestingRefundId === order.id}
                        onCancelOrder={() => handleCancelOrder(order.id)}
                        cancelling={cancellingId === order.id}
                        storeSettings={storeSettings}
                        isMobile
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="text-left py-4 pr-4">Order ID</th>
                  <th className="text-left py-4 pr-4">Date</th>
                  <th className="text-left py-4 pr-4">Order Status</th>
                  <th className="text-left py-4 pr-4">Payment</th>
                  <th className="text-left py-4 pr-4">Total</th>
                  <th className="text-left py-4 w-6"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const paymentStatus = order.payments?.[0]?.status || "pending"
                  const isExpanded = expandedId === order.id

                  return (
                    <Fragment key={order.id}>
                      <tr
                        className="border-b border-gray-200 text-sm cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      >
                        <td className="py-4 pr-4 font-mono text-xs text-gray-600">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="py-4 pr-4 whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${orderStatusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${paymentStatusColors[paymentStatus] || "bg-gray-50 text-gray-500"}`}>
                            {paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 pr-4 font-medium">
                          ${Number(order.total_price).toFixed(2)}
                        </td>
                        <td className="py-4 text-xs text-gray-400">
                          {isExpanded ? <FaArrowUp /> : <FaArrowDown />}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="px-4 py-4">
                            <OrderExpandedRow
                              order={order}
                              refundReason={refundReasonByOrder[order.id] || ""}
                              onRefundReasonChange={(v) =>
                                setRefundReasonByOrder((prev) => ({ ...prev, [order.id]: v }))
                              }
                              onRequestRefund={() => handleRefundRequest(order.id)}
                              requestingRefund={requestingRefundId === order.id}
                              onCancelOrder={() => handleCancelOrder(order.id)}
                              cancelling={cancellingId === order.id}
                              storeSettings={storeSettings}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-sm text-gray-600">
              Showing {orders.length} of {totalCount} orders
            </p>
            {hasMore && (
              <button
                onClick={handleShowMore}
                disabled={loadingMore}
                className="w-30 px-1 py-2.5 text-black border rounded-full hover:bg-black hover:text-white rounded-full font-medium text-sm transition flex items-center justify-center gap-2"
              >
                {loadingMore ? (
                  <AiOutlineLoading className="animate-spin" />
                ) : (
                  "Show More"
                )}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default OrdersPage