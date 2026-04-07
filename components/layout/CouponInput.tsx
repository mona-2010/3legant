"use client"

import { useState, useCallback } from "react"
import { RiCoupon4Line } from "react-icons/ri"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/store/store"
import { applyCoupon, removeCoupon } from "@/store/cartSlice"
import { validateCoupon } from "@/lib/actions/coupons"
import { useCouponUpdates, type SuggestedCouponType } from "@/lib/hooks"
import { calculateDiscountAmount } from "@/lib/coupons"

type SuggestedCoupon = {
  coupon: {
    id: string
    code: string
    discount_type: "percentage" | "fixed"
    discount_value: number
  }
  amountNeeded: number
  estimatedDiscount: number
  isEligible: boolean
}

export default function CouponInput({ subtotal }: { subtotal: number }) {
  const dispatch = useDispatch<AppDispatch>()
  const appliedCoupon = useSelector((state: RootState) => state.cart.appliedCoupon)
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestedCoupon[]>([])

  const handleNewCoupons = useCallback((newSuggestions: SuggestedCouponType[]) => {
    setSuggestions(newSuggestions as SuggestedCoupon[])
  }, [])

  const handleCouponStatusChange = useCallback((updatedSuggestions: SuggestedCouponType[]) => {
    setSuggestions(updatedSuggestions as SuggestedCoupon[])
  }, [])

  const couponMonitor = useCouponUpdates({
    enabled: !appliedCoupon && subtotal > 0,
    subtotal,
    showNotification: true,
    debug: false,
    onNewCoupons: handleNewCoupons,
    onCouponStatusChange: handleCouponStatusChange,
  })

  const displaySuggestions = couponMonitor.suggestions.length > 0
    ? (couponMonitor.suggestions as SuggestedCoupon[])
    : suggestions

  const handleApply = async (overrideCode?: string) => {
    const trimmed = (overrideCode ?? code).trim()
    if (!trimmed) return

    setError(null)
    setLoading(true)

    const { data, error: err } = await validateCoupon(trimmed, subtotal)

    if (err || !data) {
      setError(err || "Invalid coupon")
      setLoading(false)
      return
    }

    dispatch(applyCoupon({ coupon: data.coupon, discount: data.discount }))
    setCode("")
    setLoading(false)
  }

  const handleRemove = () => {
    dispatch(removeCoupon())
    setError(null)
  }

  return (
    <div>
      {!appliedCoupon ? (
        <>
          <div className="flex border border-gray-200 rounded overflow-hidden">
            <div className="flex items-center gap-2 flex-1 px-3">
              <RiCoupon4Line className="text-gray-400" />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                placeholder="Input"
                className="py-3 w-full focus:outline-none text-sm"
                disabled={loading}
              />
            </div>
            <button
              onClick={() => handleApply()}
              disabled={loading || !code.trim()}
              className="cursor-pointer bg-black text-white px-6 py-3 text-sm font-medium disabled:opacity-50 rounded-r"
            >
              {loading ? "..." : "Apply"}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

          <div className="mt-3 space-y-2">
            <p className="text-xs text-gray-500">Available coupons (eligible or within $10 of min order)</p>

            {displaySuggestions.length === 0 && (
              <p className="text-xs text-gray-500">No active coupons available</p>
            )}

            {displaySuggestions.length > 0 && (
              <div className="space-y-2">
                {displaySuggestions.map((suggestion) => (
                  <div
                    key={suggestion.coupon.id}
                    className="flex items-center justify-between gap-3 border border-gray-200 rounded px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{suggestion.coupon.code}</p>
                      <p className="text-xs text-gray-500">
                        Save up to ${suggestion.estimatedDiscount.toFixed(2)}
                        {suggestion.isEligible ? " - Ready" : ` - Add $${suggestion.amountNeeded.toFixed(2)} more`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApply(suggestion.coupon.code)}
                      disabled={loading || !suggestion.isEligible}
                      className="cursor-pointer border border-black text-black px-3 py-1.5 text-xs font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <RiCoupon4Line className="text-gray-500" />
            <span className="text-sm font-medium">{appliedCoupon.coupon.code}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-sm font-medium">
              -${calculateDiscountAmount(appliedCoupon.coupon, subtotal).toFixed(2)}
            </span>
            <button
              onClick={handleRemove}
              className="cursor-pointer text-emerald-500 text-sm font-medium hover:underline"
            >
              [Remove]
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
