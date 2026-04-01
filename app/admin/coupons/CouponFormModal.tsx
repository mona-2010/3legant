"use client"

import { X, Check, Loader2 } from "lucide-react"
import { useCallback } from "react"

export type CouponForm = {
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  min_purchase_amount: number | null
  max_discount_amount: number | null
  max_uses: number | null
  valid_until: string
  is_active: boolean
}

export const emptyCouponForm: CouponForm = {
  code: "",
  discount_type: "percentage",
  discount_value: 0,
  min_purchase_amount: null,
  max_discount_amount: null,
  max_uses: null,
  valid_until: "",
  is_active: true,
}

type Props = {
  form: CouponForm
  setForm: (form: CouponForm) => void
  editingId: string | null
  saving: boolean
  onSave: () => void
  onClose: () => void
}

export default function CouponFormModal({ form, setForm, editingId, saving, onSave, onClose }: Props) {
  const sanitizeNumber = (value: string) => {
    if (value === "") return ""
    return value.replace(/^0+(?!$)/, "")
  }

  const handleNumberChange = (field: keyof CouponForm, value: string, isFloat = true) => {
    const sanitized = sanitizeNumber(value)
    const numValue = sanitized === "" ? null : (isFloat ? parseFloat(sanitized) : parseInt(sanitized))
    setForm({ ...form, [field]: numValue ?? "" })
  }

  const handleOptionalNumberChange = (field: keyof CouponForm, value: string, isFloat = true) => {
    const sanitized = sanitizeNumber(value)
    const numValue = sanitized === "" ? null : (isFloat ? parseFloat(sanitized) : parseInt(sanitized))
    setForm({ ...form, [field]: numValue })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{editingId ? "Edit Coupon" : "Add New Coupon"}</h2>
            <p className="text-sm text-gray-500 mt-1">Configure your discount code details below.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Coupon Code *</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all uppercase font-mono tracking-wider"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="Ex: SUMMER2026"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Discount Type</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_8px_center] bg-no-repeat"
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value as "percentage" | "fixed" })}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Value *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  {form.discount_type === "percentage" ? "%" : "$"}
                </span>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl pl-6 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                  value={form.discount_value === 0 && sanitizeNumber(form.discount_value.toString()) === "" ? "" : form.discount_value}
                  onChange={(e) => handleNumberChange("discount_value", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Min Purchase</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl pl-6 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                  value={form.min_purchase_amount ?? ""}
                  onChange={(e) => handleOptionalNumberChange("min_purchase_amount", e.target.value)}
                  placeholder="No minimum"
                  min={0}

                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Max Discount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl pl-6 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                  value={form.max_discount_amount ?? ""}
                  onChange={(e) => handleOptionalNumberChange("max_discount_amount", e.target.value)}
                  placeholder="No limit"
                  min={0}

                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Usage Limit</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                value={form.max_uses ?? ""}
                onChange={(e) => handleOptionalNumberChange("max_uses", e.target.value, false)}
                placeholder="Unlimited"
                min={0}

              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Expiry Date</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                value={form.valid_until}
                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group w-fit">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${form.is_active ? 'bg-black border-black' : 'border-gray-300 group-hover:border-gray-400'}`}>
              {form.is_active && <Check size={12} className="text-white" />}
            </div>
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="hidden" />
            <span className="text-sm font-medium text-gray-700">Status: {form.is_active ? 'Active' : 'Inactive'}</span>
          </label>
        </div>

        <div className="px-8 py-5 border-t bg-gray-50/50 flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || !form.code || !form.discount_value}
            className="px-8 py-2.5 bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-black/10 hover:shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : editingId ? "Update Coupon" : "Create Coupon"}
          </button>
        </div>
      </div>
    </div>
  )
}
