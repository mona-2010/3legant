"use client"

import { useEffect, useState } from "react"
import { getAdminDashboardStats } from "@/lib/actions/admin"
import { Package, ShoppingCart, DollarSign, Users } from "lucide-react"

type Stats = {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  recentOrders: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminDashboardStats().then((data) => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <p className="text-gray-500">Loading dashboard...</p>
  }

  if (!stats) return null

  const cards = [
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "bg-blue-50 text-blue-600" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "bg-green-50 text-green-600" },
    { label: "Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "bg-purple-50 text-purple-600" },
    { label: "Customers", value: stats.totalUsers, icon: Users, color: "bg-orange-50 text-orange-600" },
  ]

  return (
    <div className="space-y-7">
      <p className="text-center font-poppins font-semibold text-2xl block md:hidden">3legant.</p>
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">A quick snapshot of store activity and recent orders.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="text-3xl font-semibold mt-1 text-slate-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Orders</h2>
        {stats.recentOrders.length === 0 ? (
          <p className="text-slate-500 text-sm">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                  <th className="text-left py-3">Order ID</th>
                  <th className="text-left py-3">Date</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Items</th>
                  <th className="text-right py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-slate-100 text-sm hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-medium text-slate-900 ">#{order.id.slice(0, 8)}</td>
                    <td className="py-3 text-slate-600 ">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${order.status === "delivered" ? "bg-green-100 text-green-700" :
                          order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                            order.status === "cancelled" ? "bg-red-100 text-red-700" :
                              "bg-blue-100 text-blue-700"
                        }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-700">{order.order_items?.length || 0}</td>
                    <td className="py-3 text-right font-medium text-slate-900 ">${order.total_price?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
