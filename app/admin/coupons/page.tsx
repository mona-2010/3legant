"use client"

import { useEffect, useState } from "react"
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/lib/actions/coupons"
import { Coupon } from "@/types"
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import CouponFormModal, { CouponForm, emptyCouponForm } from "./CouponFormModal"

const ITEMS_PER_PAGE = 10
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CouponForm>(emptyCouponForm)
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(ITEMS_PER_PAGE)

  const loadCoupons = async () => {
    const { data } = await getCoupons()
    if (data) setCoupons(data)
    setLoading(false)
  }

  useEffect(() => { loadCoupons() }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyCouponForm)
    setIsModalOpen(true)
  }

  const openEdit = (coupon: Coupon) => {
    setEditingId(coupon.id)
    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_purchase_amount: coupon.min_purchase_amount ?? null,
      max_discount_amount: coupon.max_discount_amount ?? null,
      max_uses: coupon.max_uses ?? null,
      valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString().slice(0, 10) : "",
      is_active: coupon.is_active,
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      ...form,
      valid_from: new Date().toISOString(),
      valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
    }

    if (editingId) {
      const { data } = await updateCoupon(editingId, payload)
      if (data) setCoupons(prev => prev.map(c => c.id === data.id ? data : c))
    } else {
      const { data } = await createCoupon(payload)
      if (data) setCoupons(prev => [data, ...prev])
    }

    setSaving(false)
    setIsModalOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return
    const { error } = await deleteCoupon(id)
    if (!error) setCoupons(prev => prev.filter(c => c.id !== id))
  }

  if (loading) return <p className="text-gray-500">Loading coupons...</p>

  const totalPages = Math.max(1, Math.ceil(coupons.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedCoupons = coupons.slice((safePage - 1) * pageSize, safePage * pageSize)
  const startItem = coupons.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endItem = Math.min(safePage * pageSize, coupons.length)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold font-poppins tracking-tight text-slate-900">Coupons</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage promotional discounts.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-slate-800 transition-colors">
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200 bg-slate-50/70">
              <th className="text-left py-3 px-4">Code</th>
              <th className="text-left py-3 px-4">Discount</th>
              <th className="text-left py-3 px-4">Min Order</th>
              <th className="text-left py-3 px-4">Used</th>
              <th className="text-left py-3 px-4">Usage Limit</th>
              <th className="text-left py-3 px-4">Expires</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCoupons.map((coupon) => (
              <tr key={coupon.id} className="border-b border-slate-100 text-sm hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-slate-900">{coupon.code}</td>
                <td className="py-3 px-4">
                  {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                  {coupon.max_discount_amount && (
                    <span className="text-slate-400 text-xs ml-1">(max ${coupon.max_discount_amount})</span>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-700">{coupon.min_purchase_amount ? `$${coupon.min_purchase_amount}` : "—"}</td>
                <td className="py-3 px-4 text-slate-700">{coupon.current_uses ?? 0}</td>
                <td className="py-3 px-4 text-slate-700">{coupon.max_uses ?? "Unlimited"}</td>
                <td className="py-3 px-4 text-slate-700">{coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : "Never"}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${coupon.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {coupon.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => openEdit(coupon)} className="text-slate-500 hover:text-blue-600 mr-3"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(coupon.id)} className="text-slate-500 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan={8} className="text-center py-12 text-slate-500">No coupons yet.</td></tr>
            )}
          </tbody>
        </table>
        </div>
        {coupons.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <p className="text-xs text-slate-500">Showing {startItem}-{endItem} of {coupons.length}</p>
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

      {isModalOpen && (
        <CouponFormModal
          form={form}
          setForm={setForm}
          editingId={editingId}
          saving={saving}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}
