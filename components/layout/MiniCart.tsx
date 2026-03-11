"use client"

import Link from "next/link"
import Image from "next/image"
import { RxCross2 } from "react-icons/rx"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/store/store"
import {
  setCart,
  increaseQty,
  decreaseQty,
  removeFromCart,
  clearCart
} from "@/store/cartSlice"
import { createClient } from "@/lib/supabase/client"
import { fetchCart } from "@/lib/cart/fetchCart"

interface Props {
  cartOpen: boolean
  setCartOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function CartPopup({ cartOpen, setCartOpen }: Props) {
  const supabase = createClient()
  const dispatch = useDispatch<AppDispatch>()

  const cartItems = useSelector((state: RootState) => state.cart.items)
  const shippingMethod = useSelector((state: RootState) => state.cart.shippingMethod)

  useEffect(() => {
    const loadCart = async () => {
      const items = await fetchCart()
      dispatch(setCart(items))
    }
    loadCart()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event) => {

      if (event === "SIGNED_OUT") {
        dispatch(clearCart())
      }

      if (event === "SIGNED_IN") {
        const items = await fetchCart()
        dispatch(setCart(items))
      }

    })
    return () => subscription.unsubscribe()

  }, [])

  const updateQuantity = async (id: string, type: "inc" | "dec") => {

    const item = cartItems.find(i => i.id === id)
    if (!item) return

    const newQty = type === "inc"
      ? item.quantity + 1
      : item.quantity - 1

    if (newQty <= 0) {
      removeItem(id)
      return
    }

    await supabase
      .from("cart")
      .update({ quantity: newQty })
      .eq("id", id)

    if (type === "inc") dispatch(increaseQty(id))
    else dispatch(decreaseQty(id))
  }

  const removeItem = async (id: string) => {

    await supabase
      .from("cart")
      .delete()
      .eq("id", id)

    dispatch(removeFromCart(id))
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const shippingCost =
    shippingMethod === "express"
      ? 15
      : shippingMethod === "pickup"
        ? subtotal * 0.21
        : 0

  const total = subtotal + shippingCost

  return (
    <>
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[90]"
          onClick={() => setCartOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[90%] max-w-[400px] bg-white z-[100]
        shadow-[-5px_0_15px_rgba(0,0,0,0.05)] transform transition-transform duration-300 flex flex-col
        ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
      >

        <div className="p-6 flex justify-between items-center">
          <h2 className="text-[24px] font-medium">Cart</h2>
          <RxCross2
            className="text-[24px] cursor-pointer"
            onClick={() => setCartOpen(false)}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 flex flex-col gap-6">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">
              Your cart is empty.
            </p>

          ) : (

            cartItems.map(item => (
              <div
                key={item.id}
                className="flex items-start gap-4 border-b pb-6"
              >

                <div className="w-[80px] h-[96px] bg-gray-100 relative flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-[14px] font-medium">
                        {item.name}
                      </h3>
                      <p className="text-[12px] text-gray-500 mt-1">
                        Color: {item.color}
                      </p>

                    </div>
                    <p className="text-[14px] font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>

                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center border rounded-md px-3 py-1">
                      <button onClick={() => updateQuantity(item.id, "dec")}>−</button>
                      <span className="mx-4 text-[14px]">
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQuantity(item.id, "inc")}>+</button>
                    </div>
                    <RxCross2
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ))

          )}

        </div>

        <div className="p-6 mt-auto">

          <div className="flex justify-between text-[14px] mb-3">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-[14px] mb-3">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">${shippingCost.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-[20px] font-medium mb-6">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <Link
            href="/cart"
            className="block w-full text-center bg-black text-white py-3 rounded-lg font-medium"
            onClick={() => setCartOpen(false)}
          >
            Checkout
          </Link>

          <div className="mt-4 text-center">
            <Link
              href="/cart"
              className="text-[14px] font-medium border-b border-black pb-[1px]"
              onClick={() => setCartOpen(false)}
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}