"use client"

import { UseFormRegister, FieldErrors } from "react-hook-form"
import { FormData } from "./CheckOutForm"

type Props = {
  payment: "card" | "paypal" | undefined
  register: UseFormRegister<FormData>
  errors: FieldErrors<FormData>
  submitting: boolean
  isCartEmpty: boolean
}

export default function PaymentSection({ payment, register, errors, submitting, isCartEmpty }: Props) {
  return (
    <div className="border border-gray-200 rounded p-5">
      <h1 className="font-medium mb-5 text-[20px]">Payment</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <label
          className={`flex-1 flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${
            payment === "card" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-400"
          }`}
        >
          <input type="radio" value="card" {...register("payment", { required: "Select payment method" })} className="accent-black" />
          <span className="font-medium text-sm">Credit Card (Stripe)</span>
        </label>

        <label
          className={`flex-1 flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${
            payment === "paypal" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-400"
          }`}
        >
          <input type="radio" value="paypal" {...register("payment")} className="accent-blue-600" />
          <span className="font-medium text-sm text-[#003087]">PayPal</span>
        </label>
      </div>

      {errors.payment && <p className="text-red-500 text-sm mb-3">{errors.payment.message}</p>}

      {payment === "card" && (
        <div className="mt-2 border border-black/10 bg-black/5 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-2">You will be redirected to a secure Stripe payment page to complete your order.</p>
          <div className="flex items-center justify-center gap-4 text-gray-400">
            <span className="text-[24px]">💳</span>
            <span className="text-[24px]">🔒</span>
            <span className="text-[24px]">🛡️</span>
          </div>
        </div>
      )}

      {payment === "paypal" && (
        <div className="mt-2 bg-[#FFC439]/10 border border-[#FFC439] rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <span className="text-[#003087] font-bold text-xl">Pay</span>
            <span className="text-[#009cde] font-bold text-xl">Pal</span>
          </div>
          <p className="text-sm text-gray-600">You will be redirected to PayPal to complete your payment securely.</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || isCartEmpty}
        className="bg-black text-white py-4 mt-6 w-full rounded-lg disabled:opacity-60 font-medium text-lg transition-all hover:bg-gray-900"
      >
        {isCartEmpty
          ? "Cart is empty"
          : submitting
          ? "Redirecting..."
          : payment === "paypal" ? "Pay with PayPal" : payment === "card" ? "Pay with Stripe" : "Continue"}
      </button>
    </div>
  )
}
