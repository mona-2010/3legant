"use client"

import React, { useEffect, useState } from "react"
import { getAllPayments, updatePaymentStatus } from "@/lib/actions/payments"
import { Payment, PaymentStatus } from "@/types"
import { ChevronLeft, ChevronRight } from "lucide-react"

const ITEMS_PER_PAGE = 10
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const

type PaymentWithOrder = Payment & {
  orders: {
    id: string
    order_number?: string
    first_name?: string
    last_name?: string
    email?: string
    user_info?: {
      first_name?: string
      last_name?: string
      email?: string
      firstName?: string
      lastName?: string
      emailAddress?: string
      shipping?: {
        first_name?: string
        last_name?: string
        firstName?: string
        lastName?: string
      }
    }
    status: string
    total_price: number
  } | null
}

const paymentStatusOptions: PaymentStatus[] = [
  "pending",
  "succeeded",
  "completed",
  "failed",
  "cancelled",
  "refunded",
]

const statusColors: Record<PaymentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  succeeded: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
  refunded: "bg-purple-100 text-purple-700",
}

function getCustomerFromPayment(payment: PaymentWithOrder): { name: string; email: string } {
  const order = payment.orders
  const userInfo = order?.user_info || {}
  const shipping = userInfo.shipping || {}

  const firstName =
    userInfo.first_name ||
    userInfo.firstName ||
    shipping.first_name ||
    shipping.firstName ||
    order?.first_name ||
    ""

  const lastName =
    userInfo.last_name ||
    userInfo.lastName ||
    shipping.last_name ||
    shipping.lastName ||
    order?.last_name ||
    ""

  const email =
    userInfo.email ||
    userInfo.emailAddress ||
    order?.email ||
    ""

  const name = `${firstName} ${lastName}`.trim() || "Guest"
  return { name, email }
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<PaymentWithOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [updating, setUpdating] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(ITEMS_PER_PAGE)

  const loadPayments = async () => {
    setLoading(true)
    const { data } = await getAllPayments({
      status: (filterStatus || undefined) as PaymentStatus | undefined,
    })
    if (data) setPayments(data as PaymentWithOrder[])
    setLoading(false)
  }

  useEffect(() => {
    loadPayments()
  }, [filterStatus])

  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus])

  const handleStatusChange = async (paymentId: string, status: PaymentStatus) => {
    setUpdating(paymentId)
    const { data } = await updatePaymentStatus(paymentId, status)
    if (data) {
      setPayments(prev =>
        prev.map(p => (p.id === paymentId ? { ...p, status: data.status } : p))
      )
    }
    setUpdating(null)
  }

  const paymentStatusSummary = paymentStatusOptions.map((status) => ({
    status,
    count: payments.filter((payment) => payment.status === status).length,
  }))

  const totalRevenue = payments.reduce((sum, payment) => {
    if (payment.status === "succeeded" || payment.status === "completed") {
      return sum + Number(payment.amount || 0)
    }
    return sum
  }, 0)

  const totalRefunded = payments.reduce((sum, payment) => {
    if (payment.status === "refunded") {
      return sum + Number(payment.amount || 0)
    }
    return sum
  }, 0)

  const totalPages = Math.max(1, Math.ceil(payments.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedPayments = payments.slice((safePage - 1) * pageSize, safePage * pageSize)
  const startItem = payments.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endItem = Math.min(safePage * pageSize, payments.length)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-center lg:text-left text-3xl font-semibold font-poppins tracking-tight text-slate-900">Payments</h1>
        <p className="text-center lg:text-left text-sm text-slate-500 mt-1">Track transactions and reconcile payment state.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-4">
        {paymentStatusSummary.map((item) => (
          <div key={`payment-${item.status}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Payment status</p>
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
            <span className="text-xs md:text-md lg:text-xl font-semibold text-slate-900">${totalRevenue.toFixed(2)}</span>
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
        <select
          value={filterStatus}
          onChange={(e) => {
            setCurrentPage(1)
            setFilterStatus(e.target.value)
          }}
          className="border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="">All Statuses</option>
          {paymentStatusOptions.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200 bg-slate-50/70">
                  <th className="text-left py-3 px-4">Payment ID</th>
                  <th className="text-left py-3 px-4">Order</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Method</th>
                  <th className="text-left py-3 px-4">Payment Status</th>
                  <th className="text-left py-3 px-4">Order Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Processed</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((payment) => (

                  <tr key={payment.id} className="border-b border-slate-100 text-sm hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">
                      #{payment.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      {payment.orders
                        ? `#${(payment.orders.order_number || payment.orders.id).slice(0, 8)}`
                        : "—"}
                    </td>
                    <td className="py-3 px-4">
                      {payment.orders ? (() => {
                        const customer = getCustomerFromPayment(payment)
                        return (
                          <div>
                            <p className="font-medium text-slate-900">{customer.name}</p>
                            <p className="text-xs text-slate-400">{customer.email || "-"}</p>
                          </div>
                        )
                      })() : "—"}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      ${Number(payment.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-700">{payment.payment_method}</td>
                    <td className="py-3 px-4">
                      <select
                        value={payment.status}
                        disabled={updating === payment.id}
                        onChange={(e) =>
                          handleStatusChange(payment.id, e.target.value as PaymentStatus)
                        }
                        className={`px-2 py-1 rounded-full text-xs font-medium border-none outline-none cursor-pointer disabled:opacity-60 ${statusColors[payment.status]}`}
                      >
                        {paymentStatusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      {payment.orders?.status ? (
                        <span className="capitalize text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-700">
                          {payment.orders.status}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {payment.processed_at
                        ? new Date(payment.processed_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-500">
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {payments.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
              <p className="text-xs text-slate-500">Showing {startItem}-{endItem} of {payments.length}</p>
              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
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
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={safePage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 disabled:opacity-50"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <span className="text-sm text-slate-600">Page {safePage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={safePage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 disabled:opacity-50"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
