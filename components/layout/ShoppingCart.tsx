"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { RxCross2 } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store/store"
import { setShippingMethod } from "@/store/cartSlice"
import { CartItem, ShippingMethod } from "@/types/index"
import { buildShippingOptions, getShippingOptionPriceLabel } from "@/lib/shipping"
import { createClient } from "@/lib/supabase/client"
import CouponInput from "./CouponInput"
import TintedProductImage from "./TintedProductImage"
import { HiMinus, HiPlus } from "react-icons/hi"

interface Props {
  cartItems: CartItem[]
  updateQuantity: (id: string, type: "inc" | "dec") => Promise<void>
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  onCheckout: () => void
  removeItem: (id: string) => Promise<void>
}

export default function ShoppingCart({
  cartItems,
  updateQuantity,
  subtotal,
  shippingCost,
  discount,
  total,
  onCheckout,
  removeItem
}: Props) {

  const dispatch = useDispatch()
  const shippingMethod = useSelector(
    (state: RootState) => state.cart.shippingMethod
  )
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])

  useEffect(() => {
    const supabase = createClient()

    const loadShippingMethods = async () => {
      const { data } = await supabase.rpc("get_shipping_methods")
      if (!data || !Array.isArray(data)) return

      const methods = data
        .map((row) => (row as { method?: unknown }).method)
        .filter((method): method is ShippingMethod => typeof method === "string")

      setShippingMethods(methods)
    }

    loadShippingMethods()
  }, [])

  const shippingOptions = buildShippingOptions(
    shippingMethods.length > 0 ? shippingMethods : [shippingMethod]
  )
  const isCartEmpty = cartItems.length === 0
  const renderCartSummaryContent = (radioGroupName: string) => (
    <>
      <h2 className="font-semibold text-lg mb-6">
        Cart Summary
      </h2>
      <div className="space-y-3">
        {shippingOptions.map(option => (
          <label
            key={option.id}
            className="flex justify-between items-center border p-3 rounded cursor-pointer">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name={radioGroupName}
                checked={shippingMethod === option.method}
                onChange={() => dispatch(setShippingMethod(option.method))}
              />
              <span className="text-sm md:text-md">{option.name}</span>
            </div>

            <span className="font-medium">
              {getShippingOptionPriceLabel(option.method)}
            </span>
          </label>
        ))}

      </div>

      <div className="space-y-3 border-t pt-6 mt-6">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <button
        className="cursor-pointer bg-black text-white w-full py-3 mt-6 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onCheckout}
        disabled={isCartEmpty}
      >
        {isCartEmpty ? "Cart is empty" : "Checkout"}
      </button>
    </>
  )

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-[30px] md:px-[50px] lg:px-[80px] xl:px-[140px] py-2 md:py-6">
        <div className="lg:col-span-2">
          <div className="hidden md:grid grid-cols-[3fr_1fr_1fr_1fr] border-b border-lightgray text-gray-500 py-4 font-medium">
            <div>Product</div>
            <div className="text-center">Quantity</div>
            <div className="text-center">Price</div>
            <div className="text-right">Subtotal</div>
          </div>

          <div>
            {isCartEmpty ? (
              <div className="border border-lightgray rounded-lg p-6 mt-5 text-center">
                <p className="text-gray-600">Your cart is empty. Please add products to continue checkout.</p>
                <Link href="/shop" className="inline-block mt-4 bg-black text-white px-5 py-2 rounded">
                  Go to Shop
                </Link>
              </div>
            ) : (
              cartItems.map(item => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr_1fr] border-b border-lightgray py-5 md:py-6 gap-4 md:gap-0 items-center"
                >
                  <div className="flex gap-3 sm:gap-4 items-center">
                    <div className="relative w-[72px] h-[72px] sm:w-20 sm:h-20 bg-white">
                      <TintedProductImage
                        src={item.image}
                        alt={item.name}
                        fill
                        colorHex={item.color}
                        className="object-fit mix-blend-multiply"
                        sizes="80px"
                      />
                    </div>

                    <div>
                      <p className="font-semibold">
                        {item.name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Color: {item.color || "Default"}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="cursor-pointer flex gap-1 items-center text-gray-400 text-[14px] hover:text-black transition"
                      >
                        <RxCross2 />
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-start md:justify-center">
                    <div className="border flex w-fit px-3 py-1 rounded">
                      <button
                        onClick={() => updateQuantity(item.id, "dec")}
                        className="cursor-pointer"
                      >
                        <HiMinus size={12} />
                      </button>
                      <span className="px-4 text-lg">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, "inc")}
                        disabled={typeof item.stock === "number" && item.quantity >= item.stock}
                        className={typeof item.stock === "number" && item.quantity >= item.stock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      >
                        <HiPlus size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="text-left md:text-center">
                    <span className="md:hidden text-gray-400 mr-2">Price:</span>
                    ${item.price.toFixed(2)}
                  </div>

                  <div className="text-left md:text-right font-semibold">
                    <span className="md:hidden text-gray-400 mr-2">Subtotal:</span>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>

              ))
            )}
          </div>

        </div>

        <aside className="hidden lg:block border p-5 sm:p-6 rounded-lg h-fit lg:sticky lg:top-24">
          {renderCartSummaryContent("shipping-desktop")}
        </aside>
      </div>

      <div className="px-[30px] md:px-[50px] lg:px-[80px] xl:px-[140px] my-8 sm:my-10 leading-8 sm:leading-9">
        <h1 className="font-medium text-[21px]">
          Have a coupon?
        </h1>

        <h2 className="text-gray-400 text-[16px]">
          Add your code for an instant cart discount
        </h2>

        <div className="my-3 w-full sm:w-fit">
          <CouponInput subtotal={subtotal} showNotification={false} />
        </div>

        <aside className="lg:hidden border p-5 sm:p-6 rounded-lg h-fit mt-6">
          {renderCartSummaryContent("shipping-mobile")}
        </aside>
      </div>
    </>
  )
}